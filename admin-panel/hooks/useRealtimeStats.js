/**
 * Hook for real-time stats updates via SSE
 * Provides automatic reconnection and fallback to polling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cache } from '../utils/cache';
import { getApiBaseUrl } from '../utils/config';
import { getAccessToken, getAuthHeader } from '../services/authService';

const API_BASE_URL = getApiBaseUrl();
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
const FALLBACK_POLL_INTERVAL = 60000; // 1 minute fallback polling

export function useRealtimeStats(enabled = true) {
  const [stats, setStats] = useState(() => cache.get('realtime_stats'));
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const eventSourceRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pollIntervalRef = useRef(null);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token || !enabled) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${API_BASE_URL}/api/admin/realtime/stats?token=${encodeURIComponent(token)}`;
    
    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SUCCESS] Realtime stats connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Clear fallback polling when connected
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'stats_update') {
            setStats(data.stats);
            cache.set('realtime_stats', data.stats, 5 * 60 * 1000);
          }
        } catch (err) {
          console.error('Error parsing realtime data:', err);
        }
      };

      eventSource.onerror = () => {
        console.warn('Realtime stats connection error');
        setIsConnected(false);
        eventSource.close();
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          setTimeout(connect, RECONNECT_DELAY);
        } else {
          setError('Connection failed. Using cached data.');
          // Start fallback polling
          startFallbackPolling();
        }
      };
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      setError(err.message);
      startFallbackPolling();
    }
  }, [enabled]);

  const startFallbackPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    console.log('Starting fallback polling');
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.overview);
          cache.set('realtime_stats', data.overview, 5 * 60 * 1000);
        }
      } catch (err) {
        console.error('Fallback polling error:', err);
      }
    }, FALLBACK_POLL_INTERVAL);
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.overview);
        cache.set('realtime_stats', data.overview, 5 * 60 * 1000);
        return data.overview;
      }
    } catch (err) {
      console.error('Manual refresh error:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    stats,
    isConnected,
    error,
    refresh,
    reconnect: connect,
    disconnect
  };
}

export default useRealtimeStats;
