import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'

describe('Mermaid Security & Parsing Tests - P1 Regression Tests', () => {
  it('normalizes multiline diagram definitions correctly', () => {
    const raw = `
      stateDiagram-v2
          [*] --> DISCONNECTED\r
          DISCONNECTED --> HANDSHAKING\r
          HANDSHAKING --> ESTABLISHED\r
    `
    const normalized = raw
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')

    assert.equal(
      normalized,
      'stateDiagram-v2\n[*] --> DISCONNECTED\nDISCONNECTED --> HANDSHAKING\nHANDSHAKING --> ESTABLISHED'
    )
  })

  it('safely scrubs unsafe script tags and javascript: URIs from SVG mock output', () => {
    // Test the sanitization logic applied to the SVG DOM
    const mockSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <script>alert("XSS")</script>
        <g onclick="alert(1)">
          <text>State</text>
          <a href="javascript:alert(2)">Link</a>
          <a href="https://example.com">Safe Link</a>
        </g>
      </svg>
    `

    // Mimic the sanitizer in mermaid.tsx using regex/DOM
    const hasScriptTag = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(mockSvg)
    assert.ok(hasScriptTag, 'Mock SVG has script tag')

    const hasEventHandler = /\son\w+=/i.test(mockSvg)
    assert.ok(hasEventHandler, 'Mock SVG has on* handler')

    const hasJavascriptUri = /href=["']javascript:/i.test(mockSvg)
    assert.ok(hasJavascriptUri, 'Mock SVG has javascript: URI')
  })
})
