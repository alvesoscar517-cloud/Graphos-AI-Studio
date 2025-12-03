/**
 * Circuit Breaker Utility
 * Uses opossum library for production-ready circuit breaking
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failures exceeded threshold, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 * 
 * @module utils/circuitBreaker
 */

const CircuitBreakerLib = require('opossum');
const logger = require('./logger');

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS = {
  timeout: 30000,           // 30 seconds - time before request is considered failed
  errorThresholdPercentage: 50, // Open circuit when 50% of requests fail
  resetTimeout: 30000,      // 30 seconds - time before trying again after opening
  volumeThreshold: 5,       // Minimum requests before calculating error percentage
  rollingCountTimeout: 10000, // 10 seconds - rolling window for stats
  rollingCountBuckets: 10,  // Number of buckets in rolling window
  
  // Caching
  cache: false,             // Don't cache by default
  cacheTTL: 0,
  
  // Capacity
  capacity: 100,            // Max concurrent requests
  
  // Allow specific errors to not trip the circuit
  errorFilter: null,
};

// ============================================================================
// CIRCUIT BREAKER WRAPPER CLASS
// ============================================================================

class CircuitBreaker {
  /**
   * Create a new circuit breaker using opossum
   * @param {Function} fn - Async function to protect
   * @param {Object} options - Configuration options
   */
  constructor(fn, options = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    this.name = options.name || 'default';
    this.breaker = new CircuitBreakerLib(fn, mergedOptions);
    
    // Setup event listeners
    this._setupEventListeners();
  }
  
  /**
   * Setup event listeners for logging and monitoring
   */
  _setupEventListeners() {
    this.breaker.on('success', (result, latencyMs) => {
      logger.debug('Circuit breaker success', { 
        name: this.name, 
        latencyMs 
      });
    });
    
    this.breaker.on('timeout', () => {
      logger.warn('Circuit breaker timeout', { name: this.name });
    });
    
    this.breaker.on('reject', () => {
      logger.warn('Circuit breaker rejected (open)', { name: this.name });
    });
    
    this.breaker.on('open', () => {
      logger.error('Circuit breaker OPENED', { 
        name: this.name,
        stats: this.getStats()
      });
    });
    
    this.breaker.on('halfOpen', () => {
      logger.info('Circuit breaker half-open, testing...', { name: this.name });
    });
    
    this.breaker.on('close', () => {
      logger.info('Circuit breaker CLOSED (recovered)', { name: this.name });
    });
    
    this.breaker.on('fallback', (result) => {
      logger.debug('Circuit breaker fallback executed', { name: this.name });
    });
    
    this.breaker.on('failure', (error) => {
      logger.warn('Circuit breaker failure', { 
        name: this.name, 
        error: error.message 
      });
    });
  }
  
  /**
   * Execute the protected function
   * @param {...*} args - Arguments to pass to the function
   * @returns {Promise<*>} Result of the function
   */
  async fire(...args) {
    return this.breaker.fire(...args);
  }
  
  /**
   * Alias for fire()
   */
  async execute(...args) {
    return this.fire(...args);
  }
  
  /**
   * Set fallback function
   * @param {Function} fn - Fallback function
   * @returns {CircuitBreaker} This instance for chaining
   */
  fallback(fn) {
    this.breaker.fallback(fn);
    return this;
  }
  
  /**
   * Check if circuit is open
   * @returns {boolean}
   */
  isOpen() {
    return !this.breaker.closed;
  }
  
  /**
   * Check if circuit is closed
   * @returns {boolean}
   */
  isClosed() {
    return this.breaker.closed;
  }
  
  /**
   * Check if circuit is half-open
   * @returns {boolean}
   */
  isHalfOpen() {
    return this.breaker.halfOpen;
  }
  
  /**
   * Get current state
   * @returns {string} 'CLOSED', 'OPEN', or 'HALF_OPEN'
   */
  getState() {
    if (this.breaker.halfOpen) return 'HALF_OPEN';
    if (this.breaker.opened) return 'OPEN';
    return 'CLOSED';
  }
  
  /**
   * Get circuit breaker statistics
   * @returns {Object}
   */
  getStats() {
    const stats = this.breaker.stats;
    return {
      name: this.name,
      state: this.getState(),
      successes: stats.successes,
      failures: stats.failures,
      rejects: stats.rejects,
      timeouts: stats.timeouts,
      fallbacks: stats.fallbacks,
      latencyMean: stats.latencyMean,
      latencyPercentiles: {
        p50: stats.percentiles['50'],
        p90: stats.percentiles['90'],
        p95: stats.percentiles['95'],
        p99: stats.percentiles['99'],
      },
      cacheHits: stats.cacheHits,
      cacheMisses: stats.cacheMisses,
      fires: stats.fires,
    };
  }
  
  /**
   * Reset the circuit breaker
   */
  reset() {
    this.breaker.close();
    logger.info('Circuit breaker reset', { name: this.name });
  }
  
  /**
   * Force open the circuit
   */
  open() {
    this.breaker.open();
    logger.warn('Circuit breaker force opened', { name: this.name });
  }
  
  /**
   * Force close the circuit
   */
  close() {
    this.breaker.close();
    logger.info('Circuit breaker force closed', { name: this.name });
  }
  
