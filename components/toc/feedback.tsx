'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LuPencil,
  LuMessageSquare,
  LuLink,
  LuCheck,
  LuSparkles,
  LuDownload,
  LuExternalLink,
} from 'react-icons/lu'
import { GitHubLink, DiscordLink } from '@/settings/navigation'
import { buttonVariants } from '@/components/ui/button'

interface FeedbackProps {
  title: string
  slug: string
  relativeFilePath?: string
}

export function Feedback({ slug, title, relativeFilePath }: FeedbackProps) {
  const [copied, setCopied] = useState(false)

  const feedbackUrl = `${GitHubLink.href}/issues/new?title=Feedback for "${title}"&labels=feedback`
  const editUrl = `${GitHubLink.href}/edit/main/${relativeFilePath || `contents/docs/${slug}/index.mdx`}`

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-border/60">
      <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-medium">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Community & Actions
        </span>

        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-foreground transition-colors group"
        >
          <LuPencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>Edit page on GitHub</span>
        </a>

        <a
          href={feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-foreground transition-colors group"
        >
          <LuMessageSquare className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>Submit page feedback</span>
        </a>

        <button
          onClick={handleCopyLink}
          type="button"
          className="flex items-center gap-2 hover:text-foreground transition-colors group cursor-pointer text-left"
        >
          {copied ? (
            <LuCheck className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <LuLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          <span>{copied ? 'URL Copied!' : 'Copy page URL'}</span>
        </button>
      </div>

      {/* Protocol Quick Release Card */}
      <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            <LuSparkles className="w-3 h-3" /> USMP v1.2.0
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">Public</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          End-to-end encrypted tunnels for ESP32 & Python backends.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/downloads"
            className={buttonVariants({ variant: 'default', size: 'xs', className: 'w-full gap-1 text-[11px] font-semibold' })}
          >
            <LuDownload className="w-3 h-3" /> Downloads
          </Link>
          {DiscordLink.href && (
            <a
              href={DiscordLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'xs', className: 'gap-1 text-[11px]' })}
              title="Join Discord Community"
            >
              <LuExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
