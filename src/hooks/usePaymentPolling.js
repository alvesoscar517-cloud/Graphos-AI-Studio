/**
 * usePaymentPolling Hook
 * Polls for payment status after user opens checkout
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getUserInfo } from '../services/api';
import apiClient from '../services/api/client';

const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_DURATION = 10 * 60 * 1000; // 10 minutes max polling

export function usePaymentPolling() {
  const [isPolling, setIsPolling] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const pollStartTime = useRef(null);
  const pollIntervalRef = useRef(null);
  const checkoutTimestamp = useRef(null);

  // Start polling when checkout is opened
  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    checkoutTimestamp.current = Date.now();
    pollStartTime.current = Date.now();
    setIsPolling(true);
    setPurchaseResult(null);
    
    console.log('[SYNC] Started payment polling');
  }, [isPolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
    pollStartTime.current = null;
    console.log('⏹️ Stopped payment polling');
  }, []);

  // Clear purchase result (after showing notification)
  const clearPurchaseResult = useCallback(() => {
    setPurchaseResult(null);
  }, []);

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    try {
      const userInfo = await getUserInfo();
      const since = checkoutTimestamp.current || Date.now() - 5 * 60 * 1000;
      
      const { data } = await apiClient.get(
        `/api/payment/check-status?user_id=${userInfo.userId}&since=${since}`
      );
      
      if (data.success && data.hasPurchase) {
        console.log('[SUCCESS] Payment detected!', data.order);
        setPurchaseResult({
          order: data.order,
          credits: data.credits
        });
        stopPolling();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }, [stopPolling]);

  // Polling effect
  useEffect(() => {
    if (!isPolling) return;

    // Initial check
    checkPaymentStatus();

    // Set up interval
    pollIntervalRef.current = setInterval(() => {
      // Check if max duration exceeded
      if (Date.now() - pollStartTime.current > MAX_POLL_DURATION) {
        console.log('⏰ Max polling duration reached');
        stopPolling();
        return;
      }
      
      checkPaymentStatus();
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isPolling, checkPaymentStatus, stopPolling]);

  // Handle visibility change - check immediately when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPolling) {
        console.log('👁️ Tab visible, checking payment status...');
        checkPaymentStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPolling, checkPaymentStatus]);

  return {
    isPolling,
    purchaseResult,
    startPolling,
    stopPolling,
    clearPurchaseResult
  };
}

export default usePaymentPolling;