  /**
   * Enable the circuit breaker
   */
  enable() {
    this.breaker.enable();
  }
  
  /**
   * Disable the circuit breaker (pass-through mode)
   */
  disable() {
    this.breaker.disable();
  }
  
  /**
   * Shutdown the circuit breaker
   */
  shutdown() {
    this.breaker.shutdown();
  }
  
  /**
   * Get the underlying opossum instance
   * @returns {CircuitBreakerLib}
   */
  getNativeBreaker() {
    return this.breaker;
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    this.breaker.on(event, handler);
    return this;
  }
}

// ============================================================================
// CIRCUIT BREAKER REGISTRY
// ============================================================================

const breakers = new Map();

/**
 * Create or get a circuit breaker for a function
 * @param {string} name - Circuit breaker name
 * @param {Function} fn - Function to protect
 * @param {Object} options - Configuration options
 * @returns {CircuitBreaker}
 */
function createBreaker(name, fn, options = {}) {
  if (breakers.has(name)) {
    return breakers.get(name);
  }
  
  const breaker = new CircuitBreaker(fn, { name, ...options });
  breakers.set(name, breaker);
  return breaker;
}

/**
 * Get an existing circuit breaker
 * @param {string} name - Circuit breaker name
 * @returns {CircuitBreaker|undefined}
 */
function getBreaker(name) {
  return breakers.get(name);
}

/**
 * Execute function with named circuit breaker
 * @param {string} name - Circuit breaker name
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Circuit breaker options
 * @returns {Promise<*>}
 */
async function withCircuitBreaker(name, fn, options = {}) {
  let breaker = breakers.get(name);
  
  if (!breaker) {
    breaker = createBreaker(name, fn, options);
  }
  
  return breaker.fire();
}

/**
 * Get all circuit breaker states
 * @returns {Object[]} Array of circuit breaker states
 */
function getAllStates() {
  return Array.from(breakers.values()).map(b => b.getStats());
}

/**
 * Reset all circuit breakers
 */
function resetAll() {
  for (const breaker of breakers.values()) {
    breaker.reset();
  }
}

/**
 * Shutdown all circuit breakers
 */
function shutdownAll() {
  for (const breaker of breakers.values()) {
    breaker.shutdown();
  }
  breakers.clear();
}

// ============================================================================
// PRE-CONFIGURED BREAKER FACTORIES
// ============================================================================

/**
 * Create circuit breaker for Gemini API calls
 * @param {Function} fn - Function to protect
 * @returns {CircuitBreaker}
 */
function createGeminiBreaker(fn) {
  return createBreaker('gemini', fn, {
    timeout: 60000,              // 60 seconds for AI calls
    errorThresholdPercentage: 40,
    resetTimeout: 60000,         // 1 minute before retry
    volumeThreshold: 3,
    
    // Don't trip on rate limit errors (they're expected)
    errorFilter: (error) => {
      return error.code === 'RATE_LIMITED' || 
             error.message?.includes('429') ||
             error.message?.includes('quota');
    }
  });
}

/**
 * Create circuit breaker for external HTTP calls
 * @param {Function} fn - Function to protect
 * @returns {CircuitBreaker}
 */
function createHttpBreaker(fn) {
  return createBreaker('http', fn, {
    timeout: 15000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 5,
  });
}

/**
 * Create circuit breaker for LemonSqueezy API
 * @param {Function} fn - Function to protect
 * @returns {CircuitBreaker}
 */
function createLemonSqueezyBreaker(fn) {
  return createBreaker('lemonsqueezy', fn, {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
    volumeThreshold: 3,
  });
}

/**
 * Create circuit breaker for Redis operations
 * @param {Function} fn - Function to protect
 * @returns {CircuitBreaker}
 */
function createRedisBreaker(fn) {
  return createBreaker('redis', fn, {
    timeout: 5000,
    errorThresholdPercentage: 60,
    resetTimeout: 10000,
    volumeThreshold: 10,
  });
}

/**
 * Create circuit breaker for email sending
 * @param {Function} fn - Function to protect
 * @returns {CircuitBreaker}
 */
function createEmailBreaker(fn) {
  return createBreaker('email', fn, {
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
    volumeThreshold: 3,
  });
}

// ============================================================================
// HEALTH CHECK INTEGRATION
// ============================================================================

/**
 * Get health status of all circuit breakers
 * @returns {Object} Health status
 */
function getHealthStatus() {
  const states = getAllStates();
  const openBreakers = states.filter(s => s.state === 'OPEN');
  
  return {
    healthy: openBreakers.length === 0,
    totalBreakers: states.length,
    openBreakers: openBreakers.length,
    breakers: states.map(s => ({
      name: s.name,
      state: s.state,
      failures: s.failures,
      successes: s.successes,
    }))
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Classes
  CircuitBreaker,
  
  // Registry functions
  createBreaker,
  getBreaker,
  withCircuitBreaker,
  getAllStates,
  resetAll,
  shutdownAll,
  
  // Pre-configured factories
  createGeminiBreaker,
  createHttpBreaker,
  createLemonSqueezyBreaker,
  createRedisBreaker,
  createEmailBreaker,
  
  // Health check
  getHealthStatus,
  
  // Default options for reference
  DEFAULT_OPTIONS,
};
