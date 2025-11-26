/**
 * Monitoring and Analytics Utilities
 * Track performance, errors, and user behavior
 */

/**
 * Performance monitoring
 */
class PerformanceMonitor {
  constructor() {
    this.marks = new Map()
    this.measures = []
  }

  /**
   * Start timing an operation
   * @param {string} name 
   */
  start(name) {
    this.marks.set(name, performance.now())
  }

  /**
   * End timing and log duration
   * @param {string} name 
   * @returns {number} Duration in ms
   */
  end(name) {
    const startTime = this.marks.get(name)
    if (!startTime) {
      console.warn(`⚠️ No start mark found for: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(name)

    const measure = {
      name,
      duration,
      timestamp: new Date().toISOString()
    }

    this.measures.push(measure)
    
    // Keep only last 100 measures
    if (this.measures.length > 100) {
      this.measures.shift()
    }

    // Log slow operations (> 1s)
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`)
    } else {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Get performance statistics
   * @returns {Object}
   */
  getStats() {
    if (this.measures.length === 0) return null

    const durations = this.measures.map(m => m.duration)
    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const max = Math.max(...durations)
    const min = Math.min(...durations)

    return {
      count: this.measures.length,
      average: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      total: sum.toFixed(2)
    }
  }

  /**
   * Clear all measures
   */
  clear() {
    this.marks.clear()
    this.measures = []
  }
}

// Global instance
export const perfMonitor = new PerformanceMonitor()

/**
 * Track API calls
 */
class APITracker {
  constructor() {
    this.calls = []
    this.errors = []
  }

  /**
   * Track successful API call
   * @param {string} endpoint 
   * @param {number} duration 
   * @param {Object} metadata 
   */
  trackCall(endpoint, duration, metadata = {}) {
    this.calls.push({
      endpoint,
      duration,
      metadata,
      timestamp: new Date().toISOString(),
      success: true
    })

    // Keep only last 50 calls
    if (this.calls.length > 50) {
      this.calls.shift()
    }
  }

  /**
   * Track API error
   * @param {string} endpoint 
   * @param {Error} error 
   * @param {Object} metadata 
   */
  trackError(endpoint, error, metadata = {}) {
    this.errors.push({
      endpoint,
      error: error.message,
      code: error.code,
      metadata,
      timestamp: new Date().toISOString()
    })

    // Keep only last 20 errors
    if (this.errors.length > 20) {
      this.errors.shift()
    }

    console.error(`❌ API Error [${endpoint}]:`, error.message)
  }

  /**
   * Get API statistics
   * @returns {Object}
   */
  getStats() {
    const totalCalls = this.calls.length
    const totalErrors = this.errors.length
    const successRate = totalCalls > 0 
      ? ((totalCalls / (totalCalls + totalErrors)) * 100).toFixed(2)
      : 0

    const avgDuration = this.calls.length > 0
      ? (this.calls.reduce((sum, call) => sum + call.duration, 0) / this.calls.length).toFixed(2)
      : 0

    return {
      totalCalls,
      totalErrors,
      successRate: `${successRate}%`,
      avgDuration: `${avgDuration}ms`,
      recentErrors: this.errors.slice(-5)
    }
  }

  /**
   * Clear all tracking data
   */
  clear() {
    this.calls = []
    this.errors = []
  }
}

// Global instance
export const apiTracker = new APITracker()

/**
 * Memory usage monitoring
 */
export function logMemoryUsage() {
  if (performance.memory) {
    const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2)
    const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2)
    const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
    
    console.log(`💾 Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`)
    
    // Warn if using > 80% of limit
    const usage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
    if (usage > 80) {
      console.warn(`⚠️ High memory usage: ${usage.toFixed(2)}%`)
    }
  }
}

/**
 * User action tracking
 */
export function trackUserAction(action, metadata = {}) {
  console.log(`👤 User Action: ${action}`, metadata)
  
  // TODO: Send to analytics service
  // if (window.gtag) {
  //   window.gtag('event', action, metadata)
  // }
}

/**
 * Feature usage tracking
 */
export function trackFeatureUsage(feature, metadata = {}) {
  console.log(`✨ Feature Used: ${feature}`, metadata)
  
  // Store in localStorage for analytics
  try {
    const key = `feature_usage_${feature}`
    const current = parseInt(localStorage.getItem(key) || '0')
    localStorage.setItem(key, (current + 1).toString())
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Get all monitoring data
 */
export function getMonitoringReport() {
  return {
    performance: perfMonitor.getStats(),
    api: apiTracker.getStats(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Clear all monitoring data
 */
export function clearMonitoring() {
  perfMonitor.clear()
  apiTracker.clear()
  console.log('🧹 Monitoring data cleared')
}
