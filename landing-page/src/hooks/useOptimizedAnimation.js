/**
 * useOptimizedAnimation - Performance-optimized animation hooks
 * Features: Reduced motion support, RAF-based animations, GPU acceleration hints
 */
import { useState, useEffect, useRef, useMemo } from 'react'

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event) => setPrefersReducedMotion(event.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

/**
 * Optimized animation variants that respect reduced motion
 */
export function useAnimationVariants() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return useMemo(() => {
    if (prefersReducedMotion) {
      return {
        fadeIn: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.01 }
        },
        slideUp: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.01 }
        },
        scale: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.01 }
        },
        stagger: {
          container: {},
          item: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.01 }
          }
        }
      }
    }

    return {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      },
      scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      },
      stagger: {
        container: {
          animate: {
            transition: { staggerChildren: 0.05 }
          }
        },
        item: {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        }
      }
    }
  }, [prefersReducedMotion])
}

/**
 * RAF-based counter animation for numbers
 */
export function useCountUp(end, duration = 2000, start = 0, enabled = true) {
  const [count, setCount] = useState(start)
  const prefersReducedMotion = usePrefersReducedMotion()
  const frameRef = useRef()
  const startTimeRef = useRef()

  useEffect(() => {
    if (!enabled) return
    
    // Skip animation if reduced motion preferred
    if (prefersReducedMotion) {
      setCount(end)
      return
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(start + (end - start) * easeOutQuart)
      
      setCount(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [end, duration, start, enabled, prefersReducedMotion])

  return count
}

/**
 * Optimized scroll-based parallax effect
 */
export function useParallax(speed = 0.5, enabled = true) {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const ticking = useRef(false)

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            const scrolled = window.innerHeight - rect.top
            setOffset(scrolled * speed)
          }
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, enabled, prefersReducedMotion])

  return [elementRef, offset]
}

/**
 * Debounced resize observer for responsive animations
 */
export function useResizeObserver(debounceMs = 100) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const elementRef = useRef(null)
  const timeoutRef = useRef()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        const entry = entries[0]
        if (entry) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          })
        }
      }, debounceMs)
    })

    observer.observe(element)
    return () => {
      observer.disconnect()
      clearTimeout(timeoutRef.current)
    }
  }, [debounceMs])

  return [elementRef, size]
}

export default {
  usePrefersReducedMotion,
  useAnimationVariants,
  useCountUp,
  useParallax,
  useResizeObserver
}
