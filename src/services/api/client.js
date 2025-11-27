/**
 * Enhanced API Client
 * Centralized HTTP client with retry, timeout, and error handling
 */

import { CONFIG } from '../../utils/config';
import { 
  parseApiError, 
  NetworkError, 
  withRetry,
  logError 
} from '../../utils/errors';
import { getUserInfo } from './auth';

// ============================================================================
// REQUEST CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 2,
  baseDelay: 1000,
  shouldRetry: (error) => {
    // Retry on network errors and 5xx server errors
    if (error instanceof NetworkError) {
      return error.statusCode >= 500 || error.statusCode === null;
    }
    return false;
  }
};

// ============================================================================
// REQUEST ID GENERATION
// ============================================================================

function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  constructor(baseUrl = CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Make HTTP request with enhanced features
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      timeout = DEFAULT_TIMEOUT,
      retry = true,
      includeAuth = true,
      signal = null
    } = options;
    
    const requestId = generateRequestId();
    const url = `${this.baseUrl}${endpoint}`;
    
    // Build headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
      'X-Request-ID': requestId
    };
    
    // Add auth if needed
    if (includeAuth) {
      try {
        const userInfo = await getUserInfo();
        if (userInfo?.userId) {
          // Add user_id to body for legacy compatibility
          if (body && typeof body === 'object') {
            body.user_id = userInfo.userId;
          }
        }
        
        // Add auth token if available
        const authToken = await this.getAuthToken();
        if (authToken) {
          requestHeaders['Authorization'] = `Bearer ${authToken}`;
        }
      } catch (error) {
        logError(error, { context: 'getAuthInfo', requestId });
      }
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Build fetch options
    const fetchOptions = {
      method,
      headers: requestHeaders,
      signal: signal || controller.signal
    };
    
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Execute request with optional retry
    const executeRequest = async () => {
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, fetchOptions);
        const duration = Date.now() - startTime;
        
        // Log request in debug mode
        if (CONFIG.ENABLE_DEBUG_LOGS) {
          console.log(`[API] ${method} ${endpoint} - ${response.status} (${duration}ms)`);
        }
        
        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (contentType?.includes('text/event-stream')) {
          // Return response for streaming
          return { response, stream: true };
        } else {
          data = await response.text();
        }
        
        // Handle error responses
        if (!response.ok) {
          throw parseApiError(response, data);
        }
        
        return { data, response };
      } finally {
        clearTimeout(timeoutId);
      }
    };
    
    if (retry) {
      return withRetry(executeRequest, DEFAULT_RETRY_OPTIONS);
    }
    
    return executeRequest();
  }
  
  /**
   * Get auth token from Chrome extension or storage
   */
  async getAuthToken() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
        return response?.token || null;
      }
    } catch {
      // Not in extension context
    }
    return null;
  }
  
  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================
  
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }
  
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }
  
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
  
  // ============================================================================
  // STREAMING SUPPORT
  // ============================================================================
  
  /**
   * Make streaming request (for SSE endpoints)
   */
  async stream(endpoint, body, onChunk, options = {}) {
    const { response, stream } = await this.post(endpoint, body, {
      ...options,
      retry: false // Don't retry streaming requests
    });
    
    if (!stream) {
      throw new Error('Expected streaming response');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch {
              // Not JSON, pass raw data
              onChunk({ raw: data });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient();

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy fetch wrapper for backward compatibility
 */
export async function apiFetch(endpoint, options = {}) {
  const { data } = await apiClient.request(endpoint, options);
  return data;
}

export default apiClient;
