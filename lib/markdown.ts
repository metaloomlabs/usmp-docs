import { createReadStream, existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import grayMatter from 'gray-matter'
import { type Element, type Text } from 'hast'
import { compileMDX } from 'next-mdx-remote/rsc'
import { cache } from 'react'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeCodeTitles from 'rehype-code-titles'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { type Node } from 'unist'
import { visit } from 'unist-util-visit'

import { components } from '@/lib/components'
import { PageRoutes } from '@/lib/pageroutes'
import { GitHubLink } from '@/settings/navigation'
import { Settings } from '@/types/settings'

declare module 'hast' {
  interface Element {
    raw?: string
  }
}

interface MdxHeaders {
  title: string
  description: string
  keywords: string
}

async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: rawMdx,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          preCopy,
          rehypeCodeTitles,
          rehypeKatex,
          rehypePrism,
          rehypeSlug,
          rehypeAutolinkHeadings,
          postCopy,
        ],
        remarkPlugins: [remarkGfm, remarkMath],
      },
    },
    components,
  })
}

const mapCustomSlugs = (slug: string) => {
  const s = slug.toLowerCase()
  if (s === 'troubleshooting/guides') {
    return 'troubleshooting'
  }
  if (s === 'troubleshooting/debugging') {
    return 'debugging'
  }
  return slug
}

const documentPath = (slug: string) => {
  const mappedSlug = mapCustomSlugs(slug)
  const targetSlug = mappedSlug === '' || mappedSlug === 'welcome' ? 'index' : mappedSlug

  if (Settings.gitload) {
    return `${GitHubLink.href}/raw/main/contents/docs/${targetSlug}/index.mdx`
  }

  const possiblePaths = [
    path.join(process.cwd(), '/contents/docs/', `${targetSlug}.md`),
    path.join(process.cwd(), '/contents/docs/', `${targetSlug}.mdx`),
    path.join(process.cwd(), '/contents/docs/', `${targetSlug}/index.md`),
    path.join(process.cwd(), '/contents/docs/', `${targetSlug}/index.mdx`),
  ]

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p
    }
  }

  return possiblePaths[0] // Fallback
}

const getDocumentPath = (() => {
  const cache = new Map<string, string>()

  return (slug: string) => {
    if (!cache.has(slug)) {
      cache.set(slug, documentPath(slug))
    }
    return cache.get(slug)!
  }
})()

export const getDocument = cache(async (slug: string) => {
  try {
    const contentPath = getDocumentPath(slug)

    let mdx = ''
    let lastUpdated: string | null = null

    if (Settings.gitload) {
      const response = await fetch(contentPath)

      if (!response.ok) {
        throw new Error(`Failed to fetch content`)
      }

      mdx = await response.text()
      lastUpdated = response.headers.get('Last-Modified') ?? null
    } else {
      mdx = await fs.readFile(contentPath, 'utf-8')

      const stats = await fs.stat(contentPath)
      lastUpdated = stats.mtime.toISOString()
    }

    const rawContent = preprocessTabs(preprocessGithubAlerts(preprocessAdmonitions(mdx)))
    const parsedMatter = grayMatter(rawContent)
    const bodyContent = parsedMatter.content
    const frontmatter = { ...parsedMatter.data } as MdxHeaders

    let finalBodyContent = bodyContent
    if (!frontmatter.title) {
      const lines = bodyContent.split('\n')
      const h1Index = lines.findIndex((line) => line.trim().startsWith('# '))
      if (h1Index !== -1) {
        frontmatter.title = lines[h1Index].trim().replace(/^#\s+/, '')
        lines.splice(h1Index, 1)
        finalBodyContent = lines.join('\n')
      } else {
        frontmatter.title = 'USMP Documentation'
      }
    }

    if (!frontmatter.description) {
      const lines = finalBodyContent.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (
          trimmed &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('>') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('`')
        ) {
          frontmatter.description = trimmed.slice(0, 160) + (trimmed.length > 160 ? '...' : '')
          break
        }
      }
    }

    const updatedMdx = `---
title: "${frontmatter.title.replace(/"/g, '\\"')}"
description: "${(frontmatter.description || '').replace(/"/g, '\\"')}"
keywords: ${JSON.stringify(frontmatter.keywords || [])}
---
${finalBodyContent}`

    const parsedMdx = await parseMdx<MdxHeaders>(updatedMdx)
    const tocs = await getTable(slug)

    return {
      frontmatter: parsedMdx.frontmatter,
      content: parsedMdx.content,
      tocs,
      lastUpdated,
    }
  } catch (err) {
    console.error(err)
    return null
  }
})

