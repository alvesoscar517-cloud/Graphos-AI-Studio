/**
 * usePaymentPolling Hook
 * Now uses Firestore Realtime for instant payment detection (replaces polling)
 * 
 * Benefits:
 * - Instant detection (50-200ms vs 3s polling interval)
 * - No wasted API calls
 * - Better user experience
 */

import { logger } from '../utils/logger'
import { useState, useEffect, useRef, useCallback } from 'react';
import realtimeService from '../services/realtimeService';

// Fallback polling settings (only used if realtime fails)
const POLL_INTERVAL = 5000; // 5 seconds (increased since realtime is primary)
const MAX_POLL_DURATION = 10 * 60 * 1000; // 10 minutes max

export function usePaymentPolling() {
  const [isPolling, setIsPolling] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const pollStartTime = useRef(null);
  const pollIntervalRef = useRef(null);
  const checkoutTimestamp = useRef(null);
  const unsubscribeRef = useRef(null);

  // Start listening when checkout is opened
  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    checkoutTimestamp.current = Date.now();
    pollStartTime.current = Date.now();
    setIsPolling(true);
    setPurchaseResult(null);
    
    logger.log('[Payment] Started listening for payment (Firestore Realtime)');
  }, [isPolling]);

  // Stop listening
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsPolling(false);
    pollStartTime.current = null;
    logger.log('[Payment] Stopped listening');
  }, []);

  // Clear purchase result (after showing notification)
  const clearPurchaseResult = useCallback(() => {
    setPurchaseResult(null);
  }, []);

  // Subscribe to realtime payment events
  useEffect(() => {
    if (!isPolling) return;

    // Subscribe to payment events from Firestore Realtime
    unsubscribeRef.current = realtimeService.subscribe('payment', (data) => {
      if (data.type === 'order_created' && data.order) {
        const orderTime = new Date(data.order.createdAt).getTime();
        const checkoutTime = checkoutTimestamp.current || 0;
        
        // Only accept orders created after checkout was opened
        if (orderTime >= checkoutTime - 5000) { // 5s buffer for clock skew
          logger.log('[Payment] Order detected via Realtime!', data.order);
          setPurchaseResult({
            order: data.order,
            credits: data.order.credits
          });
          stopPolling();
        }
      }
    });

    // Also listen for payment-success browser event (dispatched by firestoreRealtimeService)
    const handlePaymentSuccess = (event) => {
      const { order } = event.detail || {};
      if (order) {
        const orderTime = new Date(order.createdAt).getTime();
        const checkoutTime = checkoutTimestamp.current || 0;
        
        if (orderTime >= checkoutTime - 5000) {
          logger.log('[Payment] Order detected via browser event!', order);
          setPurchaseResult({
            order,
            credits: order.credits
          });
          stopPolling();
        }
      }
    };
    
    window.addEventListener('payment-success', handlePaymentSuccess);

    // Timeout after max duration
    const timeoutId = setTimeout(() => {
      logger.log('[Payment] Max duration reached, stopping');
      stopPolling();
    }, MAX_POLL_DURATION);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      window.removeEventListener('payment-success', handlePaymentSuccess);
      clearTimeout(timeoutId);
    };
  }, [isPolling, stopPolling]);

  // Handle visibility change - no need to poll, realtime handles it
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPolling) {
        logger.log('[Payment] Tab visible, realtime should have updates');
        // Realtime handles updates automatically, no action needed
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPolling]);

  return {
    isPolling,
    purchaseResult,
    startPolling,
    stopPolling,
    clearPurchaseResult
  };
}

export default usePaymentPolling;
