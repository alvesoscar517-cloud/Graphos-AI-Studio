/**
 * Async Utilities - Powered by p-* libraries
 * Proven patterns for concurrent operations, retries, and timeouts
 * 
 * @module utils/async
 */

const pLimit = require('p-limit');
const pRetry = require('p-retry');
const pTimeout = require('p-timeout');
const pMap = require('p-map');

// ============================================================================
// CONCURRENCY CONTROL
// ============================================================================

/**
 * Default concurrency limiter (10 concurrent operations)
 */
const defaultLimit = pLimit(10);

/**
 * Create a concurrency limiter
 * @param {number} concurrency - Maximum concurrent operations
 * @returns {Function} Limiter function
 */
function createLimit(concurrency = 10) {
  return pLimit(concurrency);
}

/**
 * Run function with concurrency limit
 * @param {Function} fn - Async function to run
 * @param {Function} limiter - Limiter function (optional)
 * @returns {Promise<*>} Result of function
 */
function withLimit(fn, limiter = defaultLimit) {
  return limiter(fn);
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 10000,
  factor: 2,
  randomize: true
};

/**
 * Run function with automatic retry
 * @param {Function} fn - Async function to run
 * @param {Object} options - Retry options
 * @returns {Promise<*>} Result of function
 */
async function withRetry(fn, options = {}) {
  const mergedOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  
  return pRetry(fn, {
    retries: mergedOptions.retries,
    minTimeout: mergedOptions.minTimeout,
    maxTimeout: mergedOptions.maxTimeout,
    factor: mergedOptions.factor,
    randomize: mergedOptions.randomize,
    onFailedAttempt: (error) => {
      if (options.onFailedAttempt) {
        options.onFailedAttempt(error);
      }
      // Log retry attempts
      console.log(`Retry attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
    }
  });
}

/**
 * Create a retryable function
 * @param {Function} fn - Async function to make retryable
 * @param {Object} options - Retry options
 * @returns {Function} Retryable function
 */
function makeRetryable(fn, options = {}) {
  return (...args) => withRetry(() => fn(...args), options);
}

// ============================================================================
// TIMEOUT HANDLING
// ============================================================================

/**
 * Default timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Run promise with timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Custom timeout message
 * @returns {Promise<*>} Result or timeout error
 */
async function withTimeout(promise, ms = DEFAULT_TIMEOUT, message) {
  return pTimeout(promise, {
    milliseconds: ms,
    message: message || `Operation timed out after ${ms}ms`
  });
}

/**
 * Create a function with automatic timeout
 * @param {Function} fn - Async function to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Function} Function with timeout
 */
function withTimeoutFn(fn, ms = DEFAULT_TIMEOUT) {
  return async (...args) => {
    return withTimeout(fn(...args), ms);
  };
}

// ============================================================================
// PARALLEL EXECUTION
// ============================================================================

/**
 * Map over items with controlled concurrency
 * @param {Array} items - Items to process
 * @param {Function} fn - Async function to apply to each item
 * @param {Object} options - Options
 * @param {number} options.concurrency - Max concurrent operations (default: 5)
 * @param {boolean} options.stopOnError - Stop on first error (default: true)
 * @returns {Promise<Array>} Results array
 */
async function mapConcurrent(items, fn, options = {}) {
  const { concurrency = 5, stopOnError = true } = options;
  
  return pMap(items, fn, {
    concurrency,
    stopOnError
  });
}

/**
 * Map over items with retry for each
 * @param {Array} items - Items to process
 * @param {Function} fn - Async function to apply to each item
 * @param {Object} options - Options
 * @returns {Promise<Array>} Results array
 */
async function mapWithRetry(items, fn, options = {}) {
  const { concurrency = 5, retries = 3, ...retryOptions } = options;
  
  return pMap(
    items,
    (item, index) => withRetry(() => fn(item, index), { retries, ...retryOptions }),
    { concurrency }
  );
}

// ============================================================================
// COMBINED UTILITIES
// ============================================================================

/**
 * Run function with retry, timeout, and concurrency limit
 * @param {Function} fn - Async function to run
 * @param {Object} options - Options
 * @returns {Promise<*>} Result of function
 */
async function withAll(fn, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = 3,
    limiter = defaultLimit,
    ...retryOptions
  } = options;
  
  return limiter(() =>
    withTimeout(
      withRetry(fn, { retries, ...retryOptions }),
      timeout
    )
  );
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run functions in sequence
 * @param {Array<Function>} fns - Array of async functions
 * @returns {Promise<Array>} Results array
 */
async function sequence(fns) {
  const results = [];
  for (const fn of fns) {
    results.push(await fn());
  }
  return results;
}

/**
 * Run function with exponential backoff on failure
 * @param {Function} fn - Async function to run
 * @param {Object} options - Options
 * @returns {Promise<*>} Result of function
 */
async function withBackoff(fn, options = {}) {
  const {
    maxAttempts = 5,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2
  } = options;
  
  let attempt = 0;
  let currentDelay = initialDelay;
  
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      await delay(currentDelay);
      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Concurrency
  createLimit,
  withLimit,
  defaultLimit,
  
  // Retry
  withRetry,
  makeRetryable,
  DEFAULT_RETRY_OPTIONS,
  
  // Timeout
  withTimeout,
  withTimeoutFn,
  DEFAULT_TIMEOUT,
  
  // Parallel
  mapConcurrent,
  mapWithRetry,
  
  // Combined
  withAll,
  withBackoff,
  
  // Utilities
  delay,
  sequence,
  
  // Re-export libraries for advanced usage
  pLimit,
  pRetry,
  pTimeout,
  pMap
};
