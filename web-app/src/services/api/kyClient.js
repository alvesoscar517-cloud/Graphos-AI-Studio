/**
 * Enhanced API Client using ky
 * Production-ready HTTP client with retry, timeout, and error handling
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request/response hooks
 * - Timeout handling
 * - JSON parsing
 * - Error normalization
 */

import { logger } from '../../utils/logger'
import ky from 'ky';
import { CONFIG } from '../../utils/config';
import { tokenService } from '../tokenService';
import { ApiError, ERROR_MESSAGES } from './errorHandler';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// TIMEOUT TIERS FOR DIFFERENT OPERATION TYPES
// ============================================================================

// Standard AI timeout (2 minutes) - for detection, analysis, suggestions
const STANDARD_AI_TIMEOUT = 120000;

// Heavy AI timeout (3 minutes) - for rewrite, humanization check
const HEAVY_AI_TIMEOUT = 180000;

// Iterative/Streaming timeout (5 minutes) - for iterative humanization, streaming
const STREAMING_TIMEOUT = 300000;

// Endpoint timeout mapping
const ENDPOINT_TIMEOUTS = {
  // Standard AI operations (2 min)
  '/authenticate': STANDARD_AI_TIMEOUT,
  '/analysis/authenticate': STANDARD_AI_TIMEOUT,
  '/analyze': STANDARD_AI_TIMEOUT,
  '/analysis/analyze': STANDARD_AI_TIMEOUT,
  '/suggest_improvements': STANDARD_AI_TIMEOUT,
  '/analysis/suggest-improvements': STANDARD_AI_TIMEOUT,
  '/api/translate': STANDARD_AI_TIMEOUT,
  '/analysis/translate': STANDARD_AI_TIMEOUT,
  '/add_sample': STANDARD_AI_TIMEOUT,
  '/profiles/add-sample': STANDARD_AI_TIMEOUT,
  
  // Heavy AI operations (3 min)
  '/rewrite': HEAVY_AI_TIMEOUT,
  '/analysis/rewrite': HEAVY_AI_TIMEOUT,
  '/check-humanization': HEAVY_AI_TIMEOUT,
  '/analysis/check-humanization': HEAVY_AI_TIMEOUT,
  '/api/chat': STANDARD_AI_TIMEOUT,
  '/api/chat/humanized': HEAVY_AI_TIMEOUT,
  '/add_samples_batch': HEAVY_AI_TIMEOUT,
  '/profiles/add-samples-batch': HEAVY_AI_TIMEOUT,
  '/finalize_profile': HEAVY_AI_TIMEOUT,
  '/profiles/finalize': HEAVY_AI_TIMEOUT,
  
  // Streaming/Iterative operations (5 min)
  '/rewrite_stream': STREAMING_TIMEOUT,
  '/rewrite-stream': STREAMING_TIMEOUT,
  '/analysis/rewrite-stream': STREAMING_TIMEOUT,
  '/iterative-humanize': STREAMING_TIMEOUT,
  '/analysis/iterative-humanize': STREAMING_TIMEOUT,
  '/api/chat/stream': STREAMING_TIMEOUT,
  '/api/chat/humanized/stream': STREAMING_TIMEOUT,
  '/create_profile_complete': STREAMING_TIMEOUT,
  '/create_profile_complete/stream': STREAMING_TIMEOUT,
  '/profiles/create': STREAMING_TIMEOUT,
};

const DEFAULT_RETRY = {
  limit: 2,
  methods: ['get', 'post', 'put', 'delete'],
  statusCodes: [408, 413, 429, 500, 502, 503, 504],
  afterStatusCodes: [413, 429, 503],
  maxRetryAfter: 60000, // Max 60 seconds retry-after
};

/**
 * Get timeout for endpoint based on operation type
 */
function getTimeoutForEndpoint(endpoint) {
  // Check exact match first
  for (const [path, timeout] of Object.entries(ENDPOINT_TIMEOUTS)) {
    if (endpoint === path || endpoint.endsWith(path)) {
      return timeout;
    }
  }
  
  // Check partial match for streaming endpoints
  if (endpoint.includes('stream') || endpoint.includes('humanize')) {
    return STREAMING_TIMEOUT;
  }
  
  // Check for AI-related endpoints
  if (endpoint.includes('rewrite') || endpoint.includes('humaniz')) {
    return HEAVY_AI_TIMEOUT;
  }
  
  if (endpoint.includes('authenticate') || endpoint.includes('analyze') || endpoint.includes('chat')) {
    return STANDARD_AI_TIMEOUT;
  }
  
  return DEFAULT_TIMEOUT;
}

// ============================================================================
// REQUEST ID GENERATION
// ============================================================================

function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// AUTH TOKEN GETTER
// ============================================================================

/**
 * Get auth token and type for API requests
 * 
 * IMPORTANT: Both email and Google users now use JWT tokens from backend.
 * - Email users: JWT from /auth/email/login
 * - Google users: JWT from /auth/email/google-login
 * 
 * X-Auth-Type should always be 'email' when using JWT tokens from tokenService,
 * because backend verifies JWT tokens the same way for both auth methods.
 * 
 * @returns {Promise<{token: string|null, authType: 'email'|'google'|null}>}
 */
async function getAuthTokenWithType() {
  // First try JWT token from tokenService (works for both email and Google users)
  // Both auth methods now get JWT tokens from backend
  try {
    const token = await tokenService.getValidToken();
    if (token) {
      // Always use 'email' auth type for JWT tokens
      // Backend verifies JWT the same way regardless of original auth method
      return { token, authType: 'email' };
    }
  } catch (error) {
    logger.warn('kyClient', `Failed to get JWT token: ${error.message}`);
  }
  
  // Fallback: Try Chrome extension (Google OAuth token directly)
  // This is only used when user hasn't gone through backend login yet
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
      if (response?.token) {
        // This is a Google OAuth access token, not JWT
        return { token: response.token, authType: 'google' };
      }
    }
  } catch {
    // Not in extension context
  }
  
  return { token: null, authType: null };
}

/**
 * Get auth token (legacy, for backward compatibility)
 * @deprecated Use getAuthTokenWithType() instead
 */
async function getAuthToken() {
  const { token } = await getAuthTokenWithType();
  return token;
}

// ============================================================================
// GET USER ID
// ============================================================================

async function getUserId() {
  try {
    const { getUserData, getAuthMethod, secureGet, AUTH_STORAGE_KEYS } = await import('../../utils/authStorage');
    const authMethod = getAuthMethod();
    const storedUser = getUserData();
    
    if (authMethod === 'email' && storedUser) {
      return storedUser.userId || storedUser.email;
    }
    
    // Try Chrome extension
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      const response = await chrome.runtime.sendMessage({ action: 'getUserInfo' });
      if (response?.email) {
        return response.email;
      }
    }
    
    // Fallback to localStorage
    const userId = secureGet(AUTH_STORAGE_KEYS.USER_ID);
    if (userId && !userId.startsWith('user_') && !userId.startsWith('temp_')) {
      return userId;
    }
  } catch (error) {
    logger.warn('kyClient', `Failed to get user ID: ${error.message}`);
  }
  
  return null;
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

async function handleKyError(error, requestId) {
  // Handle ky HTTPError
  if (error.name === 'HTTPError') {
    const response = error.response;
    let data = {};
    
    try {
      data = await response.json();
    } catch {
      // Response is not JSON
    }
    
    const statusCode = response.status;
    let code = data?.code || 'UNKNOWN';
    let message = data?.error || data?.message || ERROR_MESSAGES.UNKNOWN;
    
    // Map status codes
    if (!data?.code) {
      switch (statusCode) {
        case 400: code = 'INVALID_INPUT'; break;
        case 401: code = 'UNAUTHORIZED'; break;
        case 403: code = 'FORBIDDEN'; break;
        case 404: code = 'NOT_FOUND'; break;
        case 429: code = 'RATE_LIMITED'; break;
        case 500: code = 'SERVER_ERROR'; break;
        case 502:
        case 503:
        case 504: code = 'SERVICE_UNAVAILABLE'; break;
      }
    }
    
    if (ERROR_MESSAGES[code]) {
      message = ERROR_MESSAGES[code];
    }
    
    return new ApiError(message, { code, statusCode, requestId, details: data?.details });
  }
  
  // Handle timeout
  if (error.name === 'TimeoutError') {
    return new ApiError(ERROR_MESSAGES.TIMEOUT, { code: 'TIMEOUT', requestId });
  }
  
  // Handle network errors
  if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
    const networkError = new ApiError(ERROR_MESSAGES.NETWORK_ERROR, { code: 'NETWORK_ERROR', requestId });
    
    // Dispatch event for GlobalErrorHandler to catch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:network-error', { 
        detail: { error: networkError } 
      }));
    }
    
    return networkError;
  }
  
  return new ApiError(error.message || ERROR_MESSAGES.UNKNOWN, { code: 'UNKNOWN', requestId });
}

// ============================================================================
// KY INSTANCE
// ============================================================================

