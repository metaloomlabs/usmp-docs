import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SearchHighlight } from '../components/navigation/search-highlight'
import {
  escapeHtml,
  escapeRegex,
  highlight,
  type SearchDocument,
  searchDocuments,
  tokenizeHighlight,
} from '../lib/search'

const mockSecDocuments: SearchDocument[] = [
  {
    slug: '/docs/sec-html',
    title: 'HTML & Script Elements Guide',
    description: 'Documentation for handling <script> and <span> tags safely.',
    _searchMeta: {
      cleanContent:
        'Developers should never use raw <script>alert(1)</script> tags. Use proper span elements with class names like class="highlight". Comparison: 10 < 20 & 30 > 20.',
      headings: ['Script Security', 'Span and Class Usage'],
      keywords: ['script', 'span', 'class', 'html', 'alert'],
    },
  },
  {
    slug: '/docs/sec-unicode',
    title: 'Unicode & Metacharacters',
    description: 'Testing latency under 200 µs with special regex characters.',
    _searchMeta: {
      cleanContent:
        'Latency benchmarks achieve 200 µs response time on ESP32 in München. Supports C++ and pointers like *ptr and [array] syntax with (parentheses) & {braces}.',
      headings: ['Benchmarks', 'Syntax Support'],
      keywords: ['unicode', 'benchmarks', 'latency', 'esp32'],
    },
  },
]

