/**
 * Gemini Circuit Breaker Wrapper
 * Provides circuit breaker protection for Gemini API calls
 * 
 * @module utils/geminiCircuitBreaker
 */

const { createGeminiBreaker } = require('./circuitBreaker');
const logger = require('./logger');

// ============================================================================
// CIRCUIT BREAKER INSTANCES
// ============================================================================

let embeddingBreaker = null;
let generationBreaker = null;

/**
 * Get or create embedding circuit breaker
 */
function getEmbeddingBreaker() {
  if (!embeddingBreaker) {
    embeddingBreaker = createGeminiBreaker(async () => {
      // This is a placeholder - actual function is passed at call time
      throw new Error('Function not provided');
    });
    
    // Add fallback for embedding failures
    embeddingBreaker.fallback(() => {
      logger.warn('Embedding circuit breaker fallback triggered');
      return null; // Return null to indicate fallback was used
    });
  }
  return embeddingBreaker;
}

/**
 * Get or create generation circuit breaker
 */
function getGenerationBreaker() {
  if (!generationBreaker) {
    generationBreaker = createGeminiBreaker(async () => {
      throw new Error('Function not provided');
    });
    
    generationBreaker.fallback(() => {
      logger.warn('Generation circuit breaker fallback triggered');
      throw new Error('AI service temporarily unavailable. Please try again later.');
    });
  }
  return generationBreaker;
}

// ============================================================================
// WRAPPER FUNCTIONS
// ============================================================================

/**
 * Execute embedding request with circuit breaker protection
 * @param {Function} fn - Async function to execute
 * @returns {Promise<*>}
 */
async function withEmbeddingProtection(fn) {
  const breaker = getEmbeddingBreaker();
  
  // Create a new breaker instance for this specific call
  const CircuitBreaker = require('opossum');
  const protectedFn = new CircuitBreaker(fn, {
    timeout: 60000,
    errorThresholdPercentage: 40,
    resetTimeout: 60000,
    volumeThreshold: 3,
    errorFilter: (error) => {
      // Don't trip on rate limit errors
      return error.message?.includes('QUOTA_EXCEEDED') ||
             error.message?.includes('429') ||
             error.message?.includes('quota');
    }
  });
  
  protectedFn.on('open', () => {
    logger.error('Embedding circuit breaker OPENED');
  });
  
  protectedFn.on('halfOpen', () => {
    logger.info('Embedding circuit breaker half-open');
  });
  
  protectedFn.on('close', () => {
    logger.info('Embedding circuit breaker CLOSED');
  });
  
  try {
    return await protectedFn.fire();
  } catch (error) {
    if (error.code === 'EOPENBREAKER') {
      logger.warn('Embedding request rejected - circuit open');
      throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
    }
    throw error;
  }
}

/**
 * Execute generation request with circuit breaker protection
 * @param {Function} fn - Async function to execute
 * @returns {Promise<*>}
 */
async function withGenerationProtection(fn) {
  const CircuitBreaker = require('opossum');
  const protectedFn = new CircuitBreaker(fn, {
    timeout: 120000, // 2 minutes for generation
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
    volumeThreshold: 3,
    errorFilter: (error) => {
      // Don't trip on content safety blocks or rate limits
      return error.message?.includes('SAFETY') ||
             error.message?.includes('blocked') ||
             error.message?.includes('QUOTA_EXCEEDED') ||
             error.message?.includes('429');
    }
  });
  
  protectedFn.on('open', () => {
    logger.error('Generation circuit breaker OPENED');
  });
  
  protectedFn.on('close', () => {
    logger.info('Generation circuit breaker CLOSED');
  });
  
  try {
    return await protectedFn.fire();
  } catch (error) {
    if (error.code === 'EOPENBREAKER') {
      logger.warn('Generation request rejected - circuit open');
      throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
    }
    throw error;
  }
}

/**
 * Simple retry wrapper with exponential backoff
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @returns {Promise<*>}
 */
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = (error) => {
      // Retry on transient errors
      return error.message?.includes('UNAVAILABLE') ||
             error.message?.includes('DEADLINE_EXCEEDED') ||
             error.message?.includes('INTERNAL') ||
             error.code === 'ECONNRESET';
    }
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      logger.debug(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Combined protection: circuit breaker + retry
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Options
 * @returns {Promise<*>}
 */
async function withFullProtection(fn, options = {}) {
  const { type = 'generation', ...retryOptions } = options;
  
  const protectedFn = type === 'embedding' 
    ? () => withEmbeddingProtection(fn)
    : () => withGenerationProtection(fn);
  
  return withRetry(protectedFn, retryOptions);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  withEmbeddingProtection,
  withGenerationProtection,
  withRetry,
  withFullProtection,
  getEmbeddingBreaker,
  getGenerationBreaker
};
