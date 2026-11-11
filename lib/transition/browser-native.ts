import { usePathname } from 'next/navigation'
import { use, useEffect, useRef, useState } from 'react'

import { useHash } from './use-hash'

export function useBrowserNativeTransitions() {
  const pathname = usePathname()
  const currentPathname = useRef(pathname)

  const [currentViewTransition, setCurrentViewTransition] = useState<
    [Promise<void>, () => void] | null
  >(null)

  useEffect(() => {
    if (!('startViewTransition' in document)) {
      return
    }

    const onPopState = () => {
      let pendingViewTransitionResolve: () => void

      const pendingViewTransition = new Promise<void>((resolve) => {
        pendingViewTransitionResolve = resolve
      })

      const pendingStartViewTransition = new Promise<void>((resolve) => {
        const transition = document.startViewTransition(() => {
          resolve()
          return pendingViewTransition
        })
        transition.finished.catch(() => {})
        transition.ready.catch(() => {})
        transition.updateCallbackDone.catch(() => {})
      })

      setCurrentViewTransition([pendingStartViewTransition, pendingViewTransitionResolve!])
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  if (currentViewTransition && currentPathname.current !== pathname) {
    use(currentViewTransition[0])
  }

  const transitionRef = useRef(currentViewTransition)
  useEffect(() => {
    transitionRef.current = currentViewTransition
  }, [currentViewTransition])

  const hash = useHash()
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const finishTransition = () => {
      currentPathname.current = pathname
      if (transitionRef.current) {
        transitionRef.current[1]()
        transitionRef.current = null
      }
    }

    finishTransition()
  }, [hash, pathname])
}
