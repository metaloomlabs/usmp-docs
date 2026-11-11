'use client'

import { tokenizeHighlight } from '@/lib/search'
import { cn } from '@/lib/utils'

export interface SearchHighlightProps {
  text: string
  query: string
  className?: string
}

/**
 * Safely renders highlighted text without dangerouslySetInnerHTML.
 * Matches are wrapped in `<span className="highlight">`, while non-matches
 * and document content are rendered as native React text nodes.
 */
export function SearchHighlight({ text, query, className }: SearchHighlightProps) {
  const tokens = tokenizeHighlight(text, query)

  return (
    <>
      {tokens.map((token, index) =>
        token.isMatch ? (
          <span key={index} className={cn('highlight', className)}>
            {token.text}
          </span>
        ) : (
          token.text
        )
      )}
    </>
  )
}
