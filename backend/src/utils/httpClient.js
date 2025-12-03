/**
 * HTTP Client - Powered by got
 * Robust HTTP client with built-in retry, timeout, and error handling
 * Includes circuit breaker protection for external APIs
 * 
 * @module utils/httpClient
 */

const got = require('got');
const logger = require('./logger');
const { getCorrelationId } = require('./logger');
const { httpBreaker, withCircuitBreaker } = require('./circuitBreaker');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_LIMIT = 3;

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  limit: DEFAULT_RETRY_LIMIT,
  methods: ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
  statusCodes: [408, 413, 429, 500, 502, 503, 504],
  errorCodes: [
    'ETIMEDOUT',
    'ECONNRESET',
    'EADDRINUSE',
    'ECONNREFUSED',
    'EPIPE',
    'ENOTFOUND',
    'ENETUNREACH',
    'EAI_AGAIN'
  ],
  calculateDelay: ({ attemptCount }) => attemptCount * 1000
};

// ============================================================================
// HTTP CLIENT INSTANCE
// ============================================================================

/**
 * Create base HTTP client with default configuration
 */
const httpClient = got.extend({
  timeout: {
    request: DEFAULT_TIMEOUT
  },
  retry: RETRY_CONFIG,
  hooks: {
    beforeRequest: [
      (options) => {
        // Add correlation ID
        const correlationId = getCorrelationId();
        if (correlationId) {
          options.headers['x-correlation-id'] = correlationId;
        }
        
        // Add request timestamp
        options.context = options.context || {};
        options.context.requestStart = Date.now();
        
        logger.debug('HTTP request', {
          method: options.method,
          url: options.url?.toString(),
          correlationId
        });
      }
    ],
    afterResponse: [
      (response) => {
        const duration = Date.now() - (response.request.options.context?.requestStart || Date.now());
        
        logger.debug('HTTP response', {
          method: response.request.options.method,
          url: response.url,
          statusCode: response.statusCode,
          duration: `${duration}ms`
        });
        
        return response;
      }
    ],
    beforeRetry: [
      (error, retryCount) => {
        logger.warn('HTTP retry', {
          url: error.request?.requestUrl,
          attempt: retryCount,
          error: error.message
        });
      }
    ],
    beforeError: [
      (error) => {
        const duration = Date.now() - (error.request?.options?.context?.requestStart || Date.now());
        
        logger.error('HTTP error', {
          url: error.request?.requestUrl,
          statusCode: error.response?.statusCode,
          duration: `${duration}ms`,
          error: error.message
        });
        
        return error;
      }
    ]
  },
  responseType: 'json'
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make GET request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise<*>} Response body
 */
async function get(url, options = {}) {
  const response = await httpClient.get(url, options);
  return response.body;
}

/**
 * Make POST request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise<*>} Response body
 */
async function post(url, data, options = {}) {
  const response = await httpClient.post(url, {
    json: data,
    ...options
  });
  return response.body;
}

/**
 * Make PUT request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise<*>} Response body
 */
async function put(url, data, options = {}) {
  const response = await httpClient.put(url, {
    json: data,
    ...options
  });
  return response.body;
}

/**
 * Make PATCH request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise<*>} Response body
 */
async function patch(url, data, options = {}) {
  const response = await httpClient.patch(url, {
    json: data,
    ...options
  });
  return response.body;
}

/**
 * Make DELETE request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise<*>} Response body
 */
async function del(url, options = {}) {
  const response = await httpClient.delete(url, options);
  return response.body;
}

// ============================================================================
// SPECIALIZED CLIENTS
// ============================================================================

/**
 * Create client with custom base URL
 * @param {string} baseUrl - Base URL for all requests
 * @param {Object} options - Additional options
 * @returns {Object} HTTP client instance
 */
function createClient(baseUrl, options = {}) {
  return httpClient.extend({
    prefixUrl: baseUrl,
    ...options
  });
}

/**
 * Create client with authentication
 * @param {string} baseUrl - Base URL
 * @param {string} token - Bearer token
 * @param {Object} options - Additional options
 * @returns {Object} HTTP client instance
 */
function createAuthenticatedClient(baseUrl, token, options = {}) {
  return httpClient.extend({
    prefixUrl: baseUrl,
    headers: {
      Authorization: `Bearer ${token}`
    },
    ...options
  });
}

/**
 * Create client with API key
 * @param {string} baseUrl - Base URL
 * @param {string} apiKey - API key
 * @param {string} headerName - Header name for API key
 * @param {Object} options - Additional options
 * @returns {Object} HTTP client instance
 */
function createApiKeyClient(baseUrl, apiKey, headerName = 'X-API-Key', options = {}) {
  return httpClient.extend({
    prefixUrl: baseUrl,
    headers: {
      [headerName]: apiKey
    },
    ...options
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Check if error is a timeout error
 * @param {Error} error - Error to check
 * @returns {boolean} True if timeout error
 */
function isTimeoutError(error) {
  return error.code === 'ETIMEDOUT' || error.name === 'TimeoutError';
}

/**
 * Check if error is a network error
 * @param {Error} error - Error to check
 * @returns {boolean} True if network error
 */
function isNetworkError(error) {
  const networkCodes = ['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ENETUNREACH'];
  return networkCodes.includes(error.code);
}

/**
 * Check if error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if retryable
 */
function isRetryableError(error) {
  if (isTimeoutError(error) || isNetworkError(error)) {
    return true;
  }
  
  const statusCode = error.response?.statusCode;
  return RETRY_CONFIG.statusCodes.includes(statusCode);
}

/**
 * Extract error message from HTTP error
 * @param {Error} error - HTTP error
 * @returns {string} Error message
 */
function getErrorMessage(error) {
  if (error.response?.body?.error) {
    return error.response.body.error;
  }
  if (error.response?.body?.message) {
    return error.response.body.message;
  }
  return error.message;
}

// ============================================================================
// CIRCUIT BREAKER PROTECTED REQUESTS
// ============================================================================

/**
 * Make GET request with circuit breaker protection
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @param {string} breakerName - Circuit breaker name (default: 'http')
 * @returns {Promise<*>} Response body
 */
async function safeGet(url, options = {}, breakerName = 'http') {
  return withCircuitBreaker(breakerName, () => get(url, options));
}

/**
 * Make POST request with circuit breaker protection
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Request options
 * @param {string} breakerName - Circuit breaker name (default: 'http')
 * @returns {Promise<*>} Response body
 */
async function safePost(url, data, options = {}, breakerName = 'http') {
  return withCircuitBreaker(breakerName, () => post(url, data, options));
}

/**
 * Make PUT request with circuit breaker protection
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Request options
 * @param {string} breakerName - Circuit breaker name (default: 'http')
 * @returns {Promise<*>} Response body
 */
async function safePut(url, data, options = {}, breakerName = 'http') {
  return withCircuitBreaker(breakerName, () => put(url, data, options));
}

/**
 * Make DELETE request with circuit breaker protection
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @param {string} breakerName - Circuit breaker name (default: 'http')
 * @returns {Promise<*>} Response body
 */
async function safeDel(url, options = {}, breakerName = 'http') {
  return withCircuitBreaker(breakerName, () => del(url, options));
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main client
  httpClient,
  
  // Helper methods
  get,
  post,
  put,
  patch,
  delete: del,
  
  // Circuit breaker protected methods
  safeGet,
  safePost,
  safePut,
  safeDelete: safeDel,
  
  // Client factories
  createClient,
  createAuthenticatedClient,
  createApiKeyClient,
  
  // Error utilities
  isTimeoutError,
  isNetworkError,
  isRetryableError,
  getErrorMessage,
  
  // Configuration
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_LIMIT,
  RETRY_CONFIG
};
