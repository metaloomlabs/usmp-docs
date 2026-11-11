import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'

import { resolveMarkdownLink } from '../lib/resolve-link'

describe('resolveMarkdownLink - P0 Regression Tests', () => {
  it('handles empty and default hash links', () => {
    assert.deepEqual(resolveMarkdownLink('', '/docs'), { href: '#', isExternal: false })
    assert.deepEqual(resolveMarkdownLink('#', '/docs'), { href: '#', isExternal: false })
  })

  it('preserves in-page hash fragments', () => {
    assert.deepEqual(resolveMarkdownLink('#packet-types', '/docs/protocol/overview'), {
      href: '#packet-types',
      isExternal: false,
    })
  })

  it('preserves query parameters on current page', () => {
    assert.deepEqual(resolveMarkdownLink('?q=encryption', '/docs/protocol/overview'), {
      href: '/docs/protocol/overview?q=encryption',
      isExternal: false,
    })
  })

  it('identifies and preserves external URLs', () => {
    const urls = [
      'https://github.com/metaloom/usmp',
      'http://example.com',
      'mailto:dev@metaloom.io',
      'tel:+1234567890',
      '//cdn.example.com/asset.js',
    ]
    for (const url of urls) {
      assert.deepEqual(resolveMarkdownLink(url, '/docs/getting-started/installation'), {
        href: url,
        isExternal: true,
      })
    }
  })

  it('resolves sibling relative markdown links in a subsection', () => {
    assert.deepEqual(resolveMarkdownLink('tutorial-udp.md', '/docs/getting-started/installation'), {
      href: '/docs/getting-started/tutorial-udp',
      isExternal: false,
    })
    assert.deepEqual(
      resolveMarkdownLink('./tutorial-tcp.md', '/docs/getting-started/installation'),
      {
        href: '/docs/getting-started/tutorial-tcp',
        isExternal: false,
      }
    )
  })

  it('resolves parent directory traversal (../)', () => {
    assert.deepEqual(resolveMarkdownLink('../tools/cli.md', '/docs/sdk/python'), {
      href: '/docs/tools/cli',
      isExternal: false,
    })
    assert.deepEqual(
      resolveMarkdownLink('../protocol/overview.md', '/docs/getting-started/installation'),
      {
        href: '/docs/protocol/overview',
        isExternal: false,
      }
    )
  })

  it('resolves links from root documentation page (/docs)', () => {
    assert.deepEqual(resolveMarkdownLink('getting-started/installation.md', '/docs'), {
      href: '/docs/getting-started/installation',
      isExternal: false,
    })
    assert.deepEqual(resolveMarkdownLink('spec.md', '/docs'), {
      href: '/docs/spec',
      isExternal: false,
    })
  })

  it('preserves hash fragments with relative paths', () => {
    assert.deepEqual(
      resolveMarkdownLink(
        'overview.md#packet-types-knowing-whats-in-the-box',
        '/docs/protocol/frame-format'
      ),
      {
        href: '/docs/protocol/overview#packet-types-knowing-whats-in-the-box',
        isExternal: false,
      }
    )
  })

  it('preserves query parameters and hashes combined', () => {
    assert.deepEqual(resolveMarkdownLink('server.md?tab=async#handlers', '/docs/sdk/session'), {
      href: '/docs/sdk/server?tab=async#handlers',
      isExternal: false,
    })
  })

  it('normalizes absolute root paths without prepending extra /docs', () => {
    assert.deepEqual(resolveMarkdownLink('/downloads', '/docs/getting-started/installation'), {
      href: '/downloads',
      isExternal: false,
    })
    assert.deepEqual(
      resolveMarkdownLink('/docs/examples/tcp', '/docs/getting-started/installation'),
      {
        href: '/docs/examples/tcp',
        isExternal: false,
      }
    )
  })

  it('normalizes index.md and welcome.md to root /docs', () => {
    assert.deepEqual(resolveMarkdownLink('index.md', '/docs'), {
      href: '/docs',
      isExternal: false,
    })
    assert.deepEqual(resolveMarkdownLink('../welcome.md', '/docs/protocol/overview'), {
      href: '/docs',
      isExternal: false,
    })
  })

  it('handles mapped custom slugs properly', () => {
    assert.deepEqual(resolveMarkdownLink('guides.md', '/docs/troubleshooting/guides'), {
      href: '/docs/troubleshooting',
      isExternal: false,
    })
  })
})
