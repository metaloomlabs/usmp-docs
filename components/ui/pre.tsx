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
    <div className="group relative my-5">
      {content ? (
        <div className="absolute top-3 right-2.5 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
          <Copy content={content} />
        </div>
      ) : null}
      <div className="relative">
        <pre ref={preRef} {...rest}>
          {children}
        </pre>
      </div>
    </div>
  )
}
