import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 767 // Below 768px (md breakpoint)

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Handle SSR - default to false
    if (typeof window === 'undefined') return false
    return window.innerWidth <= MOBILE_BREAKPOINT
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return { isMobile }
}
