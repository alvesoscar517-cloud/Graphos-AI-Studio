/**
 * PaymentContext
 * Real-time payment detection using Firestore Realtime
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getUserInfo } from '../services/api';
import realtimeService from '../services/realtimeService';
import { useAuth } from '../stores/authStore';

const PaymentContext = createContext();

const MAX_LISTEN_DURATION = 10 * 60 * 1000; // 10 minutes
const STORAGE_KEY = 'payment_listening_state';

const getPersistedState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      if (state.startTime && Date.now() - state.startTime < MAX_LISTEN_DURATION) {
        return state;
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) { /* ignore */ }
  return null;
};

const persistState = (startTime) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime, isListening: true }));
  } catch (e) { /* ignore */ }
};

const clearPersistedState = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within PaymentProvider');
  return context;
};

export const PaymentProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isPolling, setIsPolling] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const startTimeRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const timeoutRef = useRef(null);

  const stopListening = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
    setConnectionStatus('disconnected');
    startTimeRef.current = null;
    clearPersistedState();
    logger.log('⏹️ Stopped listening for payments');
  }, []);

  const handlePaymentSuccess = useCallback((data) => {
    logger.log('[SUCCESS] Payment detected!', data);
    stopListening();
    
    setPurchaseResult({
      order: data.order,
      credits: data.credits
    });
    
    window.dispatchEvent(new CustomEvent('payment-success', { 
      detail: { order: data.order, credits: data.credits }
    }));
  }, [stopListening]);

  const startPolling = useCallback(async () => {
    if (isPolling) return;
    
    try {
      const userInfo = await getUserInfo();
      
      // Connect to Firestore Realtime if not already connected
      if (!realtimeService.isConnected()) {
        realtimeService.connect(userInfo.userId);
      }
      
      // Subscribe to payment events
      unsubscribeRef.current = realtimeService.subscribe('payment', handlePaymentSuccess);
      
      // Subscribe to status changes
      const unsubStatus = realtimeService.onStatusChange(setConnectionStatus);
      
      startTimeRef.current = Date.now();
      setIsPolling(true);
      persistState(startTimeRef.current);
      
      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        logger.log('⏰ Max listen duration reached');
        stopListening();
      }, MAX_LISTEN_DURATION);
      
      logger.log('🎧 Started listening for payments (Firestore Realtime)');
      
      // Store status unsubscribe for cleanup
      const originalUnsub = unsubscribeRef.current;
      unsubscribeRef.current = () => {
        originalUnsub();
        unsubStatus();
      };
    } catch (error) {
      console.error('Failed to start payment listening:', error);
    }
  }, [isPolling, handlePaymentSuccess, stopListening]);


  // Resume from persisted state - only when authenticated
  useEffect(() => {
    // Don't resume if not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }
    
    const state = getPersistedState();
    if (state) {
      startTimeRef.current = state.startTime;
      logger.log('[PACKAGE] Resuming payment listener from persisted state');
      startPolling();
    }
  }, [isAuthenticated, authLoading]);
  
  // Clear state when logged out
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      stopListening();
      clearPersistedState();
    }
  }, [isAuthenticated, authLoading, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearPurchaseResult = useCallback(() => setPurchaseResult(null), []);

  const value = {
    isPolling,
    purchaseResult,
    connectionStatus,
    startPolling,
    stopPolling: stopListening,
    clearPurchaseResult
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;
