import { useState, useEffect } from 'react';
import { cache } from '../../utils/cache';

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
    <div className="flex items-center gap-3 px-3 py-1.5 bg-surface-secondary rounded-full text-xs text-muted">
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-warning'}`} />
        <span className="font-medium text-primary">
          {isConnected ? 'Live' : 'Cached'}
        </span>
      </div>
      
      {lastUpdate && (
        <span className="text-muted pl-3 border-l border-border">
          Updated: {formatTime(lastUpdate)}
        </span>
      )}
      
      {cacheStats && (
        <span 
          className="text-muted pl-3 border-l border-border" 
          title={`${cacheStats.active} active, ${cacheStats.stale} stale`}
        >
          Cache: {cacheStats.active}
        </span>
      )}
    </div>
  );
}