describe('P3 Batch 3 Phase 1: Search Security & Safe Highlighting Regression Tests', () => {
  describe('Tokenization & Business Logic (tokenizeHighlight)', () => {
    it('handles search terms containing HTML tags as literal text', () => {
      const tokens = tokenizeHighlight('Use <script> tags for javascript', '<script>')
      assert.equal(tokens.length, 3)
      assert.deepEqual(tokens[0], { text: 'Use ', isMatch: false })
      assert.deepEqual(tokens[1], { text: '<script>', isMatch: true })
      assert.deepEqual(tokens[2], { text: ' tags for javascript', isMatch: false })
    })

    it('handles search terms containing attributes', () => {
      const tokens = tokenizeHighlight('Apply class="highlight" to target', 'class="highlight"')
      assert.equal(tokens.length, 3)
      assert.deepEqual(tokens[0], { text: 'Apply ', isMatch: false })
      assert.deepEqual(tokens[1], { text: 'class="highlight"', isMatch: true })
      assert.deepEqual(tokens[2], { text: ' to target', isMatch: false })
    })

    it('safely highlights terms such as span, class, and script without tag corruption', () => {
      const tokens = tokenizeHighlight(
        'USMP class and span elements with script',
        'span class script'
      )
      const matchedTexts = tokens.filter((t) => t.isMatch).map((t) => t.text)
      assert.deepEqual(matchedTexts, ['class', 'span', 'script'])
    })

    it('handles regex special characters safely without syntax errors or injection', () => {
      const specialQuery = '.*+?^${}()|[]\\'
      assert.doesNotThrow(() => {
        const tokens = tokenizeHighlight('Syntax symbols: .*+?^${}()|[]\\ in code', specialQuery)
        assert.ok(Array.isArray(tokens))
      })
    })

    it('resolves repeated and overlapping search terms prioritizing longer matches', () => {
      // Overlapping terms: 'install' and 'installation'
      const tokens = tokenizeHighlight('USMP installation guide', 'install installation')
      assert.equal(tokens.length, 3)
      assert.deepEqual(tokens[0], { text: 'USMP ', isMatch: false })
      assert.deepEqual(tokens[1], { text: 'installation', isMatch: true })
      assert.deepEqual(tokens[2], { text: ' guide', isMatch: false })

      // Repeated terms: deduplicated case-insensitively
      const repeatedTokens = tokenizeHighlight('Testing test procedure', 'test TEST test')
      const matches = repeatedTokens.filter((t) => t.isMatch).map((t) => t.text)
      assert.deepEqual(matches, ['Test', 'test'])
    })

    it('handles Unicode search terms correctly', () => {
      const tokens = tokenizeHighlight('Latency 200 µs in München', 'µs München')
      const matches = tokens.filter((t) => t.isMatch).map((t) => t.text)
      assert.deepEqual(matches, ['µs', 'München'])
    })
  })

  describe('React DOM Highlighting (<SearchHighlight />)', () => {
    it('renders text nodes and spans safely via React DOM without HTML injection', () => {
      const xssSnippet = '<img src=x onerror=alert(1)>'
      const domOutput = renderToStaticMarkup(
        React.createElement(SearchHighlight, { text: xssSnippet, query: 'alert' })
      )

      // Verified: React renders text nodes, escaping all angle brackets into entities
      assert.ok(!domOutput.includes('<img'))
      assert.ok(domOutput.includes('&lt;img src=x onerror='))
      assert.ok(domOutput.includes('<span class="highlight">alert</span>'))
      assert.ok(domOutput.includes('(1)&gt;'))
    })

    it('prevents script execution when search query or document snippet contains <script>', () => {
      const snippetWithScript = 'Warning: <script>alert("pwned")</script> inside documentation'
      const domOutput = renderToStaticMarkup(
        React.createElement(SearchHighlight, { text: snippetWithScript, query: 'script' })
      )

      // Must never render an executable <script> element
      assert.ok(!domOutput.includes('<script>'))
      assert.ok(!domOutput.includes('</script>'))
      assert.ok(domOutput.includes('&lt;<span class="highlight">script</span>&gt;'))
      assert.ok(domOutput.includes('&lt;/<span class="highlight">script</span>&gt;'))
    })

    it('renders terms "span" and "class" without tag corruption (No Double Highlighting)', () => {
      const text = 'USMP span class elements'
      const domOutput = renderToStaticMarkup(
        React.createElement(SearchHighlight, { text, query: 'span class' })
      )

      // Must never produce malformed tags like <<span class="highlight">span</span>...
      assert.ok(!domOutput.includes('<<span'))
      assert.ok(!domOutput.includes('class="highlight">span</span> class='))
      assert.equal(
        domOutput,
        'USMP <span class="highlight">span</span> <span class="highlight">class</span> elements'
      )
    })

    it('correctly renders multiple highlighted matches in a single snippet', () => {
      const text = 'USMP supports ESP32, Arduino, and Python.'
      const domOutput = renderToStaticMarkup(
        React.createElement(SearchHighlight, { text, query: 'esp32 arduino python' })
      )

      assert.equal(
        domOutput,
        'USMP supports <span class="highlight">ESP32</span>, <span class="highlight">Arduino</span>, and <span class="highlight">Python</span>.'
      )
    })

    it('handles special characters <, >, &, quotes, and brackets in rendered DOM', () => {
      const text = 'Compare 10 < 20 & "quoted" \'text\' with [brackets]'
      const domOutput = renderToStaticMarkup(
        React.createElement(SearchHighlight, { text, query: 'quoted brackets' })
      )

      assert.ok(
        domOutput.includes(
          '10 &lt; 20 &amp; &quot;<span class="highlight">quoted</span>&quot; &#x27;text&#x27; with [<span class="highlight">brackets</span>]'
        )
      )
    })
  })

  describe('End-to-End Search Data Flow (searchDocuments)', () => {
    it('produces clean plain-text snippets without embedded HTML tags', () => {
      const results = searchDocuments('span class', mockSecDocuments)
      assert.ok(results.length > 0)
      const topResult = results[0]

      // Snippet must be clean plain text, eliminating pre-highlighting and double-highlighting
      assert.ok(topResult.snippet)
      assert.ok(!topResult.snippet.includes('<span'))
      assert.ok(!topResult.snippet.includes("class='highlight'"))

      // When rendered through SearchHighlight, it generates valid, uncorrupted DOM
      const rendered = renderToStaticMarkup(
        React.createElement(SearchHighlight, { text: topResult.snippet, query: 'span class' })
      )
      assert.ok(!rendered.includes('<<span'))
      assert.ok(rendered.includes('<span class="highlight">span</span>'))
      assert.ok(rendered.includes('<span class="highlight">class</span>'))
    })

    it('preserves search ranking and relevance scoring across special characters', () => {
      const results = searchDocuments('µs München', mockSecDocuments)
      assert.ok(results.length > 0)
      assert.equal(results[0].title, 'Unicode & Metacharacters')
      assert.ok(results[0].relevance > 0)
    })
  })

  describe('Backward Compatibility Helper (highlight)', () => {
    it('escapes HTML entities in highlight() to prevent Stored XSS for external callers', () => {
      const dangerousInput = '<img src=x onerror=alert(1)>'
      const output = highlight(dangerousInput, 'alert')

      assert.ok(!output.includes('<img'))
      assert.ok(output.includes('&lt;img'))
      assert.ok(output.includes("<span class='highlight'>alert</span>"))
    })
  })
})
