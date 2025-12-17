/**
 * ScrollToTop - Scrolls to top on route change
 * Ensures page starts at top when navigating between routes
 */
import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  // Use useLayoutEffect for synchronous scroll before paint
  useLayoutEffect(() => {
    // Don't scroll if there's a hash (anchor link)
    if (!hash) {
      // Try multiple scroll methods for compatibility
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop
