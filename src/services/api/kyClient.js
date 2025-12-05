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

import ky from 'ky';
import { CONFIG } from '../../utils/config';
import { tokenService } from '../tokenService';
import { ApiError, ERROR_MESSAGES } from './errorHandler';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY = {
  limit: 2,
  methods: ['get', 'post', 'put', 'delete'],
  statusCodes: [408, 413, 429, 500, 502, 503, 504],
  afterStatusCodes: [413, 429, 503],
  maxRetryAfter: 60000, // Max 60 seconds retry-after
};

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
 * @returns {Promise<{token: string|null, authType: 'email'|'google'|null}>}
 */
async function getAuthTokenWithType() {
  try {
    const { getAuthMethod } = await import('../../utils/authStorage');
    const authMethod = getAuthMethod();
    
    if (authMethod === 'email') {
      const token = await tokenService.getValidToken();
      if (token) return { token, authType: 'email' };
    }
  } catch (error) {
    console.warn('[kyClient] Failed to get email auth token:', error.message);
  }
  
  // Try Chrome extension (Google OAuth)
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
      if (response?.token) {
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
    console.warn('[kyClient] Failed to get user ID:', error.message);
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
    return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, { code: 'NETWORK_ERROR', requestId });
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
          console.log(`[ky] ${request.method} ${request.url}`);
        }
      }
    ],
    
    beforeRetry: [
      async ({ request, options, error, retryCount }) => {
        console.log(`[ky] Retry ${retryCount} for ${request.url}`);
        
        // Refresh token on 401
        if (error?.response?.status === 401 && retryCount === 1) {
          try {
            const newToken = await tokenService.refreshAccessToken();
            if (newToken) {
              request.headers.set('Authorization', `Bearer ${newToken}`);
            }
          } catch (refreshError) {
            console.warn('[ky] Token refresh failed:', refreshError.message);
          }
        }
      }
    ],
    
    afterResponse: [
      async (request, options, response) => {
        const duration = Date.now() - (options._startTime || Date.now());
        
        if (CONFIG.ENABLE_DEBUG_LOGS) {
          console.log(`[ky] ${request.method} ${request.url} - ${response.status} (${duration}ms)`);
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
   * GET request
   */
  async get(endpoint, options = {}) {
    const response = await this.ky.get(endpoint, {
      searchParams: options.params,
      ...options,
      _startTime: Date.now()
    });
    return response.json();
  }
  
  /**
   * POST request with automatic user_id injection
   */
  async post(endpoint, body = {}, options = {}) {
    // Add user_id to body
    const userId = await getUserId();
    const requestBody = userId ? { ...body, user_id: userId } : body;
    
    const response = await this.ky.post(endpoint, {
      json: requestBody,
      ...options,
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
