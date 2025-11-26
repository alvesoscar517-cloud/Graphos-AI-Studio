/**
 * CreditBalance Component
 * Real-time credit display using SSE with localStorage caching
 * Shows cached value instantly, updates when new data arrives
 */
import { useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../utils/config';
import realtimeService from '../services/realtimeService';
import './CreditBalance.css';

const CACHE_KEY = 'cached_credits';

// Get cached credits from localStorage
const getCachedCredits = (userId) => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

// Save credits to localStorage
const setCachedCredits = (userId, credits) => {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(credits));
  } catch {
    // Ignore storage errors
  }
};

const CreditBalance = ({ userId, onUpgradeClick }) => {
  // Initialize with cached value to avoid flicker
  const [credits, setCredits] = useState(() => getCachedCredits(userId));
  const [loading, setLoading] = useState(!getCachedCredits(userId));

  // Update credits and cache
  const updateCredits = useCallback((newCredits) => {
    setCredits(newCredits);
    setLoading(false);
    if (userId && newCredits) {
      setCachedCredits(userId, newCredits);
    }
  }, [userId]);

  // Fetch from API
  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/credits/balance?user_id=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        updateCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setLoading(false);
    }
  }, [userId, updateCredits]);

  useEffect(() => {
    if (!userId) return;

    // Fetch fresh data (will update cache)
    fetchCredits();

    // Connect to realtime service
    realtimeService.connect(userId);

    // Subscribe to credits updates for real-time changes
    const unsubCredits = realtimeService.subscribe('credits', (data) => {
      // Handle both formats: {credits: {...}} or direct {balance, used, purchased}
      const creditsData = data.credits || data;
      updateCredits(creditsData);
    });

    // Subscribe to connection status
    const unsubStatus = realtimeService.onStatusChange(() => {});

    // Listen for payment success (legacy support)
    const handlePaymentSuccess = (e) => {
      if (e.detail?.credits) {
        updateCredits(e.detail.credits);
      }
    };
    window.addEventListener('payment-success', handlePaymentSuccess);

    return () => {
      unsubCredits();
      unsubStatus();
      window.removeEventListener('payment-success', handlePaymentSuccess);
    };
  }, [userId, fetchCredits, updateCredits]);

  const balance = credits?.balance != null ? credits.balance.toFixed(2) : '0';
  const used = credits?.used != null ? credits.used.toFixed(2) : '0';
  const isLowCredit = parseFloat(balance) < 10;
  const isOutOfCredit = parseFloat(balance) <= 0;

  return (
    <div className="credit-balance-simple">
      <div className="credit-display">
        <span className={`credit-text ${isLowCredit ? 'low-credit' : ''} ${isOutOfCredit ? 'out-of-credit' : ''}`}>
          {balance} credits / {used} used
        </span>
      </div>
      <button className="upgrade-button-simple" onClick={onUpgradeClick}>
        Upgrade Plan
      </button>
    </div>
  );
};

export default CreditBalance;
