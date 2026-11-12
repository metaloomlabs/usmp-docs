import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'

import {
  ALLOWED_SVG_ATTRIBUTES,
  ALLOWED_SVG_TAGS,
  DISALLOWED_SVG_TAGS,
  decodeCssEscapes,
  decodeXmlEntities,
  getNormalizedTagName,
  isSafeAnchorUrl,
  isUnsafeAttribute,
  isUnsafeUri,
  normalizeChart,
  parseAndSanitizeDeclarations,
  SVG_NAMESPACE,
  sanitizeCss,
  sanitizeCssValue,
  sanitizeSvg,
  sanitizeSvgElement,
  stripCssComments,
} from '../components/markdown/mermaid'

interface MockDomNode {
  tagName: string
  localName?: string
  namespaceURI?: string | null
  attributes: Array<{ name: string; value: string }>
  children: MockDomNode[]
  parent: MockDomNode | null
  textContent: string
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
  querySelectorAll(selector: string): MockDomNode[]
  remove(): void
  replaceChildren(...nodes: unknown[]): void
}

function createMockElement(
  tagName: string,
  attrs: Record<string, string> = {},
  textContent = '',
  namespaceURI?: string | null
): MockDomNode {
  const actualNs = arguments.length >= 4 ? namespaceURI : SVG_NAMESPACE
  const el: MockDomNode = {
    tagName: tagName.toUpperCase(),
    localName: tagName.toLowerCase(),
    namespaceURI: actualNs,
    attributes: Object.entries(attrs).map(([name, value]) => ({ name, value })),
    children: [],
    parent: null,
    textContent,
    getAttribute(name: string) {
      const found = this.attributes.find((a) => a.name.toLowerCase() === name.toLowerCase())
      return found ? found.value : null
    },
    setAttribute(name: string, value: string) {
      const idx = this.attributes.findIndex((a) => a.name.toLowerCase() === name.toLowerCase())
      if (idx >= 0) {
        this.attributes[idx].value = value
      } else {
        this.attributes.push({ name, value })
      }
    },
    removeAttribute(name: string) {
      this.attributes = this.attributes.filter((a) => a.name.toLowerCase() !== name.toLowerCase())
    },
    querySelectorAll(selector: string) {
      const results: MockDomNode[] = []
      function walk(node: MockDomNode) {
        for (const child of node.children) {
          if (selector === '*' || child.tagName.toLowerCase() === selector.toLowerCase()) {
            results.push(child)
          }
          walk(child)
        }
      }
      walk(this)
      return results
    },
    remove() {
      if (this.parent) {
        this.parent.children = this.parent.children.filter((c) => c !== this)
        this.parent = null
      }
    },
    replaceChildren(..._nodes: unknown[]) {
      this.children = []
      this.textContent = ''
    },
  }
  return el
}

function appendChild(parent: MockDomNode, child: MockDomNode): MockDomNode {
  child.parent = parent
  parent.children.push(child)
  return child
}

