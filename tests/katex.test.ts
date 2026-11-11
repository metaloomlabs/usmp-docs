import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test, { describe, it } from 'node:test'

describe('KaTeX Math Configuration - P1 Regression Tests', () => {
  it('globals.css does not hide rendered KaTeX HTML', () => {
    const cssPath = path.join(process.cwd(), 'styles/globals.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    assert.equal(
      cssContent.includes('span.katex-html {\n  display: none;\n}'),
      false,
      'globals.css must not hide span.katex-html'
    )
    assert.equal(
      cssContent.includes('display: none') && cssContent.includes('katex-html'),
      false,
      'globals.css must not suppress katex-html via display: none'
    )
  })

  it('layout.tsx imports the official KaTeX stylesheet', () => {
    const layoutPath = path.join(process.cwd(), 'app/layout.tsx')
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
    assert.ok(
      layoutContent.includes("import 'katex/dist/katex.min.css'"),
      'layout.tsx must import katex.min.css'
    )
  })

  it('KaTeX stylesheet exists in node_modules and has valid font references', () => {
    const katexCssPath = path.join(process.cwd(), 'node_modules/katex/dist/katex.min.css')
    assert.ok(fs.existsSync(katexCssPath), 'katex.min.css must exist in node_modules')
    const content = fs.readFileSync(katexCssPath, 'utf-8')
    assert.ok(content.includes('.katex'), 'katex.min.css must contain .katex styles')
    assert.ok(content.includes('.katex-html'), 'katex.min.css must contain .katex-html styles')
  })
})
