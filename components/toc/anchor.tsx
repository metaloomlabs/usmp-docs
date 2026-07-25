'use client'

import { type MouseEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { LuAlignLeft } from 'react-icons/lu'
import { cn } from '@/lib/utils'

export interface TableAnchorProps {
  tocs: { href: string; level: number; text: string }[]
}

export function TableAnchor({ tocs }: TableAnchorProps) {
  const [activeHref, setActiveHref] = useState<string>('')

  useEffect(() => {
    if (!tocs.length) return

    const handleScroll = () => {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4'))
      if (!headings.length) return

      const scrollPosition = window.scrollY + 100
      let currentActiveHref = ''

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLElement
        const top = heading.offsetTop

        if (scrollPosition >= top) {
          const headingId = heading.id
          const headingText = heading.innerText.trim()

          const match = tocs.find(
            (t) =>
              (headingId && t.href.endsWith(headingId)) ||
              t.text.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                headingText.toLowerCase().replace(/[^a-z0-9]/g, '')
          )

          if (match) {
            currentActiveHref = match.href
          }
        }
      }

      if (currentActiveHref) {
        setActiveHref(currentActiveHref)
      } else if (tocs[0]) {
        setActiveHref(tocs[0].href)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
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
              (h as HTMLElement).innerText.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTocText
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
