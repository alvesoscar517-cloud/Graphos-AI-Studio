/**
 * useIntersectionObserver - Performance-optimized intersection observer hook
 * Features: Shared observer instances, automatic cleanup, threshold options
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// Shared observer instances for better performance
const observerMap = new Map()

function getObserver(options) {
  const key = JSON.stringify(options)
  
  if (!observerMap.has(key)) {
    const callbacks = new Map()
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const callback = callbacks.get(entry.target)
        if (callback) {
          callback(entry)
        }
      })
    }, options)
    
    observerMap.set(key, { observer, callbacks })
  }
  
  return observerMap.get(key)
}

/**
 * Hook for observing element intersection with viewport
 * @param {Object} options - IntersectionObserver options
 * @param {boolean} options.triggerOnce - Only trigger once when element enters viewport
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Root margin for early/late triggering
 * @returns {[React.RefObject, boolean, IntersectionObserverEntry | null]}
 */
export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '0px',
  triggerOnce = true,
  enabled = true
} = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState(null)
  const elementRef = useRef(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return
    if (triggerOnce && hasTriggered.current) return

    const options = { threshold, rootMargin }
    const { observer, callbacks } = getObserver(options)

    const handleIntersect = (entry) => {
      const isVisible = entry.isIntersecting
      
      if (isVisible) {
        setIsIntersecting(true)
        setEntry(entry)
        
        if (triggerOnce) {
          hasTriggered.current = true
          observer.unobserve(element)
          callbacks.delete(element)
        }
      } else if (!triggerOnce) {
        setIsIntersecting(false)
        setEntry(entry)
      }
    }

    callbacks.set(element, handleIntersect)
    observer.observe(element)

    return () => {
      observer.unobserve(element)
      callbacks.delete(element)
    }
  }, [threshold, rootMargin, triggerOnce, enabled])

  return [elementRef, isIntersecting, entry]
}

/**
 * Hook for lazy loading content when element is near viewport
 * Optimized for images and heavy components
 */
export function useLazyLoad(rootMargin = '200px') {
  return useIntersectionObserver({
    rootMargin,
    threshold: 0,
    triggerOnce: true
  })
}

/**
 * Hook for triggering animations when element enters viewport
 */
export function useAnimateOnScroll(threshold = 0.1) {
  return useIntersectionObserver({
    threshold,
    rootMargin: '0px',
    triggerOnce: true
  })
}

/**
 * Hook for tracking element visibility (bi-directional)
 */
export function useVisibility(threshold = 0.5) {
  return useIntersectionObserver({
    threshold,
    rootMargin: '0px',
    triggerOnce: false
  })
}

export default useIntersectionObserver
