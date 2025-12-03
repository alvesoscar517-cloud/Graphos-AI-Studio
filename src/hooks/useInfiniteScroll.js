/**
 * useInfiniteScroll Hook
 * Handle infinite scrolling with intersection observer
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for infinite scroll functionality
 * @param {Function} onLoadMore - Callback when reaching the end
 * @param {Object} options - Configuration options
 */
export function useInfiniteScroll(onLoadMore, options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    hasMore = true,
    isLoading = false,
  } = options

  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading && enabled) {
        onLoadMore()
      }
    },
    [onLoadMore, hasMore, isLoading, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    })

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleIntersect, threshold, rootMargin, enabled])

  // Ref to attach to the sentinel element
  const sentinelRef = useCallback((node) => {
    if (loadMoreRef.current && observerRef.current) {
      observerRef.current.unobserve(loadMoreRef.current)
    }

    loadMoreRef.current = node

    if (node && observerRef.current) {
      observerRef.current.observe(node)
    }
  }, [])

  return { sentinelRef, isLoading }
}

/**
 * Hook for scroll position tracking
 */
export function useScrollPosition(options = {}) {
  const { element = null, throttle = 100 } = options
  const positionRef = useRef({ x: 0, y: 0 })
  const lastUpdateRef = useRef(0)

  useEffect(() => {
    const target = element || window

    const handleScroll = () => {
      const now = Date.now()
      if (now - lastUpdateRef.current < throttle) return

      lastUpdateRef.current = now

      if (element) {
        positionRef.current = {
          x: element.scrollLeft,
          y: element.scrollTop,
        }
      } else {
        positionRef.current = {
          x: window.scrollX,
          y: window.scrollY,
        }
      }
    }

    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => target.removeEventListener('scroll', handleScroll)
  }, [element, throttle])

  return positionRef
}

/**
 * Hook to scroll to top
 */
export function useScrollToTop() {
  const scrollToTop = useCallback((behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior })
  }, [])

  return scrollToTop
}

export default useInfiniteScroll