const headingsRegex = /^(#{2,4})\s(.+)$/gm

export async function getTable(
  slug: string
): Promise<{ level: number; text: string; href: string }[]> {
  const extractedHeadings: {
    level: number
    text: string
    href: string
  }[] = []

  let mdx = ''
  if (Settings.gitload) {
    const contentPath = getDocumentPath(slug)
    try {
      const response = await fetch(contentPath)
      if (!response.ok) {
        throw new Error(`Failed to fetch content from GitHub: ${response.statusText}`)
      }
      mdx = await response.text()
    } catch (error) {
      console.error('Error fetching content from GitHub:', error)
      return []
    }
  } else {
    const contentPath = getDocumentPath(slug)
    try {
      const stream = createReadStream(contentPath, { encoding: 'utf-8' })
      for await (const chunk of stream) {
        mdx += chunk
      }
    } catch (error) {
      console.error('Error reading local file:', error)
      return []
    }
  }

  headingsRegex.lastIndex = 0

  let match = headingsRegex.exec(mdx)

  while (match !== null) {
    const level = match[1].length
    const text = match[2].trim()

    extractedHeadings.push({
      level,
      text,
      href: `#${innerslug(text)}`,
    })

    match = headingsRegex.exec(mdx)
  }

  return extractedHeadings
}

function innerslug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '')
}

const pathIndexMap = new Map(PageRoutes.map((route, index) => [route.href, index]))

export function getPreviousNext(path: string) {
  const index = pathIndexMap.get(`/${path}`)

  if (index === undefined || index === -1) {
    return { prev: null, next: null }
  }

  const prev = index > 0 ? PageRoutes[index - 1] : null
  const next = index < PageRoutes.length - 1 ? PageRoutes[index + 1] : null

  return { prev, next }
}

const preCopy = () => (tree: Node) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'pre') {
      const [codeEl] = node.children as Element[]
      if (codeEl?.tagName === 'code') {
        const textNode = codeEl.children?.[0] as Text
        node.raw = textNode?.value || ''
      }
    }
  })
}

const postCopy = () => (tree: Node) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'pre' && node.raw) {
      node.properties = node.properties || {}
      node.properties.raw = node.raw
    }
  })
}

function preprocessAdmonitions(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inAdmonition = false
  let admonitionIndent = 0
  let admonitionType = ''
  let admonitionTitle = ''
  let admonitionContentLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(\s*)!!!\s+([a-zA-Z0-9_-]+)(?:\s+"([^"]+)")?/)

    if (match) {
      if (inAdmonition) {
        result.push(renderAdmonition(admonitionType, admonitionTitle, admonitionContentLines))
        admonitionContentLines = []
      }
      inAdmonition = true
      admonitionIndent = match[1].length
      admonitionType = match[2]
      admonitionTitle = match[3] || match[2].charAt(0).toUpperCase() + match[2].slice(1)
      continue
    }

    if (inAdmonition) {
      const isBlank = line.trim() === ''
      const lineIndentMatch = line.match(/^(\s*)/)
      const lineIndent = lineIndentMatch ? lineIndentMatch[1].length : 0

      if (isBlank) {
        admonitionContentLines.push('')
      } else if (lineIndent > admonitionIndent) {
        const spacesToStrip = admonitionIndent + 4
        let cleanedLine = line
        if (line.startsWith(' '.repeat(spacesToStrip))) {
          cleanedLine = line.slice(spacesToStrip)
        } else if (line.startsWith('\t'.repeat(admonitionIndent / 4 + 1))) {
          cleanedLine = line.slice(admonitionIndent / 4 + 1)
        } else {
          cleanedLine = line.trimStart()
        }
        admonitionContentLines.push(cleanedLine)
      } else {
        inAdmonition = false
        result.push(renderAdmonition(admonitionType, admonitionTitle, admonitionContentLines))
        admonitionContentLines = []
        result.push(line)
      }
    } else {
      result.push(line)
    }
  }

  if (inAdmonition) {
    result.push(renderAdmonition(admonitionType, admonitionTitle, admonitionContentLines))
  }

  return result.join('\n')
}

function renderAdmonition(type: string, title: string, contentLines: string[]): string {
  let start = 0
  while (start < contentLines.length && contentLines[start].trim() === '') start++
  let end = contentLines.length
  while (end > start && contentLines[end - 1].trim() === '') end--
  const trimmed = contentLines.slice(start, end).join('\n')

  let noteType = 'note'
  if (type === 'success' || type === 'info' || type === 'note')
    noteType = type === 'info' ? 'note' : type
  else if (type === 'warning' || type === 'attention') noteType = 'warning'
  else if (type === 'danger' || type === 'error' || type === 'critical') noteType = 'danger'

  return `\n<Note type="${noteType}" title="${title}">\n${trimmed}\n</Note>\n`
}

