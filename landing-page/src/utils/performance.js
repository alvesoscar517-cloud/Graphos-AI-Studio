/**
 * Performance Utilities
 * Helper functions for performance optimization
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
 * Throttle function to limit execution rate
 */
export function throttle(fn, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if browser supports WebP
 */
export async function supportsWebP() {
  if (typeof window === 'undefined') return false

  const webpData =
    'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.width > 0 && img.height > 0)
    img.onerror = () => resolve(false)
    img.src = webpData
  })
}

/**
 * Get optimized image URL based on viewport
 */
export function getOptimizedImageUrl(src, width) {
  // If using a CDN that supports image optimization, modify URL here
  // For now, return original src
  return src
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources) {
  resources.forEach(({ href, as, type }) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    document.head.appendChild(link)
  })
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
    : (cb) => setTimeout(cb, 1)

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && window.cancelIdleCallback
    ? window.cancelIdleCallback
    : clearTimeout
