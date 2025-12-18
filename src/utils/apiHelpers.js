/**
 * API Helper Utilities
 * 
 * Provides simplified API interaction patterns and error handling
 */

import { tokenService } from '../services/tokenService';
import { 
  parseApiError, 
  handleError, 
  withRetry,
  NetworkError 
} from './errors';

// @ts-ignore - Vite env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 
  // @ts-ignore - Vite env
  import.meta.env?.VITE_API_BASE_URL || 
  'https://graphosai-472729326429.us-central1.run.app';

// ============================================================================
// REQUEST HELPERS
// ============================================================================

/**
 * Get authorization headers with auth type hint
 * Supports both email (JWT) and Google (JWT from backend) auth
 * 
 * IMPORTANT: Both email and Google users now use JWT tokens from backend.
 * - Email users: JWT from /auth/email/login
 * - Google users: JWT from /auth/email/google-login
 * 
 * X-Auth-Type should always be 'email' when using JWT tokens,
 * because backend verifies JWT tokens the same way for both auth methods.
 * 
 * @returns {Promise<Record<string, string>>}
 */
export async function getAuthHeaders() {
  try {
    // First try JWT token from tokenService (works for both email and Google users)
    // Both auth methods now get JWT tokens from backend
    const token = await tokenService.getValidToken();
    if (token) {
      // Always use 'email' auth type for JWT tokens
      // Backend verifies JWT the same way regardless of original auth method
      return { 
        'Authorization': `Bearer ${token}`,
        'X-Auth-Type': 'email'
      };
    }
    
    // Fallback: Try Google OAuth token directly (for Drive API, not backend)
    // This is only used when user hasn't gone through backend login yet
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
        if (response?.token) {
          // This is a Google OAuth access token, not JWT
          // Backend will try to verify as Firebase ID token (may fail)
          // This path should rarely be hit now that we use backend for Google login
          return { 
            'Authorization': `Bearer ${response.token}`,
            'X-Auth-Type': 'google'
          };
        }
      } catch {
        // Not in extension context
      }
    }
  } catch (error) {
    console.warn('[API] Failed to get auth token:', error.message);
  }
  return {};
}

/**
 * Build request headers
 * @param {Record<string, string>} [customHeaders]
 * @returns {Promise<Record<string, string>>}
 */
export async function buildHeaders(customHeaders = {}) {
  const authHeaders = await getAuthHeaders();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...authHeaders,
    ...customHeaders
  };
}

/**
 * Make authenticated API request
 * @template T
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<T>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = await buildHeaders(/** @type {Record<string, string>} */ (options.headers));
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw parseApiError(response, data);
  }
  
  return data;
}

/**
 * Make authenticated API request with retry
 * @template T
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @param {object} [retryOptions]
 * @returns {Promise<T>}
 */
export async function apiRequestWithRetry(endpoint, options = {}, retryOptions = {}) {
  return withRetry(
    () => apiRequest(endpoint, options),
    {
      maxRetries: 2,
      shouldRetry: (error) => error instanceof NetworkError && error.statusCode >= 500,
      ...retryOptions
    }
  );
}

// ============================================================================
// COMMON API METHODS
// ============================================================================

/**
 * GET request
 * @template T
 * @param {string} endpoint
 * @param {Record<string, string>} [params]
 * @returns {Promise<T>}
 */
export async function get(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
}

/**
 * POST request
 * @template T
 * @param {string} endpoint
 * @param {unknown} body
 * @returns {Promise<T>}
 */
export async function post(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * PUT request
 * @template T
 * @param {string} endpoint
 * @param {unknown} body
 * @returns {Promise<T>}
 */
export async function put(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

/**
 * PATCH request
 * @template T
 * @param {string} endpoint
 * @param {unknown} body
 * @returns {Promise<T>}
 */
export async function patch(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

/**
 * DELETE request
 * @template T
 * @param {string} endpoint
 * @param {unknown} [body]
 * @returns {Promise<T>}
 */
export async function del(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined
  });
}

// ============================================================================
// STREAMING HELPERS
// ============================================================================

/**
 * Create SSE connection for streaming endpoints
 * @param {string} endpoint
 * @param {object} options
 * @param {function} options.onMessage - Called for each message
 * @param {function} [options.onError] - Called on error
 * @param {function} [options.onComplete] - Called when stream ends
 * @returns {Promise<EventSource>}
 */
export async function createStream(endpoint, { onMessage, onError, onComplete }) {
  const token = await tokenService.getValidToken();
  const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${token}`;
  
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'done') {
        eventSource.close();
        onComplete?.(data);
      } else if (data.type === 'error') {
        eventSource.close();
        onError?.(new Error(data.error || 'Stream error'));
      } else {
        onMessage(data);
      }
    } catch (error) {
      // Log error synchronously - avoid async in event handler
      import('./logger').then(({ logger }) => {
        logger.error('Stream', 'Parse error', error);
      });
    }
  };
  
  eventSource.onerror = (error) => {
    eventSource.close();
    onError?.(error);
  };
  
  return eventSource;
}

/**
 * POST request with streaming response
 * @param {string} endpoint
 * @param {unknown} body
 * @param {object} options
 * @param {function} options.onChunk - Called for each chunk
 * @param {function} [options.onError] - Called on error
 * @param {function} [options.onComplete] - Called when stream ends
 * @returns {Promise<void>}
 */
export async function postStream(endpoint, body, { onChunk, onError, onComplete }) {
  const headers = await buildHeaders();
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw parseApiError(response, data);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Streaming not supported');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onChunk(data);
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError?.(error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has sufficient credits
 * @param {number} required
 * @returns {Promise<{sufficient: boolean, balance: number}>}
 */
export async function checkCredits(required) {
  try {
    const response = await get('/api/credits/balance');
    const balance = response.data?.balance || 0;
    return {
      sufficient: balance >= required,
      balance
    };
  } catch (error) {
    const { logger } = await import('./logger');
    logger.error('API', 'Failed to check credits', error);
    return { sufficient: false, balance: 0 };
  }
}

/**
 * Upload file to API
 * @param {string} endpoint
 * @param {File} file
 * @param {Record<string, string>} [additionalData]
 * @returns {Promise<unknown>}
 */
export async function uploadFile(endpoint, file, additionalData = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  const authHeaders = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw parseApiError(response, data);
  }
  
  return data;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  request: apiRequest,
  requestWithRetry: apiRequestWithRetry,
  stream: postStream,
  createStream,
  uploadFile,
  checkCredits,
  getAuthHeaders,
  buildHeaders
};

export default api;
