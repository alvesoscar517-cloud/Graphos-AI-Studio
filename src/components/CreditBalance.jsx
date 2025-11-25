/**
 * CreditBalance Component
 * Real-time credit display using SSE (no polling)
 */
import { useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../utils/config';
import realtimeService from '../services/realtimeService';
import './CreditBalance.css';

const CreditBalance = ({ userId, onUpgradeClick }) => {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Initial fetch (fallback if SSE not connected yet)
  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/credits/balance?user_id=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Connect to realtime service
    realtimeService.connect(userId);

    // Subscribe to credits updates
    const unsubCredits = realtimeService.subscribe('credits', (data) => {
      console.log('💰 Credits updated via SSE:', data);
      setCredits(data.credits);
      setLoading(false);
    });

    // Subscribe to connection status
    const unsubStatus = realtimeService.onStatusChange((status) => {
      setIsConnected(status === 'connected');
      // Fetch once if not connected (fallback)
      if (status !== 'connected' && loading) {
        fetchCredits();
      }
    });

    // Initial fetch as fallback
    if (realtimeService.getStatus() !== 'connected') {
      fetchCredits();
    }

    // Listen for payment success (legacy support)
    const handlePaymentSuccess = (e) => {
      if (e.detail?.credits) {
        setCredits(e.detail.credits);
      }
    };
    window.addEventListener('payment-success', handlePaymentSuccess);

    return () => {
      unsubCredits();
      unsubStatus();
      window.removeEventListener('payment-success', handlePaymentSuccess);
    };
  }, [userId, fetchCredits, loading]);

  const balance = credits?.balance?.toFixed(2) || '0';
  const used = credits?.used?.toFixed(2) || '0';
  const isLowCredit = parseFloat(balance) < 10;
  const isOutOfCredit = parseFloat(balance) <= 0;

  return (
    <div className="credit-balance-simple">
      <div className="credit-display">
        {loading ? (
          <div className="credit-loading">...</div>
        ) : (
          <span className={`credit-text ${isLowCredit ? 'low-credit' : ''} ${isOutOfCredit ? 'out-of-credit' : ''}`}>
            {balance} credits / {used} used
          </span>
        )}
      </div>
      <button className="upgrade-button-simple" onClick={onUpgradeClick}>
        Upgrade Plan
      </button>
    </div>
  );
};

export default CreditBalance;
