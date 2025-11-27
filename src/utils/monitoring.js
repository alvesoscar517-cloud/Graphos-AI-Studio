/**
 * Performance Monitoring Utilities
 * Track API calls, performance metrics, and user interactions
 */

import { CONFIG } from './config';

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

class PerformanceMonitor {
  constructor() {
    this.timers = new Map();
    this.metrics = [];
    this.maxMetrics = 100;
  }
  
  /**
   * Start timing an operation
   */
  start(operationName) {
    this.timers.set(operationName, {
      startTime: performance.now(),
      startTimestamp: Date.now()
    });
  }
  
  /**
   * End timing and return duration
   */
  end(operationName) {
    const timer = this.timers.get(operationName);
    if (!timer) return 0;
    
    const duration = performance.now() - timer.startTime;
    this.timers.delete(operationName);
    
    // Store metric
    this.addMetric({
      operation: operationName,
      duration,
      timestamp: timer.startTimestamp
    });
    
    return Math.round(duration);
  }
  
  /**
   * Add metric to history
   */
  addMetric(metric) {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }
  
  /**
   * Get average duration for an operation
   */
  getAverageDuration(operationName) {
    const operationMetrics = this.metrics.filter(m => m.operation === operationName);
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(total / operationMetrics.length);
  }
  
  /**
   * Get all metrics for an operation
   */
  getMetrics(operationName = null) {
    if (operationName) {
      return this.metrics.filter(m => m.operation === operationName);
    }
    return [...this.metrics];
  }
  
  /**
   * Clear all metrics
   */
  clear() {
    this.timers.clear();
    this.metrics = [];
  }
  
  /**
   * Get performance summary
   */
  getSummary() {
    const operations = new Map();
    
    for (const metric of this.metrics) {
      if (!operations.has(metric.operation)) {
        operations.set(metric.operation, {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0
        });
      }
      
      const stats = operations.get(metric.operation);
      stats.count++;
      stats.totalDuration += metric.duration;
      stats.minDuration = Math.min(stats.minDuration, metric.duration);
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
    }
    
    const summary = {};
    for (const [operation, stats] of operations) {
      summary[operation] = {
        count: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count),
        minDuration: Math.round(stats.minDuration),
        maxDuration: Math.round(stats.maxDuration)
      };
    }
    
    return summary;
  }
}

// ============================================================================
// API TRACKER
// ============================================================================

class ApiTracker {
  constructor() {
    this.calls = [];
    this.errors = [];
    this.maxHistory = 50;
  }
  
  /**
   * Track API call
   */
  trackCall(endpoint, duration, metadata = {}) {
    const call = {
      endpoint,
      duration,
      timestamp: Date.now(),
      ...metadata
    };
    
    this.calls.push(call);
    
    if (this.calls.length > this.maxHistory) {
      this.calls.shift();
    }
    
    if (CONFIG.ENABLE_DEBUG_LOGS) {
      console.log(`[API] ${endpoint} completed in ${duration}ms`, metadata);
    }
  }
  
  /**
   * Track API error
   */
  trackError(endpoint, error, metadata = {}) {
    const errorRecord = {
      endpoint,
      error: error.message || String(error),
      code: error.code,
      timestamp: Date.now(),
      ...metadata
    };
    
    this.errors.push(errorRecord);
    
    if (this.errors.length > this.maxHistory) {
      this.errors.shift();
    }
    
    if (CONFIG.ENABLE_DEBUG_LOGS) {
      console.error(`[API ERROR] ${endpoint}:`, error);
    }
  }
  
  /**
   * Get API statistics
   */
  getStats() {
    const now = Date.now();
    const last5Min = now - 5 * 60 * 1000;
    
    const recentCalls = this.calls.filter(c => c.timestamp > last5Min);
    const recentErrors = this.errors.filter(e => e.timestamp > last5Min);
    
    return {
      totalCalls: this.calls.length,
      totalErrors: this.errors.length,
      recentCalls: recentCalls.length,
      recentErrors: recentErrors.length,
      errorRate: this.calls.length > 0 
        ? (this.errors.length / this.calls.length * 100).toFixed(2) + '%'
        : '0%',
      avgDuration: recentCalls.length > 0
        ? Math.round(recentCalls.reduce((sum, c) => sum + c.duration, 0) / recentCalls.length)
        : 0
    };
  }
  
  /**
   * Get recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }
  
  /**
   * Clear history
   */
  clear() {
    this.calls = [];
    this.errors = [];
  }
}

// ============================================================================
// USER INTERACTION TRACKER
// ============================================================================

class InteractionTracker {
  constructor() {
    this.interactions = [];
    this.maxHistory = 100;
  }
  
  /**
   * Track user interaction
   */
  track(action, details = {}) {
    const interaction = {
      action,
      details,
      timestamp: Date.now()
    };
    
    this.interactions.push(interaction);
    
    if (this.interactions.length > this.maxHistory) {
      this.interactions.shift();
    }
    
    if (CONFIG.ENABLE_DEBUG_LOGS) {
      console.log(`[INTERACTION] ${action}`, details);
    }
  }
  
  /**
   * Get interaction history
   */
  getHistory(action = null) {
    if (action) {
      return this.interactions.filter(i => i.action === action);
    }
    return [...this.interactions];
  }
  
  /**
   * Get interaction counts
   */
  getCounts() {
    const counts = {};
    for (const interaction of this.interactions) {
      counts[interaction.action] = (counts[interaction.action] || 0) + 1;
    }
    return counts;
  }
}

// ============================================================================
// MEMORY MONITOR
// ============================================================================

class MemoryMonitor {
  /**
   * Get current memory usage (if available)
   */
  getUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
  
  /**
   * Check if memory usage is high
   */
  isHighUsage() {
    const usage = this.getUsage();
    if (!usage) return false;
    
    return usage.usedJSHeapSize > usage.jsHeapSizeLimit * 0.8;
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const perfMonitor = new PerformanceMonitor();
export const apiTracker = new ApiTracker();
export const interactionTracker = new InteractionTracker();
export const memoryMonitor = new MemoryMonitor();

// ============================================================================
// GLOBAL MONITORING OBJECT
// ============================================================================

export const monitoring = {
  performance: perfMonitor,
  api: apiTracker,
  interactions: interactionTracker,
  memory: memoryMonitor,
  
  /**
   * Get full monitoring report
   */
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      performance: perfMonitor.getSummary(),
      api: apiTracker.getStats(),
      interactions: interactionTracker.getCounts(),
      memory: memoryMonitor.getUsage()
    };
  },
  
  /**
   * Clear all monitoring data
   */
  clearAll() {
    perfMonitor.clear();
    apiTracker.clear();
    interactionTracker.interactions = [];
  }
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.__monitoring = monitoring;
}

export default monitoring;
