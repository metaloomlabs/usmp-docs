'use client'

import { usePathname } from 'next/navigation'
import { type AnchorHTMLAttributes, type ReactNode } from 'react'

import { resolveMarkdownLink } from '@/lib/resolve-link'
import { Link } from '@/lib/transition'

interface RouteProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  children: ReactNode
}

export function Route({
  href = '#',
  children,
  className,
  title,
  target,
  rel,
  ...rest
}: RouteProps) {
  const pathname = usePathname() || '/docs'
  const resolved = resolveMarkdownLink(href, pathname)

  if (resolved.isExternal) {
    return (
      <a
        href={resolved.href}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        className={className}
        title={title}
        {...rest}
      >
        {children}
      </a>
    )
  }

  // Pure anchor fragment on the current page
  if (resolved.href.startsWith('#')) {
    return (
      <a href={resolved.href} className={className} title={title} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Link href={resolved.href} className={className} title={title} {...rest}>
      {children}
    </Link>
  )
}