describe('P3 Batch 3 Phase 2: Mermaid SVG Security & Sanitizer Regression Tests', () => {
  describe('Fail-Closed sanitizeSvg() Environment Handling', () => {
    it('returns empty string when DOMParser or XMLSerializer is unavailable in Node (fail closed)', () => {
      const maliciousSvg = '<svg><script>alert(1)</script></svg>'
      const result = sanitizeSvg(maliciousSvg)
      assert.equal(
        result,
        '',
        'sanitizeSvg must fail closed and return empty string instead of unsanitized SVG'
      )
    })

    it('returns empty string for null, undefined, non-string, or empty input', () => {
      assert.equal(sanitizeSvg(''), '')
      assert.equal(sanitizeSvg(undefined as unknown as string), '')
      assert.equal(sanitizeSvg(null as unknown as string), '')
    })
  })

  describe('Strict Namespace Validation (SVG_NAMESPACE)', () => {
    it('defines the standard W3C SVG namespace URI', () => {
      assert.equal(SVG_NAMESPACE, 'http://www.w3.org/2000/svg')
    })

    it('rejects root element if its namespaceURI is null', () => {
      const root = createMockElement('svg', {}, '', null)
      appendChild(root, createMockElement('rect', { width: '10' }))

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.children.length, 0, 'Null-namespace root must be cleared')
    })

    it('rejects root element if its namespaceURI is undefined', () => {
      const root = createMockElement('svg', {}, '', undefined)
      appendChild(root, createMockElement('rect', { width: '10' }))

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.children.length, 0, 'Undefined-namespace root must be cleared')
    })

    it('rejects root element if its namespaceURI is foreign (e.g. XHTML)', () => {
      const root = createMockElement('svg', {}, '', 'http://www.w3.org/1999/xhtml')
      appendChild(root, createMockElement('rect', { width: '10' }))

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.children.length, 0, 'Foreign namespace root must be cleared')
    })

    it('rejects descendant elements with null namespaceURI', () => {
      const root = createMockElement('svg')
      const validRect = appendChild(root, createMockElement('rect', { id: 'valid' }))
      const nullNsChild = appendChild(root, createMockElement('g', { id: 'null-ns' }, '', null))

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.children.includes(validRect), true)
      assert.equal(
        root.children.includes(nullNsChild),
        false,
        'Null-namespace descendant must be removed'
      )
    })

    it('rejects descendant elements with undefined namespaceURI', () => {
      const root = createMockElement('svg')
      const validRect = appendChild(root, createMockElement('rect', { id: 'valid' }))
      const undefNsChild = appendChild(
        root,
        createMockElement('g', { id: 'undef-ns' }, '', undefined)
      )

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.children.includes(validRect), true)
      assert.equal(
        root.children.includes(undefNsChild),
        false,
        'Undefined-namespace descendant must be removed'
      )
    })

    it('rejects descendant elements with foreign namespaces even if their local name is in allowlist', () => {
      const root = createMockElement('svg')
      const validRect = appendChild(root, createMockElement('rect', { id: 'valid-rect' }))
      const foreignStyle = appendChild(
        root,
        createMockElement('style', {}, 'body { color: red; }', 'http://www.w3.org/1999/xhtml')
      )
      const foreignAnchor = appendChild(
        root,
        createMockElement(
          'a',
          { href: 'https://evil.com' },
          'link',
          'http://www.w3.org/1998/Math/MathML'
        )
      )
      const customNsElement = appendChild(
        root,
        createMockElement('g', { id: 'custom-ns' }, '', 'http://evil.com/ns')
      )

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(root.children.includes(validRect), true, 'Valid SVG rect must be preserved')
      assert.equal(root.children.includes(foreignStyle), false, 'XHTML style must be removed')
      assert.equal(root.children.includes(foreignAnchor), false, 'MathML anchor must be removed')
      assert.equal(
        root.children.includes(customNsElement),
        false,
        'Custom NS element must be removed'
      )
    })
  })

  describe('CSS Parsing, Escape Decoding, and Sanitization', () => {
    it('decodes CSS hex escape sequences correctly', () => {
      assert.equal(decodeCssEscapes('\\65xpression'), 'expression')
      assert.equal(decodeCssEscapes('\\40import'), '@import')
      assert.equal(decodeCssEscapes('b\\65havior'), 'behavior')
      assert.equal(decodeCssEscapes('\\6a avascript'), 'javascript')
      assert.equal(decodeCssEscapes('u\\72l'), 'url')
    })

    it('strips CSS comments while preserving strings (stripCssComments)', () => {
      assert.equal(stripCssComments('color:/*red*/blue;'), 'color: blue;')
      assert.equal(
        stripCssComments('content: "/*not a comment*/";'),
        'content: "/*not a comment*/";'
      )
      assert.equal(stripCssComments('color: red; /* unclosed'), 'color: red; ')
    })

    it('neutralizes escaped url identifiers (u\\72l)', () => {
      const css = '.a { background: u\\72l(https://evil.com); marker: u\\72l(#arrow); }'
      const cleaned = sanitizeCss(css)
      assert.ok(cleaned.includes('background: none;'))
      assert.ok(cleaned.includes('marker: url(#arrow);'))
    })

    it('neutralizes escaped external URL targets (https\\3a //evil.com)', () => {
      const css = '.a { background: url(https\\3a //evil.com); }'
      const cleaned = sanitizeCss(css)
      assert.ok(cleaned.includes('background: none;'))
      assert.ok(!cleaned.includes('evil.com'))
    })

    it('neutralizes escaped javascript in url (java\\73 cript:)', () => {
      const css = '.a { background: url(java\\73 cript:alert(1)); fill: red; }'
      const cleaned = sanitizeCss(css)
      assert.ok(!cleaned.includes('javascript'))
      assert.ok(!cleaned.includes('alert'))
      assert.ok(cleaned.includes('fill: red;'))
    })

    it('neutralizes CSS comment splitting bypasses (@/*comment*/import)', () => {
      const malicious = '@/*comment*/import url("https://evil.com/leak.css"); .node { fill: red; }'
      const cleaned = sanitizeCss(malicious)
      assert.ok(!cleaned.includes('import'))
      assert.ok(cleaned.includes('.node { fill: red; }'))
    })

    it('neutralizes hex-escaped @import (\\40import)', () => {
      const malicious = '\\40import url("https://evil.com/leak.css"); .node { fill: red; }'
      const cleaned = sanitizeCss(malicious)
      assert.ok(!cleaned.includes('import'))
      assert.ok(!cleaned.includes('evil.com'))
      assert.ok(cleaned.includes('.node { fill: red; }'))
    })

    it('neutralizes hex-escaped expression (\\65xpression)', () => {
      const malicious = '.box { width: \\65xpression(alert(1)); height: 10px; }'
      const cleaned = sanitizeCss(malicious)
      assert.ok(!cleaned.includes('expression'))
      assert.ok(cleaned.includes('height: 10px;'))
    })

    it('neutralizes comment-split expression (exp/*comment*/ression)', () => {
      const malicious = '.box { width: exp/*comment*/ression(alert(1)); height: 10px; }'
      const cleaned = sanitizeCss(malicious)
      assert.ok(!cleaned.includes('expression'))
      assert.ok(cleaned.includes('height: 10px;'))
    })

    it('neutralizes comments combined with escapes (exp/* */\\72ession)', () => {
      const malicious = '.box { width: exp/* */\\72ession(alert(1)); height: 10px; }'
      const cleaned = sanitizeCss(malicious)
      assert.ok(!cleaned.includes('alert'))
      assert.ok(cleaned.includes('height: 10px;'))
    })

    it('neutralizes hex-escaped behavior (b\\65havior)', () => {
      const malicious = '.box { b\\65havior: url(x.htc); color: blue; }'
      const cleaned = sanitizeCss(malicious)
      assert.ok(!cleaned.includes('behavior'))
      assert.ok(cleaned.includes('color: blue;'))
    })

    it('rejects malformed unbalanced CSS constructs (fail closed)', () => {
      assert.equal(sanitizeCss('.a { color: red;'), '')
      assert.equal(sanitizeCss('.a { color: red; }}'), '')
      assert.equal(sanitizeCss('.a color: red; }'), '')
    })

    it('sanitizes inline style attribute declarations via parseAndSanitizeDeclarations', () => {
      const style = 'color: red; background: u\\72l(https://evil.com); marker-end: url(#arrowhead);'
      const cleaned = parseAndSanitizeDeclarations(style)
      assert.ok(cleaned.includes('color: red;'))
      assert.ok(cleaned.includes('background: none;'))
      assert.ok(cleaned.includes('marker-end: url(#arrowhead);'))
    })

    it('preserves valid Mermaid CSS selectors, properties, and marker fragments', () => {
      const validMermaidCss = `
        #mermaid-1 .node rect { fill: #f9f9f9; stroke: #333; stroke-width: 1.5px; }
        #mermaid-1 .edgePath path { stroke: #333; fill: none; marker-end: url(#arrowhead); }
        #mermaid-1 .label text { font-family: sans-serif; font-size: 14px; }
      `
      const cleaned = sanitizeCss(validMermaidCss)
      assert.ok(cleaned.includes('marker-end: url(#arrowhead)'))
      assert.ok(cleaned.includes('fill: #f9f9f9'))
      assert.ok(cleaned.includes('font-family: sans-serif'))
    })

    it('correctly handles backslash parity and escaped quotes in CSS strings', () => {
      // Even backslashes before quote (escaped backslash, unescaped closing quote)
      const evenBackslashes = '.a { content: "foo\\\\"; color: red; }'
      const resEven = sanitizeCss(evenBackslashes)
      assert.ok(resEven.includes('content: "foo\\\\";'))
      assert.ok(resEven.includes('color: red;'))

      // Odd backslashes before quote (escaped quote)
      const oddBackslashes = '.a { content: "foo\\"bar"; color: red; }'
      const resOdd = sanitizeCss(oddBackslashes)
      assert.ok(resOdd.includes('content: "foo\\"bar";'))
      assert.ok(resOdd.includes('color: red;'))

      // Single quotes with escaped quote
      const singleQuotes = ".a { content: 'it\\'s'; color: blue; }"
      const resSingle = sanitizeCss(singleQuotes)
      assert.ok(resSingle.includes("content: 'it\\'s';"))
      assert.ok(resSingle.includes('color: blue;'))
    })

    it('ignores braces and parentheses inside quoted CSS strings', () => {
      // Braces inside string should not be confused for rule block boundaries
      const bracesInStr = '.a { content: "open { and close } braces"; fill: red; }'
      const resBraces = sanitizeCss(bracesInStr)
      assert.ok(resBraces.includes('content: "open { and close } braces";'))
      assert.ok(resBraces.includes('fill: red;'))

      // Parentheses inside string should not corrupt function scanner
      const parensInStr = '.a { content: "text (parenthesized)"; fill: green; }'
      const resParens = sanitizeCss(parensInStr)
      assert.ok(resParens.includes('content: "text (parenthesized)";'))
      assert.ok(resParens.includes('fill: green;'))
    })

    it('correctly parses and sanitizes nested @media and @supports rules', () => {
      const darkThemeMedia = `
        @media (prefers-color-scheme: dark) {
          .node rect { fill: #222; stroke: #eee; }
          .edgePath path { stroke: #eee; }
        }
      `
      const cleaned = sanitizeCss(darkThemeMedia)
      assert.ok(cleaned.includes('@media (prefers-color-scheme: dark)'))
      assert.ok(cleaned.includes('.node rect { fill: #222; stroke: #eee; }'))
      assert.ok(cleaned.includes('.edgePath path { stroke: #eee; }'))
    })

    it('fails closed on unterminated strings and rejects malformed declarations', () => {
      // Unterminated string in selector fails closed
      assert.equal(sanitizeCss('.a[data-title="unclosed { fill: red; }'), '')
      // Unterminated string in declaration fails closed
      assert.equal(sanitizeCss('.a { content: "unclosed string; fill: red; }'), '')
      // Malformed property name is stripped while preserving valid properties
      const malformedProp = '.a { evil<prop>: red; fill: green; }'
      const cleaned = sanitizeCss(malformedProp)
      assert.ok(!cleaned.includes('evil<prop>'))
      assert.ok(cleaned.includes('fill: green;'))
    })

    it('supports CSS custom properties (--*) and resolves var() with fallbacks safely', () => {
      const customPropsCss = `
        :root { --main-fill: #f43f5e; --border: 2px; }
        .node rect { fill: var(--main-fill); stroke-width: var(--border); }
        .node text { fill: var(--custom, #ffffff); stroke: var(--s, var(--fallback, #000)); }
      `
      const cleaned = sanitizeCss(customPropsCss)
      assert.ok(cleaned.includes('--main-fill: #f43f5e;'))
      assert.ok(cleaned.includes('fill: var(--main-fill);'))
      assert.ok(cleaned.includes('fill: var(--custom, #ffffff);'))

      // Injected dangerous function inside var() fallback is rejected
      const maliciousVar = '.node { fill: var(--c, url(javascript:alert(1))); color: red; }'
      const cleanVar = sanitizeCss(maliciousVar)
      assert.ok(!cleanVar.includes('javascript'))
      assert.ok(cleanVar.includes('color: red;'))
    })

    it('preserves unknown safe properties and complex Mermaid selectors', () => {
      const complexCss = `
        [id^="mermaid-"] .cluster > rect:hover {
          unknown-custom-prop: test;
          fill: #fff;
          opacity: 0.8;
        }
      `
      const cleaned = sanitizeCss(complexCss)
      assert.ok(cleaned.includes('[id^="mermaid-"] .cluster > rect:hover'))
      assert.ok(cleaned.includes('unknown-custom-prop: test;'))
      assert.ok(cleaned.includes('fill: #fff;'))
    })
  })

  describe('Anchor Navigation Restriction (isSafeAnchorUrl)', () => {
    it('permits safe anchor targets', () => {
      assert.equal(isSafeAnchorUrl('#overview'), true)
      assert.equal(isSafeAnchorUrl('/docs/protocol/overview'), true)
      assert.equal(isSafeAnchorUrl('./handshake'), true)
      assert.equal(isSafeAnchorUrl('../sdk/client'), true)
      assert.equal(isSafeAnchorUrl('https://usmp.metaloom.in'), true)
      assert.equal(isSafeAnchorUrl('http://localhost:3000'), true)
      assert.equal(isSafeAnchorUrl('mailto:security@metaloom.in'), true)
    })

    it('rejects unsafe anchor protocols including encoded bypasses', () => {
      assert.equal(isSafeAnchorUrl('javascript:alert(1)'), false)
      assert.equal(isSafeAnchorUrl('JAVASCRIPT:alert(1)'), false)
      assert.equal(isSafeAnchorUrl('vbscript:msgbox(1)'), false)
      assert.equal(isSafeAnchorUrl('data:text/html,<script>alert(1)</script>'), false)
      assert.equal(isSafeAnchorUrl('file:///etc/passwd'), false)
      assert.equal(isSafeAnchorUrl('blob:https://example.com/uuid'), false)
      assert.equal(isSafeAnchorUrl('&#106;avascript:alert(1)'), false)
      assert.equal(isSafeAnchorUrl('\\6a avascript:alert(1)'), false)
      assert.equal(isSafeAnchorUrl('java\0script:alert(1)'), false)
    })

    it('enforces rel="noopener noreferrer" when <a> specifies target="_blank"', () => {
      const root = createMockElement('svg')
      const anchor = appendChild(
        root,
        createMockElement('a', { href: 'https://example.com', target: '_blank' }, 'Link')
      )

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(anchor.getAttribute('rel'), 'noopener noreferrer')
    })

    it('enforces rel="noopener noreferrer" for case-insensitive and whitespace-padded target="_blank"', () => {
      const root = createMockElement('svg')
      const anchorUpper = appendChild(
        root,
        createMockElement('a', { href: 'https://example.com', target: '_BLANK' }, 'Link 1')
      )
      const anchorPadded = appendChild(
        root,
        createMockElement('a', { href: 'https://example.com', target: '  _blank  ' }, 'Link 2')
      )
      const anchorTab = appendChild(
        root,
        createMockElement('a', { href: 'https://example.com', target: '\t_Blank\n' }, 'Link 3')
      )

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(anchorUpper.getAttribute('rel'), 'noopener noreferrer')
      assert.equal(anchorPadded.getAttribute('rel'), 'noopener noreferrer')
      assert.equal(anchorTab.getAttribute('rel'), 'noopener noreferrer')
    })
  })

  describe('Attribute Allowlist per SVG Element (ALLOWED_SVG_ATTRIBUTES)', () => {
    it('allows valid SVG presentation, geometry, and identification attributes', () => {
      assert.equal(isUnsafeAttribute('id', 'node-1', 'rect'), false)
      assert.equal(isUnsafeAttribute('class', 'mermaid-node', 'g'), false)
      assert.equal(isUnsafeAttribute('fill', '#f43f5e', 'path'), false)
      assert.equal(isUnsafeAttribute('stroke', 'currentColor', 'line'), false)
      assert.equal(isUnsafeAttribute('stroke-width', '2', 'line'), false)
      assert.equal(isUnsafeAttribute('d', 'M 10 10 L 20 20', 'path'), false)
      assert.equal(isUnsafeAttribute('transform', 'translate(10, 20)', 'g'), false)
      assert.equal(isUnsafeAttribute('data-id', 'test', 'rect'), false)
      assert.equal(isUnsafeAttribute('aria-label', 'Diagram', 'svg'), false)
    })

    it('rejects arbitrary, non-whitelisted attributes', () => {
      assert.equal(isUnsafeAttribute('evil-attr', 'payload', 'rect'), true)
      assert.equal(isUnsafeAttribute('unknown', '123', 'g'), true)
    })

    it('rejects inline event handlers regardless of casing or namespaces', () => {
      assert.equal(isUnsafeAttribute('onload', 'alert(1)'), true)
      assert.equal(isUnsafeAttribute('onclick', 'alert(1)'), true)
      assert.equal(isUnsafeAttribute('onerror', 'alert(1)'), true)
      assert.equal(isUnsafeAttribute('onmouseover', 'foo()'), true)
      assert.equal(isUnsafeAttribute('ONCLICK', 'alert(1)'), true)
      assert.equal(isUnsafeAttribute('xlink:onload', 'alert(1)'), true)
      assert.equal(isUnsafeAttribute('svg:onclick', 'alert(1)'), true)
    })

    it('allows href only on <a> and <use>, rejecting href on other elements', () => {
      assert.equal(isUnsafeAttribute('href', '#marker', 'use'), false)
      assert.equal(isUnsafeAttribute('href', 'https://example.com', 'a'), false)
      assert.equal(isUnsafeAttribute('href', 'https://example.com', 'rect'), true)
      assert.equal(isUnsafeAttribute('xlink:href', '#marker', 'circle'), true)
    })

    it('restricts target, rel, and download exclusively to <a> elements', () => {
      assert.equal(isUnsafeAttribute('target', '_blank', 'a'), false)
      assert.equal(isUnsafeAttribute('rel', 'noopener noreferrer', 'a'), false)
      assert.equal(isUnsafeAttribute('download', 'diagram.svg', 'a'), false)

      assert.equal(isUnsafeAttribute('target', '_blank', 'rect'), true)
      assert.equal(isUnsafeAttribute('rel', 'noopener', 'path'), true)
      assert.equal(isUnsafeAttribute('download', 'file', 'circle'), true)
      assert.equal(isUnsafeAttribute('target', '_blank', 'svg'), true)
    })

    it('restricts XML namespace declarations and metadata exclusively to <svg> elements', () => {
      assert.equal(isUnsafeAttribute('xmlns', SVG_NAMESPACE, 'svg'), false)
      assert.equal(isUnsafeAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink', 'svg'), false)
      assert.equal(isUnsafeAttribute('version', '1.1', 'svg'), false)

      assert.equal(isUnsafeAttribute('xmlns', SVG_NAMESPACE, 'g'), true)
      assert.equal(isUnsafeAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink', 'rect'), true)
      assert.equal(isUnsafeAttribute('version', '1.1', 'path'), true)
    })

    it('restricts viewBox and preserveAspectRatio strictly to viewport-establishing elements', () => {
      assert.equal(isUnsafeAttribute('viewbox', '0 0 100 100', 'svg'), false)
      assert.equal(isUnsafeAttribute('preserveaspectratio', 'xMidYMid meet', 'svg'), false)
      assert.equal(isUnsafeAttribute('viewbox', '0 0 10 10', 'marker'), false)
      assert.equal(isUnsafeAttribute('viewbox', '0 0 10 10', 'symbol'), false)
      assert.equal(isUnsafeAttribute('viewbox', '0 0 10 10', 'pattern'), false)

      assert.equal(isUnsafeAttribute('viewbox', '0 0 100 100', 'rect'), true)
      assert.equal(isUnsafeAttribute('viewbox', '0 0 100 100', 'path'), true)
      assert.equal(isUnsafeAttribute('preserveaspectratio', 'none', 'circle'), true)
    })
  })

  describe('DOM Tree Sanitization (sanitizeSvgElement)', () => {
    it('strips <script> elements from SVG tree', () => {
      const root = createMockElement('svg')
      const script = appendChild(root, createMockElement('script', {}, 'alert("XSS")'))
      const circle = appendChild(root, createMockElement('circle', { r: '10' }))

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(root.querySelectorAll('script').length, 0)
      assert.equal(root.children.includes(script), false)
      assert.equal(root.children.includes(circle), true)
    })

    it('strips <foreignObject> elements completely from SVG tree', () => {
      const root = createMockElement('svg')
      const foreign = appendChild(root, createMockElement('foreignObject'))
      appendChild(foreign, createMockElement('div', {}, 'malicious html'))
      const rect = appendChild(root, createMockElement('rect', { width: '100' }))

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(root.querySelectorAll('foreignObject').length, 0)
      assert.equal(root.children.includes(foreign), false)
      assert.equal(root.children.includes(rect), true)
    })

    it('removes custom or non-allowlisted tags like <math>, <form>, <input>', () => {
      const root = createMockElement('svg')
      const math = appendChild(root, createMockElement('math'))
      const customTag = appendChild(root, createMockElement('my-custom-tag'))
      const safeRect = appendChild(root, createMockElement('rect', { id: 'safe-rect' }))

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(root.children.includes(math), false)
      assert.equal(root.children.includes(customTag), false)
      assert.equal(root.children.includes(safeRect), true)
    })

    it('strips SMIL animation tags (<set>, <animate>, <animateMotion>, <animateTransform>)', () => {
      const root = createMockElement('svg')
      const rect = appendChild(root, createMockElement('rect', { id: 'box' }))
      appendChild(
        rect,
        createMockElement('set', { attributeName: 'href', to: 'javascript:alert(1)' })
      )
      appendChild(rect, createMockElement('animate', { attributeName: 'x', from: '0', to: '10' }))
      appendChild(rect, createMockElement('animateMotion'))
      appendChild(rect, createMockElement('animateTransform'))

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(root.querySelectorAll('set').length, 0)
      assert.equal(root.querySelectorAll('animate').length, 0)
      assert.equal(root.querySelectorAll('animateMotion').length, 0)
      assert.equal(root.querySelectorAll('animateTransform').length, 0)
      assert.equal(rect.getAttribute('id'), 'box')
    })

    it('removes inline event handlers (onload, onclick, onerror) from all elements', () => {
      const root = createMockElement('svg', { onload: 'alert(0)' })
      const g = appendChild(
        root,
        createMockElement('g', {
          id: 'safe-group',
          onclick: 'alert(1)',
          onmouseover: 'steal()',
          class: 'node',
        })
      )
      const text = appendChild(g, createMockElement('text', { onerror: 'fail()' }, 'Node text'))

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(root.getAttribute('onload'), null)
      assert.equal(g.getAttribute('onclick'), null)
      assert.equal(g.getAttribute('onmouseover'), null)
      assert.equal(g.getAttribute('id'), 'safe-group')
      assert.equal(g.getAttribute('class'), 'node')
      assert.equal(text.getAttribute('onerror'), null)
      assert.equal(text.textContent, 'Node text')
    })

    it('blocks external <use href="..."> references while preserving local fragment <use>', () => {
      const root = createMockElement('svg')
      const badUse1 = appendChild(
        root,
        createMockElement('use', { href: 'https://evil.com/icons.svg#icon' })
      )
      const badUse2 = appendChild(
        root,
        createMockElement('use', { 'xlink:href': 'external.svg#marker' })
      )
      const safeUse = appendChild(
        root,
        createMockElement('use', { href: '#local-arrowhead', id: 'safe-use' })
      )

      sanitizeSvgElement(root as unknown as Element)

      assert.equal(badUse1.getAttribute('href'), null)
      assert.equal(badUse2.getAttribute('xlink:href'), null)
      assert.equal(safeUse.getAttribute('href'), '#local-arrowhead')
    })

    it('sanitizes root SVG style containing an external url()', () => {
      const root = createMockElement('svg', {
        style: 'background: url(https://evil.com/leak.png)',
      })
      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.getAttribute('style'), 'background: none;')
    })

    it('sanitizes root SVG style containing safe and unsafe declarations together', () => {
      const root = createMockElement('svg', {
        style: 'color: red; background: url(https://evil.com/leak.png); max-width: 100%;',
      })
      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.getAttribute('style'), 'color: red; background: none; max-width: 100%;')
    })

    it('removes root SVG style attribute if it contains only unsafe declarations', () => {
      const root = createMockElement('svg', {
        style: 'behavior: url(x.htc); -moz-binding: url(x.xml);',
      })
      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.getAttribute('style'), null)
    })

    it('preserves root SVG style containing legitimate declarations', () => {
      const root = createMockElement('svg', {
        style: 'max-width: 100%; height: auto;',
      })
      sanitizeSvgElement(root as unknown as Element)
      assert.equal(root.getAttribute('style'), 'max-width: 100%; height: auto;')
    })

    it('sanitizes and preserves @keyframes rules inside <style> blocks in the DOM', () => {
      const root = createMockElement('svg')
      const style = appendChild(
        root,
        createMockElement(
          'style',
          {},
          '@keyframes pulse { from { opacity: 0; background: url(https://evil.com); } to { opacity: 1; } }'
        )
      )
      sanitizeSvgElement(root as unknown as Element)
      assert.ok(style.textContent.includes('@keyframes pulse'))
      assert.ok(style.textContent.includes('from { opacity: 0; background: none; }'))
      assert.ok(style.textContent.includes('to { opacity: 1; }'))
      assert.ok(!style.textContent.includes('evil.com'))
    })

    it('preserves XML-entity-encoded local SVG references in <use href="&#x23;local-marker">', () => {
      const root = createMockElement('svg')
      const safeUseEntity = appendChild(
        root,
        createMockElement('use', { href: '&#x23;local-marker', id: 'entity-use' })
      )
      const safeUseNamed = appendChild(
        root,
        createMockElement('use', { 'xlink:href': '&#35;local-named', id: 'named-use' })
      )
      const badUseEntity = appendChild(
        root,
        createMockElement('use', { href: '&#106;avascript:alert(1)' })
      )

      sanitizeSvgElement(root as unknown as Element)
      assert.equal(safeUseEntity.getAttribute('href'), '&#x23;local-marker')
      assert.equal(safeUseNamed.getAttribute('xlink:href'), '&#35;local-named')
      assert.equal(badUseEntity.getAttribute('href'), null)
    })
  })

  describe('Diagram Syntax Normalization (normalizeChart)', () => {
    it('normalizes carriage returns and trims lines for flowchart, sequence, state, class, and ER diagrams', () => {
      const flowchart = 'graph TD\r\n   A[Start] --> B[Process]\r\n   B --> C[End]\r\n'
      assert.equal(normalizeChart(flowchart), 'graph TD\nA[Start] --> B[Process]\nB --> C[End]')

      const sequence = 'sequenceDiagram\r\n   Alice->>Bob: Hello\r\n   Bob-->>Alice: Hi\r\n'
      assert.equal(
        normalizeChart(sequence),
        'sequenceDiagram\nAlice->>Bob: Hello\nBob-->>Alice: Hi'
      )

      const state = 'stateDiagram-v2\r\n   [*] --> Idle\r\n   Idle --> [*]\r\n'
      assert.equal(normalizeChart(state), 'stateDiagram-v2\n[*] --> Idle\nIdle --> [*]')

      const classDiag = 'classDiagram\r\n   class Protocol\r\n   Protocol : +send()\r\n'
      assert.equal(normalizeChart(classDiag), 'classDiagram\nclass Protocol\nProtocol : +send()')

      const erDiag = 'erDiagram\r\n   USER ||--o{ ORDER : places\r\n'
      assert.equal(normalizeChart(erDiag), 'erDiagram\nUSER ||--o{ ORDER : places')
    })
  })
})
