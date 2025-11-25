/**
 * PaymentContext
 * Real-time payment detection using unified SSE service
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getUserInfo } from '../services/api';
import realtimeService from '../services/realtimeService';
import PaymentSuccessNotification from '../components/PaymentSuccessNotification';

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
  const [isPolling, setIsPolling] = useState(() => !!getPersistedState());
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
    console.log('⏹️ Stopped listening for payments');
  }, []);

  const handlePaymentSuccess = useCallback((data) => {
    console.log('✅ Payment detected!', data);
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
      
      // Connect to realtime service
      realtimeService.connect(userInfo.userId);
      
      // Subscribe to payment events
      unsubscribeRef.current = realtimeService.subscribe('payment', handlePaymentSuccess);
      
      // Subscribe to status changes
      const unsubStatus = realtimeService.onStatusChange(setConnectionStatus);
      
      startTimeRef.current = Date.now();
      setIsPolling(true);
      persistState(startTimeRef.current);
      
      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Max listen duration reached');
        stopListening();
      }, MAX_LISTEN_DURATION);
      
      console.log('🎧 Started listening for payments (SSE)');
      
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


  // Resume from persisted state
  useEffect(() => {
    const state = getPersistedState();
    if (state) {
      startTimeRef.current = state.startTime;
      console.log('📦 Resuming payment listener from persisted state');
      startPolling();
    }
  }, []);

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
      {purchaseResult && createPortal(
        <PaymentSuccessNotification
          isVisible={true}
          order={purchaseResult.order}
          credits={purchaseResult.credits}
          onClose={clearPurchaseResult}
        />,
        document.body
      )}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;
