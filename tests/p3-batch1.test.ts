import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test, { describe } from 'node:test'

import { metadata as downloadsMetadata } from '@/app/downloads/page'
import { Settings } from '@/types/settings'

describe('P3 Batch 1 - Accessibility & SEO Regression Tests', () => {
  describe('Accessibility (A11y) Verification', () => {
    test('AUD-P3-A11Y-01: mobile navigation trigger button has accessible aria-label and title', () => {
      const filePath = path.join(process.cwd(), 'components/sidebar/index.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      assert.match(
        content,
        /aria-label="Open navigation menu"/,
        'Mobile navigation trigger button in components/sidebar/index.tsx must declare an explicit aria-label'
      )
      assert.match(
        content,
        /title="Open navigation menu"/,
        'Mobile navigation trigger button in components/sidebar/index.tsx must declare a title'
      )
    })

    test('AUD-P3-A11Y-02: sidebar category titles do not emit h2 heading elements', () => {
      const filePath = path.join(process.cwd(), 'components/sidebar/sublink.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      assert.doesNotMatch(
        content,
        /<h2[^>]*>\{title\}<\/h2>/,
        'Non-routable category titles in components/sidebar/sublink.tsx must not use h2 tags'
      )
      assert.match(
        content,
        /<div[^>]*font-bold[^>]*>\{title\}<\/div>/,
        'Category titles in components/sidebar/sublink.tsx should use styled div elements'
      )
    })

    test('AUD-P3-A11Y-03: markdown code copy button has accessible aria-label and title', () => {
      const filePath = path.join(process.cwd(), 'components/markdown/copy.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      assert.match(
        content,
        /aria-label=\{isCopied \? 'Code copied to clipboard' : 'Copy code to clipboard'\}/,
        'Code copy button in components/markdown/copy.tsx must provide an explicit dynamic aria-label'
      )
      assert.match(
        content,
        /title=\{isCopied \? 'Copied!' : 'Copy code to clipboard'\}/,
        'Code copy button in components/markdown/copy.tsx must provide a title attribute'
      )
    })

    test('AUD-P3-A11Y-04: search triggers and inputs declare accessible names and proper input types', () => {
      const filePath = path.join(process.cwd(), 'components/navigation/search.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      assert.match(
        content,
        /<Button[\s\S]*?aria-label="Search documentation"/,
        'Mobile search trigger button must declare aria-label="Search documentation"'
      )
      assert.match(
        content,
        /<Input[\s\S]*?type="search"[\s\S]*?aria-label="Search documentation"/,
        'Desktop search input must declare type="search" and aria-label="Search documentation"'
      )
      assert.match(
        content,
        /<input[\s\S]*?type="search"[\s\S]*?aria-label="Search documentation"/,
        'Dialog search input must declare type="search" and aria-label="Search documentation"'
      )
    })

    test('AUD-P3-A11Y-05: landing page sections do not emit orphan h4 tags skipping hierarchy', () => {
      const heroPath = path.join(process.cwd(), 'components/landing/hero-section.tsx')
      const problemPath = path.join(process.cwd(), 'components/landing/problem-section.tsx')
      const benchmarksPath = path.join(process.cwd(), 'components/landing/benchmarks-section.tsx')

      const heroContent = fs.readFileSync(heroPath, 'utf-8')
      const problemContent = fs.readFileSync(problemPath, 'utf-8')
      const benchmarksContent = fs.readFileSync(benchmarksPath, 'utf-8')

      // Hero handshake step titles should not be h4 inside button
      assert.doesNotMatch(
        heroContent,
        /<h4[^>]*>\{step\.title\}<\/h4>/,
        'Hero handshake steps must not use h4 tags inside interactive buttons'
      )

      // Problem section comparison items should be h3, not h4
      assert.doesNotMatch(
        problemContent,
        /<h4[\s\S]*?Raw Sockets/,
        'Problem section items should be h3, not h4'
      )
      assert.match(
        problemContent,
        /<h3[\s\S]*?Raw Sockets/,
        'Problem section items under h2 should be h3'
      )

      // Benchmark section items should not skip levels to h4
      assert.doesNotMatch(
        benchmarksContent,
        /<h4[\s\S]*?Compiled Binary Size/,
        'Benchmark display title should not be h4'
      )
      assert.match(
        benchmarksContent,
        /<h3[\s\S]*?112 Bytes Persistent RAM[\s\S]*?<\/h3>/,
        'Benchmark features following h2 should be h3'
      )
    })

    test('AUD-P3-A11Y-06: breadcrumb, navbar, and code copy items enforce minimum target height', () => {
      const breadcrumbPath = path.join(process.cwd(), 'components/article/breadcrumb.tsx')
      const navbarPath = path.join(process.cwd(), 'components/navigation/navbar.tsx')
      const codeTabsPath = path.join(process.cwd(), 'components/landing/code-tabs-section.tsx')

      const breadcrumbContent = fs.readFileSync(breadcrumbPath, 'utf-8')
      const navbarContent = fs.readFileSync(navbarPath, 'utf-8')
      const codeTabsContent = fs.readFileSync(codeTabsPath, 'utf-8')

      assert.match(
        breadcrumbContent,
        /min-h-\[28px\]/,
        'Breadcrumb links should enforce min-h-[28px] touch bounds'
      )
      assert.match(
        navbarContent,
        /min-h-\[28px\]/,
        'Navbar links should enforce min-h-[28px] touch bounds'
      )
      assert.match(
        codeTabsContent,
        /min-h-\[28px\]/,
        'Code tabs copy button should enforce min-h-[28px] touch bounds'
      )
    })
  })

  describe('SEO Verification', () => {
    test('AUD-P3-SEO-01: /downloads route specifies correct canonical URL and OpenGraph metadata', () => {
      assert.ok(downloadsMetadata, 'downloadsMetadata must be exported')
      assert.ok(downloadsMetadata.alternates, 'metadata must have alternates')
      assert.equal(
        downloadsMetadata.alternates.canonical,
        `${Settings.metadataBase}/downloads`,
        'Canonical on /downloads must point to /downloads route, not homepage'
      )

      assert.ok(downloadsMetadata.openGraph, 'metadata must have openGraph')
      assert.equal(
        downloadsMetadata.openGraph.url,
        `${Settings.metadataBase}/downloads`,
        'OpenGraph URL must point to /downloads'
      )
      assert.equal(
        downloadsMetadata.title,
        'Downloads & Releases',
        'Title must not duplicate brand suffix'
      )
    })

    test('AUD-P3-SEO-02: documentation pages do not double-append brand suffix in title', () => {
      const docsPagePath = path.join(process.cwd(), 'app/docs/[[...slug]]/page.tsx')
      const content = fs.readFileSync(docsPagePath, 'utf-8')

      // In app/docs/[[...slug]]/page.tsx, generateMetadata should return title: frontmatter.title
      assert.match(
        content,
        /title:\s*frontmatter\.title,/,
        'generateMetadata must return title: frontmatter.title without appending redundant brand suffix'
      )
      assert.doesNotMatch(
        content,
        /title:\s*`\$\{frontmatter\.title\}\s*-\s*\$\{Settings\.title\}`/,
        'generateMetadata must not append - ${Settings.title} because root layout title template already provides it'
      )

      // When prerendered HTML exists, verify actual <title> tag contains single '- USMP'
      const builtHtmlPath = path.join(
        process.cwd(),
        '.next/server/app/docs/getting-started/installation.html'
      )
      if (fs.existsSync(builtHtmlPath)) {
        const html = fs.readFileSync(builtHtmlPath, 'utf-8')
        assert.match(
          html,
          /<title>Installation &amp; Environment Setup - USMP<\/title>/,
          'Rendered HTML must contain exactly one "- USMP" brand suffix'
        )
        assert.doesNotMatch(
          html,
          /<title>Installation &amp; Environment Setup - USMP - USMP<\/title>/,
          'Rendered HTML must never contain duplicate brand suffix'
        )
      }
    })
  })

  describe('Social Links Verification (AUD-P3-DOC-02)', () => {
    test('footer links to official X handle using FaXTwitter and preserves YouTube', () => {
      const footerPath = path.join(process.cwd(), 'components/navigation/footer.tsx')
      const content = fs.readFileSync(footerPath, 'utf-8')

      assert.match(
        content,
        /href="https:\/\/x\.com\/metaloomlabs"/,
        'Twitter link should point to official @metaloomlabs X URL'
      )
      assert.match(
        content,
        /<FaXTwitter className="size-5" \/>/,
        'Twitter link should render FaXTwitter icon instead of LuCompass'
      )
      assert.doesNotMatch(
        content,
        /<LuCompass className="size-5" \/>/,
        'Footer must not use LuCompass icon for social links'
      )
      assert.match(
        content,
        /href="https:\/\/youtube\.com"/,
        'YouTube link must remain unchanged pending maintainer input'
      )
    })
  })
})
