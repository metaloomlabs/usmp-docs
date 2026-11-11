'use client'

import Link from 'next/link'
import { type MouseEvent, useEffect, useState } from 'react'
import { LuAlignLeft } from 'react-icons/lu'

import { cn } from '@/lib/utils'

export interface TableAnchorProps {
  tocs: { href: string; level: number; text: string }[]
}

export function TableAnchor({ tocs }: TableAnchorProps) {
  const [activeHref, setActiveHref] = useState<string>('')

  useEffect(() => {
    if (!tocs.length) return
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    // Set initial active href to matching hash or first toc item
    const hash = window.location.hash
    if (hash && tocs.some((t) => t.href === hash)) {
      setActiveHref(hash)
    } else if (tocs[0]) {
      setActiveHref(tocs[0].href)
    }

    const headingElements = Array.from(document.querySelectorAll('h2, h3, h4'))
    if (!headingElements.length) return

    // Map each heading element to its matching TOC href
    const elementToHref = new Map<Element, string>()
    for (const heading of headingElements) {
      const headingId = heading.id
      const headingText = (heading.textContent || '').trim()
      const match = tocs.find(
        (t) =>
          (headingId && (t.href === `#${headingId}` || t.href.endsWith(headingId))) ||
          t.text.toLowerCase().replace(/[^a-z0-9]/g, '') ===
            headingText.toLowerCase().replace(/[^a-z0-9]/g, '')
      )
      if (match) {
        elementToHref.set(heading, match.href)
      }
    }

    const visibleHeadings = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleHeadings.add(entry.target)
          } else {
            visibleHeadings.delete(entry.target)
          }
        }

        // If headings are in the active observation band, pick the first one in document order
        if (visibleHeadings.size > 0) {
          for (const heading of headingElements) {
            if (visibleHeadings.has(heading)) {
              const href = elementToHref.get(heading)
              if (href) {
                setActiveHref(href)
                break
              }
            }
          }
        } else {
          // If none are currently intersecting, determine the most recent heading passed
          const topMargin = 100
          let lastAboveHref: string | null = null
          for (const heading of headingElements) {
            const rect = heading.getBoundingClientRect()
            if (rect.top <= topMargin) {
              const href = elementToHref.get(heading)
              if (href) lastAboveHref = href
            } else {
              break
            }
          }

          if (lastAboveHref) {
            setActiveHref(lastAboveHref)
          } else if (window.scrollY < 100 && tocs[0]) {
            setActiveHref(tocs[0].href)
          }
        }
      },
      {
        rootMargin: '-80px 0% -60% 0%',
        threshold: 0,
      }
    )

    for (const heading of headingElements) {
      if (elementToHref.has(heading)) {
        observer.observe(heading)
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [tocs])

  const handleSmoothScroll = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setActiveHref(href)

    const id = href.startsWith('#') ? href.slice(1) : href
    let targetElement = document.getElementById(id)

    if (!targetElement) {
      const matchingToc = tocs.find((t) => t.href === href)
      if (matchingToc) {
        const cleanTocText = matchingToc.text.toLowerCase().replace(/[^a-z0-9]/g, '')
        const headings = Array.from(document.querySelectorAll('h2, h3, h4'))
        targetElement =
          (headings.find(
            (h) =>
              (h as HTMLElement).textContent?.toLowerCase().replace(/[^a-z0-9]/g, '') ===
              cleanTocText
          ) as HTMLElement) || null
      }
    }

    if (targetElement) {
      const topOffset = targetElement.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: topOffset, behavior: 'smooth' })
      window.history.pushState(null, '', href)
    }
  }

  if (!tocs.length) return null

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <LuAlignLeft className="w-3.5 h-3.5 text-primary" />
        <span>On this page</span>
      </div>

      <nav aria-label="Table of contents navigation" className="relative">
        <div className="flex flex-col gap-1 text-xs font-medium border-l border-border/60 pl-3">
          {tocs.map(({ href, level, text }, index) => {
            const isActive = activeHref === href

            return (
              <Link
                key={`${href}-${index}`}
                href={href}
                title={text}
                aria-label={text}
                scroll={false}
                onClick={(e) => handleSmoothScroll(e, href)}
                className={cn(
                  'relative py-1 transition-all duration-200 line-clamp-2',
                  level === 3 && 'pl-2 text-[11px]',
                  level === 4 && 'pl-4 text-[11px]',
                  isActive
                    ? 'font-bold text-primary translate-x-0.5 -ml-[13px] pl-3 border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:translate-x-0.5'
                )}
              >
                {text}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
