'use client'

import { useState } from 'react'
import { LuChevronDown } from 'react-icons/lu'

import { FAQS } from './faq-data'

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
      <div className="text-center mb-16">
        <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
          FAQ
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-muted-foreground">
          Clear up common questions about integration, security properties, and protocol operations.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card/40 overflow-hidden hover:border-emerald-500/10 transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:bg-neutral-900/10 transition-colors duration-150 font-sans"
            >
              <span>{item.question}</span>
              <LuChevronDown
                className={`size-4 text-neutral-500 transition-transform duration-200 ${
                  openFaq === idx ? 'rotate-180 text-emerald-500' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                openFaq === idx ? 'max-h-60 border-t border-border/30 p-5' : 'max-h-0'
              } overflow-hidden bg-neutral-50 dark:bg-neutral-950/20 text-sm text-muted-foreground leading-relaxed`}
            >
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
