/**
 * Pure utility to resolve Markdown links (relative or absolute)
 * according to document routing hierarchy.
 */

export interface ResolvedLink {
  href: string
  isExternal: boolean
}

const EXTERNAL_URL_REGEX = /^(https?:|mailto:|tel:|ftp:|\/\/)/i

export function resolveMarkdownLink(
  href: string = '#',
  currentPath: string = '/docs'
): ResolvedLink {
  if (!href || href === '#') {
    return { href: '#', isExternal: false }
  }

  // External URLs (http, https, mailto, etc.)
  if (EXTERNAL_URL_REGEX.test(href)) {
    return { href, isExternal: true }
  }

  // In-page hash anchor
  if (href.startsWith('#')) {
    return { href, isExternal: false }
  }

  // Query parameter on current page
  if (href.startsWith('?')) {
    return { href: `${currentPath}${href}`, isExternal: false }
  }

  // Separate path from query and hash
  let pathPart = href
  let hashPart = ''
  let searchPart = ''

  const hashIndex = pathPart.indexOf('#')
  if (hashIndex !== -1) {
    hashPart = pathPart.slice(hashIndex)
    pathPart = pathPart.slice(0, hashIndex)
  }

  const searchIndex = pathPart.indexOf('?')
  if (searchIndex !== -1) {
    searchPart = pathPart.slice(searchIndex)
    pathPart = pathPart.slice(0, searchIndex)
  }

  // If path is empty, it was just query/hash
  if (!pathPart) {
    return { href: `${currentPath}${searchPart}${hashPart}`, isExternal: false }
  }

  // Strip .md or .mdx extensions
  if (pathPart.endsWith('.md')) {
    pathPart = pathPart.slice(0, -3)
  } else if (pathPart.endsWith('.mdx')) {
    pathPart = pathPart.slice(0, -4)
  }

  // Handle absolute paths (e.g. '/downloads' or '/docs/getting-started')
  if (pathPart.startsWith('/')) {
    let normalized = pathPart.replace(/\/+/g, '/')
    if (normalized === '/docs/index' || normalized === '/docs/welcome') {
      normalized = '/docs'
    }
    return { href: `${normalized}${searchPart}${hashPart}`, isExternal: false }
  }

  // Relative path resolution
  // Determine current document's base directory
  const cleanCurrent =
    currentPath.length > 1 && currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath

  const segments = cleanCurrent.split('/').filter(Boolean)
  // For '/docs/getting-started/installation', segments = ['docs', 'getting-started', 'installation']
  // Parent directory segments = ['docs', 'getting-started']
  // If at '/docs', parent directory segments = ['docs']
  const baseSegments = segments.length <= 1 ? ['docs'] : segments.slice(0, -1)

  const relativeParts = pathPart.split('/')
  for (const part of relativeParts) {
    if (!part || part === '.') {
      continue
    }
    if (part === '..') {
      if (baseSegments.length > 1) {
        baseSegments.pop()
      }
    } else {
      baseSegments.push(part)
    }
  }

  let resolved = `/${baseSegments.join('/')}`

  // Normalize root document aliases
  if (resolved === '/docs/index' || resolved === '/docs/welcome') {
    resolved = '/docs'
  }

  // Map known custom slugs if any
  if (resolved === '/docs/troubleshooting/guides') {
    resolved = '/docs/troubleshooting'
  } else if (resolved === '/docs/troubleshooting/debugging') {
    resolved = '/docs/debugging'
  }

  return {
    href: `${resolved}${searchPart}${hashPart}`,
    isExternal: false,
  }
}
