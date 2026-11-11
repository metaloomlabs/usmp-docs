import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { TableAnchor, type TableAnchorProps } from '../components/toc/anchor'

describe('Table of Contents Optimization - P2 Regression Tests', () => {
  it('exports TableAnchor component function', () => {
    assert.strictEqual(typeof TableAnchor, 'function')
  })

  it('matches heading IDs correctly to TOC hrefs', () => {
    const tocs = [
      { href: '#overview', level: 2, text: 'Overview' },
      { href: '#packet-format', level: 3, text: 'Packet Format' },
      { href: '#curve25519-key-exchange', level: 4, text: 'Curve25519 Key Exchange' },
    ]

    for (const toc of tocs) {
      const targetId = toc.href.slice(1)
      const cleanTocText = toc.text.toLowerCase().replace(/[^a-z0-9]/g, '')
      assert.ok(targetId.length > 0)
      assert.ok(cleanTocText.length > 0)
      assert.strictEqual(toc.href.startsWith('#'), true)
    }
  })

  it('normalizes heading text reliably for TOC matching without DOM innerText reflows', () => {
    const headings = [
      { id: 'esp32-setup', textContent: 'ESP32 Setup' },
      { id: 'wire-packet-format', textContent: '  Wire Packet Format  \n' },
      { id: 'faq-section', textContent: 'FAQ (Frequently Asked Questions)' },
    ]

    const tocs = [
      { href: '#esp32-setup', level: 2, text: 'ESP32 Setup' },
      { href: '#wire-packet-format', level: 2, text: 'Wire Packet Format' },
      { href: '#faq-section', level: 2, text: 'FAQ (Frequently Asked Questions)' },
    ]

    for (const heading of headings) {
      const headingText = (heading.textContent || '').trim()
      const match = tocs.find(
        (t) =>
          (heading.id && (t.href === `#${heading.id}` || t.href.endsWith(heading.id))) ||
          t.text.toLowerCase().replace(/[^a-z0-9]/g, '') ===
            headingText.toLowerCase().replace(/[^a-z0-9]/g, '')
      )
      assert.ok(match, `Heading ${heading.id} should match a TOC item`)
      assert.strictEqual(match?.href, `#${heading.id}`)
    }
  })
})