const kyInstance = ky.create({
  prefixUrl: CONFIG.API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  retry: DEFAULT_RETRY,
  
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add request ID
        const requestId = generateRequestId();
        request.headers.set('X-Request-ID', requestId);
        
        // Add auth token and type hint
        const { token, authType } = await getAuthTokenWithType();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
          // Add auth type hint for backend optimization
          if (authType) {
            request.headers.set('X-Auth-Type', authType);
          }
        }
        
        // Log in debug mode
        if (CONFIG.ENABLE_DEBUG_LOGS) {
          logger.log(`[ky] ${request.method} ${request.url}`);
        }
      }
    ],
    
    beforeRetry: [
      async ({ request, options, error, retryCount }) => {
        logger.log(`[ky] Retry ${retryCount} for ${request.url}`);
        
        // Refresh token on 401
        if (error?.response?.status === 401 && retryCount === 1) {
          try {
            const newToken = await tokenService.refreshAccessToken();
            if (newToken) {
              request.headers.set('Authorization', `Bearer ${newToken}`);
            }
          } catch (refreshError) {
            logger.warn('kyClient', `Token refresh failed: ${refreshError.message}`);
          }
        }
      }
    ],
    
    afterResponse: [
      async (request, options, response) => {
        const duration = Date.now() - (options._startTime || Date.now());
        
        if (CONFIG.ENABLE_DEBUG_LOGS) {
          logger.log(`[ky] ${request.method} ${request.url} - ${response.status} (${duration}ms)`);
        }
        
        // Handle account locked
        if (response.status === 423) {
          const data = await response.clone().json().catch(() => ({}));
          if (data?.code === 'ACCOUNT_LOCKED') {
            window.dispatchEvent(new CustomEvent('accountLocked', {
              detail: { reason: data.reason, message: data.message }
            }));
          }
        }
        
        return response;
      }
    ],
    
    beforeError: [
      async (error) => {
        const requestId = error.request?.headers?.get('X-Request-ID');
        return handleKyError(error, requestId);
      }
    ]
  }
});

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class KyApiClient {
  constructor() {
    this.ky = kyInstance;
  }
  
  /**
   * GET request with dynamic timeout
   */
  async get(endpoint, options = {}) {
    // Use dynamic timeout based on endpoint
    const timeout = options.timeout || getTimeoutForEndpoint(endpoint);
    
    const response = await this.ky.get(endpoint, {
      searchParams: options.params,
      ...options,
      timeout,
      _startTime: Date.now()
    });
    return response.json();
  }
  
  /**
   * POST request with automatic user_id injection and dynamic timeout
   */
  async post(endpoint, body = {}, options = {}) {
    // Add user_id to body
    const userId = await getUserId();
    const requestBody = userId ? { ...body, user_id: userId } : body;
    
    // Use dynamic timeout based on endpoint
    const timeout = options.timeout || getTimeoutForEndpoint(endpoint);
    
    const response = await this.ky.post(endpoint, {
      json: requestBody,
      ...options,
      timeout,
      _startTime: Date.now()
    });
    return response.json();
  }
  
  /**
   * PUT request
   */
  async put(endpoint, body = {}, options = {}) {
    const userId = await getUserId();
    const requestBody = userId ? { ...body, user_id: userId } : body;
    
    const response = await this.ky.put(endpoint, {
      json: requestBody,
      ...options,
      _startTime: Date.now()
    });
    return response.json();
  }
  
  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const response = await this.ky.delete(endpoint, {
      ...options,
      _startTime: Date.now()
    });
    return response.json();
  }
  
  /**
   * Stream request (for SSE endpoints)
   */
  async stream(endpoint, body, onChunk, options = {}) {
    const userId = await getUserId();
    const requestBody = userId ? { ...body, user_id: userId } : body;
    const { token, authType } = await getAuthTokenWithType();
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': generateRequestId()
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (authType) {
        headers['X-Auth-Type'] = authType;
      }
    }
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: options.signal
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      
      // Handle 402 - insufficient credits
      if (response.status === 402) {
        const error = new ApiError(data.error || 'Insufficient credits', {
          code: 'INSUFFICIENT_CREDITS',
          statusCode: 402
        });
        error.required = data.required;
        error.available = data.available;
        error.shortfall = data.shortfall;
        throw error;
      }
      
      throw new ApiError(data.error || 'Stream request failed', {
        code: data.code || 'STREAM_ERROR',
        statusCode: response.status
      });
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch {
              onChunk({ raw: data });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  /**
   * Get auth token (exposed for streaming requests)
   */
  getAuthToken() {
    return getAuthToken();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const kyClient = new KyApiClient();
export default kyClient;
