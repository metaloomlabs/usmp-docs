'use client'

import { type ReactElement, useEffect, useState } from 'react'
import { LuArrowUp } from 'react-icons/lu'

export function BackToTop(): ReactElement {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function toggleVisible() {
      const { scrollTop } = document.documentElement
      setIsVisible(scrollTop >= 300)
    }

    window.addEventListener('scroll', toggleVisible)
    toggleVisible() // Set initial state
    
    return () => {
      window.removeEventListener('scroll', toggleVisible)
    }
  }, [])

  function ScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={ScrollToTop}
      title="Scroll to top"
      aria-label="Scroll to top"
      type="button"
      className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all duration-300 hover:border-emerald-500/30 hover:bg-muted hover:text-emerald-500 hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <LuArrowUp className="h-5 w-5" />
    </button>
  )
}
