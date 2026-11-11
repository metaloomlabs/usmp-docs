'use client'

import { memo, useEffect, useRef } from 'react'

interface MermaidProps {
  chart: string
  className?: string
}

const normalizeChart = (input?: string): string => {
  if (!input) return ''

  return input
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

let mermaidPromise: Promise<typeof import('mermaid')> | null = null

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
      })
      return m
    })
  }
  return mermaidPromise
}

export const Mermaid = memo(({ chart, className }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const current = ref.current

    if (!current || !chart) return

    let isMounted = true

    const renderChart = async () => {
      const id = `mermaid-${crypto.randomUUID().replace(/[^a-zA-Z0-9]/g, '')}`

      try {
        const { default: mermaid } = await getMermaid()
        const { svg } = await mermaid.render(id, normalizeChart(chart))
        if (!isMounted || !ref.current) return

        const parser = new DOMParser()
        const doc = parser.parseFromString(svg, 'image/svg+xml')
        const svgElement = doc.documentElement

        if (svgElement && svgElement.nodeName.toLowerCase() === 'svg') {
          // Defensively strip any script tags
          const scripts = svgElement.querySelectorAll('script')
          for (let i = 0; i < scripts.length; i++) {
            scripts[i].remove()
          }

          // Defensively strip any inline event handlers and unsafe URI schemes
          const allElements = svgElement.querySelectorAll('*')
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i]
            for (const attr of Array.from(el.attributes)) {
              const attrName = attr.name.toLowerCase()
              const attrVal = attr.value.trim().toLowerCase()
              if (attrName.startsWith('on')) {
                el.removeAttribute(attr.name)
              }
              if (
                (attrName === 'href' || attrName === 'xlink:href') &&
                attrVal.startsWith('javascript:')
              ) {
                el.removeAttribute(attr.name)
              }
            }
          }

          ref.current.replaceChildren(svgElement)
        } else {
          ref.current.replaceChildren()
        }
      } catch (err) {
        if (!isMounted || !ref.current) return
        ref.current.replaceChildren()
        const pre = document.createElement('pre')
        pre.className =
          'text-xs text-destructive p-3 rounded-md bg-destructive/10 border border-destructive/20 font-mono overflow-x-auto'
        pre.textContent = `Mermaid rendering error: ${
          err instanceof Error ? err.message : String(err)
        }`
        ref.current.appendChild(pre)
      }
    }

    void renderChart()

    return () => {
      isMounted = false
    }
  }, [chart])

  return <div ref={ref} className={className} />
})
