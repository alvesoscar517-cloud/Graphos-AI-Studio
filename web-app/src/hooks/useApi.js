/**
 * useApi Hook
 * Generic hook for API calls with loading, error, and caching
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../services/api/client';
import { handleError, logError } from '../utils/errors';
import { debugLog } from '../utils/config';

/**
 * Simple in-memory cache
 */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint, params) {
  return `${endpoint}:${JSON.stringify(params || {})}`;
}

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Cleanup old entries
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

/**
 * Hook for making API calls
 */
export function useApi(options = {}) {
  const {
    cacheResults = false,
    retryOnError = true
  } = options;
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
  
  /**
   * Execute API call
   */
  const execute = useCallback(async (endpoint, requestOptions = {}) => {
    const { method = 'GET', body = null, useCache = cacheResults } = requestOptions;
    
    // Check cache for GET requests
    if (method === 'GET' && useCache) {
      const cacheKey = getCacheKey(endpoint, body);
      const cached = getCached(cacheKey);
      if (cached) {
        debugLog('Cache hit:', endpoint);
        setData(cached);
        return { success: true, data: cached };
      }
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.request(endpoint, {
        method,
        body,
        signal: abortControllerRef.current.signal,
        retry: retryOnError
      });
      
      const responseData = result.data;
      setData(responseData);
      
      // Cache successful GET requests
      if (method === 'GET' && useCache) {
        const cacheKey = getCacheKey(endpoint, body);
        setCache(cacheKey, responseData);
      }
      
      return { success: true, data: responseData };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      
      logError(err, { endpoint, method });
      const errorResult = handleError(err);
      setError(errorResult.error);
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [cacheResults, retryOnError]);
  
  /**
   * GET request
   */
  const get = useCallback((endpoint, options = {}) => {
    return execute(endpoint, { ...options, method: 'GET' });
  }, [execute]);
  
  /**
   * POST request
   */
  const post = useCallback((endpoint, body, options = {}) => {
    return execute(endpoint, { ...options, method: 'POST', body });
  }, [execute]);
  
  /**
   * PUT request
   */
  const put = useCallback((endpoint, body, options = {}) => {
    return execute(endpoint, { ...options, method: 'PUT', body });
  }, [execute]);
  
  /**
   * DELETE request
   */
  const del = useCallback((endpoint, options = {}) => {
    return execute(endpoint, { ...options, method: 'DELETE' });
  }, [execute]);
  
  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    data,
    error,
    isLoading,
    execute,
    get,
    post,
    put,
    delete: del,
    reset
  };
}

/**
 * Hook for fetching data on mount
 */
export function useFetch(endpoint, options = {}) {
  const { immediate = true, ...apiOptions } = options;
  const api = useApi(apiOptions);
  
  useEffect(() => {
    if (immediate && endpoint) {
      api.get(endpoint);
    }
  }, [endpoint, immediate]);
  
  return api;
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation(endpoint, options = {}) {
  const { method = 'POST', ...apiOptions } = options;
  const api = useApi(apiOptions);
  
  const mutate = useCallback((body) => {
    return api.execute(endpoint, { method, body });
  }, [api, endpoint, method]);
  
  return {
    ...api,
    mutate
  };
}

export default useApi;
