/**
 * useCredits Hook
 * Manages credit balance with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CONFIG, debugLog } from '../utils/config';
import { getUserInfo } from '../services/api/auth';
import realtimeService from '../services/realtimeService';

const CACHE_KEY = 'user_credits';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached credits from localStorage
 */
function getCachedCredits() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null;
}

/**
 * Cache credits to localStorage
 */
function cacheCredits(credits) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: credits,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore cache errors
  }
}

/**
 * Hook for managing user credits
 */
export function useCredits() {
  const [credits, setCredits] = useState(() => getCachedCredits());
  const [isLoading, setIsLoading] = useState(!credits);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  
  /**
   * Fetch credits from API
   */
  const fetchCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userInfo = await getUserInfo();
      if (!userInfo?.userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/credits/balance?user_id=${userInfo.userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      
      const data = await response.json();
      
      if (data.success && data.credits) {
        setCredits(data.credits);
        cacheCredits(data.credits);
      }
    } catch (err) {
      debugLog('Error fetching credits:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Subscribe to real-time credit updates
   */
  const subscribeToUpdates = useCallback(async () => {
    try {
      const userInfo = await getUserInfo();
      if (!userInfo?.userId) return;
      
      // Connect to realtime service
      realtimeService.connect(userInfo.userId);
      
      // Subscribe to credit updates
      unsubscribeRef.current = realtimeService.subscribe('credits', (data) => {
        debugLog('Credit update received:', data);
        setCredits(data);
        cacheCredits(data);
      });
    } catch (err) {
      debugLog('Error subscribing to credit updates:', err);
    }
  }, []);
  
  /**
   * Refresh credits manually
   */
  const refresh = useCallback(() => {
    return fetchCredits();
  }, [fetchCredits]);
  
  /**
   * Check if user has enough credits
   */
  const hasEnough = useCallback((required) => {
    return credits?.balance >= required;
  }, [credits]);
  
  // Initial fetch and subscription
  useEffect(() => {
    fetchCredits();
    subscribeToUpdates();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [fetchCredits, subscribeToUpdates]);
  
  return {
    credits,
    balance: credits?.balance || 0,
    isLoading,
    error,
    refresh,
    hasEnough
  };
}

export default useCredits;
