import { Documents } from '@/settings/documents'

export type Paths =
  | {
      title: string
      href: string
      noLink?: true
      heading?: string
      items?: Paths[]
    }
  | {
      spacer: true
    }

export const Routes: Paths[] = [...Documents]

interface Page {
  title: string
  href: string
}

function isRoute(node: Paths): node is Extract<Paths, { title: string; href: string }> {
  return 'title' in node && 'href' in node
}

function getAllLinks(node: Paths): Page[] {
  const pages: Page[] = []

  if (isRoute(node) && !node.noLink) {
    pages.push({ title: node.title, href: node.href })
  }

  if (isRoute(node) && node.items) {
    node.items.forEach((subNode) => {
      if (isRoute(subNode)) {
        const temp = { ...subNode, href: `${node.href}${subNode.href}` }
        pages.push(...getAllLinks(temp))
      }
    })
  }

  return pages
}

export const PageRoutes = Routes.flatMap((it) => getAllLinks(it))

/**
 * Checks whether a documentation path is routable based on the Documents hierarchy and noLink settings.
 */
export function isRouteRoutable(docPath: string): boolean {
  const normalized = docPath.startsWith('/') ? docPath : `/${docPath}`

  if (PageRoutes.some((route) => route.href === normalized)) {
    return true
  }

  function checkNode(nodes: Paths[], prefix = ''): boolean | null {
    for (const node of nodes) {
      if ('spacer' in node && node.spacer) continue
      if ('href' in node) {
        const fullHref = `${prefix}${node.href}`
        if (fullHref === normalized) {
          if (node.noLink) return false
          return true
        }
        if (node.items && normalized.startsWith(fullHref)) {
          const res = checkNode(node.items, fullHref)
          if (res !== null) return res
        }
      }
    }
    return null
  }

  const res = checkNode(Documents)
  if (res !== null) {
    return res
  }

  return false
}
