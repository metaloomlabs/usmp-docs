import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test, { describe } from 'node:test'

import { getTable } from '@/lib/markdown'

describe('P3 Batch 2 - Performance & Bundle Optimization Regression Tests', () => {
  describe('Mermaid Lazy-Loading (AUD-P3-PERF-01)', () => {
    test('components/markdown/mermaid.tsx does not statically import mermaid at top level', () => {
      const filePath = path.join(process.cwd(), 'components/markdown/mermaid.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      assert.doesNotMatch(
        content,
        /^import\s+mermaid\s+from\s+['"]mermaid['"]/m,
        'mermaid.tsx must not statically import mermaid at top level to avoid eager 650KB bundling'
      )
      assert.match(
        content,
        /import\(['"]mermaid['"]\)/,
        'mermaid.tsx must dynamically import mermaid via import("mermaid") on demand'
      )
      assert.match(
        content,
        /securityLevel:\s*['"]strict['"]/,
        'mermaid configuration must maintain securityLevel: "strict"'
      )
    })
  })

  describe('Search Index Payload Optimization (AUD-P3-PERF-02)', () => {
    test('documents.json omits redundant content field while retaining _searchMeta', () => {
      const searchDataPath = path.join(process.cwd(), 'public/search-data/documents.json')
      assert.ok(fs.existsSync(searchDataPath), 'documents.json must exist')

      const raw = fs.readFileSync(searchDataPath, 'utf-8')
      const data = JSON.parse(raw)
      assert.ok(Array.isArray(data), 'documents.json must be an array of documents')
      assert.ok(data.length > 0, 'documents.json must contain indexed documents')

      for (const item of data) {
        assert.ok(item.slug, 'Each item must have a slug')
        assert.ok(item.title, 'Each item must have a title')
        assert.ok(item._searchMeta, 'Each item must retain _searchMeta')
        assert.ok(item._searchMeta.cleanContent, 'Each item must have cleanContent in _searchMeta')
        assert.equal(
          item.content,
          undefined,
          `Document ${item.slug} must not include redundant raw content property`
        )
      }

      const size = fs.statSync(searchDataPath).size
      assert.ok(
        size < 400000,
        `documents.json size (${size} bytes) must be under 400 KB (baseline was 583 KB)`
      )
    })

    test('scripts/content.ts does not include content property in returned record', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/content.ts')
      const content = fs.readFileSync(scriptPath, 'utf-8')

      assert.doesNotMatch(
        content,
        /content:\s*documentContent,/,
        'scripts/content.ts must omit content: documentContent'
      )
    })
  })

  describe('FileTree Code Splitting (AUD-P3-PERF-03)', () => {
    test('components/markdown/filetree/index.tsx dynamically exports FileTree, Folder, and File', () => {
      const indexPath = path.join(process.cwd(), 'components/markdown/filetree/index.tsx')
      const content = fs.readFileSync(indexPath, 'utf-8')

      assert.match(content, /export const FileTree = dynamic\(/)
      assert.match(content, /export const Folder = dynamic\(/)
      assert.match(content, /export const File = dynamic\(/)
    })

    test('lib/components.ts imports FileTree, Folder, and File from dynamic filetree index', () => {
      const compPath = path.join(process.cwd(), 'lib/components.ts')
      const content = fs.readFileSync(compPath, 'utf-8')

      assert.doesNotMatch(
        content,
        /from ['"]@\/components\/markdown\/filetree\/component['"]/,
        'lib/components.ts must not statically import component.tsx directly'
      )
      assert.match(
        content,
        /from ['"]@\/components\/markdown\/filetree['"]/,
        'lib/components.ts must import from @/components/markdown/filetree dynamic index'
      )
    })
  })

  describe('getTable Redundant I/O Elimination (AUD-P3-ARCH-01)', () => {
    test('getTable parses provided raw markdown directly without disk I/O', async () => {
      const sampleMdx = `
# Title

## First Section
Content here

### Subsection A
More details

## Second Section
Final notes
`
      const headings = await getTable('test-slug', sampleMdx)
      assert.equal(headings.length, 3)
      assert.deepEqual(headings[0], { level: 2, text: 'First Section', href: '#first-section' })
      assert.deepEqual(headings[1], { level: 3, text: 'Subsection A', href: '#subsection-a' })
      assert.deepEqual(headings[2], { level: 2, text: 'Second Section', href: '#second-section' })
    })

    test('lib/markdown.ts passes cached markdown content into getTable', () => {
      const markdownPath = path.join(process.cwd(), 'lib/markdown.ts')
      const content = fs.readFileSync(markdownPath, 'utf-8')

      assert.match(
        content,
        /const tocs = await getTable\(slug, mdx\)/,
        'getDocument must pass mdx into getTable(slug, mdx) to prevent duplicate read stream'
      )
    })
  })

  describe('Protocol RAM Documentation Status (AUD-P3-DOC-01)', () => {
    test('public/llms.txt retains unverified historical claim pending upstream SDK struct alignment', () => {
      const llmsPath = path.join(process.cwd(), 'public/llms.txt')
      const content = fs.readFileSync(llmsPath, 'utf-8')

      assert.match(
        content,
        /Persistent RAM.*~144 Bytes/,
        'public/llms.txt must retain historical ~144 Bytes claim until upstream C struct sizes are formally reconciled'
      )
    })
  })
})
