'use client'

import { type ComponentProps, useRef, useState, useEffect } from 'react'
import { Copy } from '@/components/markdown/copy'

export function Pre({ children, raw, ...rest }: ComponentProps<'pre'> & { raw?: string }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [content, setContent] = useState<string>(raw || '')

  useEffect(() => {
    if (raw) {
      setContent(raw)
    } else if (preRef.current) {
      setContent(preRef.current.innerText || preRef.current.textContent || '')
    }
  }, [raw, children])

  return (
    <div className="group relative my-5 max-w-full min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      {content ? (
        <div className="absolute top-3 right-2.5 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
          <Copy content={content} />
        </div>
      ) : null}
      <div className="relative max-w-full overflow-x-auto">
        <pre ref={preRef} className="max-w-full overflow-x-auto p-4 text-sm font-mono" {...rest}>
          {children}
        </pre>
      </div>
    </div>
  )
}
