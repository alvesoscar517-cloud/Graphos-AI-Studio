/**
 * Performance Utilities
 * Helper functions for performance optimization
 * Enhanced: Dec 2025 - Added more utilities for landing page optimization
 */

/**
 * Debounce function to limit execution rate
 */
export function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Throttle function to limit execution rate (RAF-based for smoother animations)
 */
export function throttle(fn, limit) {
  let inThrottle
  let lastArgs
  return function (...args) {
    lastArgs = args
    if (!inThrottle) {
      fn.apply(this, lastArgs)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * RAF-based throttle for scroll/resize handlers
 */
export function rafThrottle(fn) {
  let ticking = false
  let lastArgs
  
  return function (...args) {
    lastArgs = args
    if (!ticking) {
      requestAnimationFrame(() => {
        fn.apply(this, lastArgs)
        ticking = false
      })
      ticking = true
    }
  }
}

/**
 * Check if browser supports WebP
 */
let webpSupport = null
export async function supportsWebP() {
  if (typeof window === 'undefined') return false
  if (webpSupport !== null) return webpSupport

  const webpData =
    'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      webpSupport = img.width > 0 && img.height > 0
      resolve(webpSupport)
    }
    img.onerror = () => {
      webpSupport = false
      resolve(false)
    }
    img.src = webpData
  })
}

/**
 * Check if browser supports AVIF
 */
let avifSupport = null
export async function supportsAVIF() {
  if (typeof window === 'undefined') return false
  if (avifSupport !== null) return avifSupport

  const avifData =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABc0WkCGntQkAAAAACAAIABoAB3IA'

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      avifSupport = img.width > 0 && img.height > 0
      resolve(avifSupport)
    }
    img.onerror = () => {
      avifSupport = false
      resolve(false)
    }
    img.src = avifData
  })
}

/**
 * Get optimized image URL based on viewport and format support
 */
export async function getOptimizedImageUrl(src, width) {
  // If using a CDN that supports image optimization, modify URL here
  // For now, return original src
  return src
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources) {
  resources.forEach(({ href, as, type, crossOrigin }) => {
    // Check if already preloaded
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    if (crossOrigin) link.crossOrigin = crossOrigin
    document.head.appendChild(link)
  })
}

/**
 * Preload route chunks for faster navigation
 */
export function preloadRoute(importFn) {
  requestIdleCallback(() => {
    importFn()
  }, { timeout: 2000 })
}

/**
 * Measure component render time (development only)
 */
export function measureRenderTime(componentName) {
  if (process.env.NODE_ENV !== 'development') return { start: () => {}, end: () => {} }

  let startTime
  return {
    start: () => {
      startTime = performance.now()
    },
    end: () => {
      const endTime = performance.now()
      console.log(`[Performance] ${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`)
    },
  }
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback
    : (cb, options) => {
        const start = Date.now()
        return setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
          })
        }, options?.timeout || 1)
      }

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && window.cancelIdleCallback
    ? window.cancelIdleCallback
    : clearTimeout

/**
 * Check if device is low-end (for reducing animations)
 */
export function isLowEndDevice() {
  if (typeof window === 'undefined') return false
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true
  }
  
  // Check device memory (if available)
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
    return true
  }
  
  return false
}

/**
 * Check if connection is slow
 */
export function isSlowConnection() {
  if (typeof window === 'undefined') return false
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!connection) return false
  
  // Check effective type
  if (connection.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
    return true
  }
  
  // Check save data mode
  if (connection.saveData) {
    return true
  }
  
  return false
}

/**
 * Defer non-critical work
 */
export function deferWork(fn, priority = 'background') {
  if (priority === 'user-visible') {
    // Use requestAnimationFrame for user-visible updates
    requestAnimationFrame(fn)
  } else {
    // Use requestIdleCallback for background work
    requestIdleCallback(fn, { timeout: 5000 })
  }
}

/**
 * Create a simple LRU cache for expensive computations
 */
export function createLRUCache(maxSize = 50) {
  const cache = new Map()
  
  return {
    get(key) {
      if (cache.has(key)) {
        // Move to end (most recently used)
        const value = cache.get(key)
        cache.delete(key)
        cache.set(key, value)
        return value
      }
      return undefined
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.delete(key)
      } else if (cache.size >= maxSize) {
        // Delete oldest (first) entry
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
      cache.set(key, value)
    },
    clear() {
      cache.clear()
    }
  }
}
