import { useState, useEffect } from 'react';
import { CONFIG } from '../utils/config';
import './CreditBalance.css';

const CreditBalance = ({ userId, onUpgradeClick }) => {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchCredits();
      // Refresh every 30 seconds
      const interval = setInterval(fetchCredits, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchCredits = async () => {
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
  };

  // Display credit balance
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
