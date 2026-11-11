'use client'

import { type ComponentProps, isValidElement, useEffect, useRef, useState } from 'react'

import { Copy } from '@/components/markdown/copy'
import { Mermaid } from '@/components/markdown/mermaid'

export function Pre({ children, raw, ...rest }: ComponentProps<'pre'> & { raw?: string }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [content, setContent] = useState<string>(raw || '')

  useEffect(() => {
    if (raw) {
      setContent(raw)
    } else if (preRef.current) {
      setContent(preRef.current.innerText || preRef.current.textContent || '')
    }
  }, [raw])

  const isMermaid =
    Boolean(rest.className?.includes('language-mermaid')) ||
    (isValidElement(children) &&
      typeof children.props === 'object' &&
      children.props !== null &&
      'className' in children.props &&
      typeof (children.props as { className?: string }).className === 'string' &&
      Boolean((children.props as { className?: string }).className?.includes('language-mermaid')))

  if (isMermaid) {
    return (
      <div className="group relative my-5 max-w-full min-w-0 overflow-hidden rounded-lg border border-border bg-card p-4">
        {content ? (
          <div className="absolute top-3 right-2.5 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
            <Copy content={content} />
          </div>
        ) : null}
        <div className="flex justify-center overflow-x-auto py-2">
          <Mermaid chart={content || raw || ''} />
        </div>
      </div>
    )
  }

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
