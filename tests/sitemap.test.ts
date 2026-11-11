import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import sitemap from '../app/sitemap'
import { PageRoutes } from '../lib/pageroutes'
import { Settings } from '../types/settings'

describe('Sitemap Coverage & Routes - P2 Regression Tests', () => {
  it('generates a valid sitemap list including root, downloads, and docs', () => {
    const entries = sitemap()

    assert.ok(Array.isArray(entries))
    assert.strictEqual(entries.length, 2 + PageRoutes.length)

    // Check root
    const rootEntry = entries.find((e) => e.url === Settings.metadataBase)
    assert.ok(rootEntry, 'Root URL must be present in sitemap')
    assert.strictEqual(rootEntry?.priority, 1)

    // Check downloads route
    const downloadsUrl = new URL('/downloads', Settings.metadataBase).toString()
    const downloadsEntry = entries.find((e) => e.url === downloadsUrl)
    assert.ok(downloadsEntry, '/downloads URL must be present in sitemap')
    assert.strictEqual(downloadsEntry?.priority, 0.8)
    assert.strictEqual(downloadsEntry?.changeFrequency, 'weekly')

    // Check all PageRoutes are present
    for (const page of PageRoutes) {
      const pageUrl = new URL(`/docs${page.href}`, Settings.metadataBase).toString()
      const found = entries.some((e) => e.url === pageUrl)
      assert.ok(found, `Expected ${pageUrl} to be included in sitemap`)
    }
  })
})
