/**
 * Realtime Connection Indicator
 * Shows the status of real-time data connection
 */

import { useState, useEffect } from 'react';
import { cache } from '../../utils/cache';
import './RealtimeIndicator.css';

export default function RealtimeIndicator({ isConnected, lastUpdate }) {
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      setCacheStats(cache.getStats());
    };
    
    updateStats();
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="realtime-indicator">
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {isConnected ? 'Live' : 'Cached'}
        </span>
      </div>
      
      {lastUpdate && (
        <span className="last-update">
          Updated: {formatTime(lastUpdate)}
        </span>
      )}
      
      {cacheStats && (
        <span className="cache-info" title={`${cacheStats.active} active, ${cacheStats.stale} stale`}>
          Cache: {cacheStats.active}
        </span>
      )}
    </div>
  );
}