function preprocessTabs(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^(\s*)===\s+"([^"]+)"/)

    if (match) {
      const baseIndent = match[1].length
      const groupTabs: { title: string; content: string }[] = []

      while (i < lines.length) {
        const currentLine = lines[i]
        const tabMatch = currentLine.match(/^(\s*)===\s+"([^"]+)"/)

        if (tabMatch && tabMatch[1].length === baseIndent) {
          const tabTitle = tabMatch[2]
          const tabContentLines: string[] = []
          i++

          while (i < lines.length) {
            const nextLine = lines[i]
            const isBlank = nextLine.trim() === ''
            const indentMatch = nextLine.match(/^(\s*)/)
            const indent = indentMatch ? indentMatch[1].length : 0

            if (isBlank) {
              tabContentLines.push('')
              i++
            } else if (indent > baseIndent) {
              const spacesToStrip = baseIndent + 4
              let cleanedLine = nextLine
              if (nextLine.startsWith(' '.repeat(spacesToStrip))) {
                cleanedLine = nextLine.slice(spacesToStrip)
              } else {
                cleanedLine = nextLine.trimStart()
              }
              tabContentLines.push(cleanedLine)
              i++
            } else {
              break
            }
          }

          let start = 0
          while (start < tabContentLines.length && tabContentLines[start].trim() === '') start++
          let end = tabContentLines.length
          while (end > start && tabContentLines[end - 1].trim() === '') end--

          groupTabs.push({
            title: tabTitle,
            content: tabContentLines.slice(start, end).join('\n'),
          })
        } else {
          break
        }
      }

      if (groupTabs.length > 0) {
        result.push(renderTabsGroup(groupTabs))
      }
    } else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

function renderTabsGroup(tabs: { title: string; content: string }[]): string {
  const sanitizeValue = (title: string) =>
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  const defaultVal = sanitizeValue(tabs[0].title)

  let tabsList = `  <TabsList>\n`
  let tabsContent = ''

  for (const tab of tabs) {
    const val = sanitizeValue(tab.title)
    tabsList += `    <TabsTrigger value="${val}">${tab.title}</TabsTrigger>\n`
    tabsContent += `<TabsContent value="${val}">\n\n${tab.content}\n\n</TabsContent>\n`
  }
  tabsList += `  </TabsList>\n`

  return `\n<Tabs defaultValue="${defaultVal}">\n${tabsList}${tabsContent}</Tabs>\n`
}

function preprocessGithubAlerts(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inAlert = false
  let alertType = ''
  let alertContentLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^>\s+\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i)

    if (match) {
      if (inAlert) {
        result.push(renderAlert(alertType, alertContentLines))
        alertContentLines = []
      }
      inAlert = true
      alertType = match[1].toUpperCase()
      continue
    }

    if (inAlert) {
      if (line.startsWith('> ')) {
        alertContentLines.push(line.slice(2))
      } else if (line.startsWith('>')) {
        alertContentLines.push(line.slice(1))
      } else {
        inAlert = false
        result.push(renderAlert(alertType, alertContentLines))
        alertContentLines = []
        result.push(line)
      }
    } else {
      result.push(line)
    }
  }

  if (inAlert) {
    result.push(renderAlert(alertType, alertContentLines))
  }

  return result.join('\n')
}

function renderAlert(type: string, contentLines: string[]): string {
  let start = 0
  while (start < contentLines.length && contentLines[start].trim() === '') start++
  let end = contentLines.length
  while (end > start && contentLines[end - 1].trim() === '') end--
  const trimmed = contentLines.slice(start, end).join('\n')

  let noteType = 'note'
  let title = 'Note'

  if (type === 'NOTE') {
    noteType = 'note'
    title = 'Note'
  } else if (type === 'TIP') {
    noteType = 'success'
    title = 'Tip'
  } else if (type === 'IMPORTANT') {
    noteType = 'note'
    title = 'Important'
  } else if (type === 'WARNING') {
    noteType = 'warning'
    title = 'Warning'
  } else if (type === 'CAUTION') {
    noteType = 'danger'
    title = 'Caution'
  }

  return `\n<Note type="${noteType}" title="${title}">\n${trimmed}\n</Note>\n`
}
