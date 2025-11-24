import React, { useState, useEffect } from 'react';
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${apiUrl}/api/subscription/credits/balance?user_id=${userId}`
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

  // Calculate used credits
  const used = credits?.used?.toFixed(2) || '0';
  const total = credits?.monthly || '0';

  return (
    <div className="credit-balance-simple">
      <div className="credit-display">
        {loading ? (
          <div className="credit-loading">...</div>
        ) : (
          <span className="credit-text">{used} used / {total} total</span>
        )}
      </div>
      <button className="upgrade-button-simple" onClick={onUpgradeClick}>
        Upgrade Plan
      </button>
    </div>
  );
};

export default CreditBalance;
