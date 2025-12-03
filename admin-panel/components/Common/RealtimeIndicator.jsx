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
    <div className="flex items-center gap-3 px-3.5 py-2 bg-surface-secondary/80 rounded-full text-[12px] text-muted">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'}`} 
              style={isConnected ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {}} />
        <span className="font-semibold text-primary">
          {isConnected ? 'Live' : 'Cached'}
        </span>
      </div>
      
      {lastUpdate && (
        <span className="text-muted pl-3 border-l border-border/50">
          Updated: {formatTime(lastUpdate)}
        </span>
      )}
      
      {cacheStats && (
        <span 
          className="text-muted pl-3 border-l border-border/50" 
          title={`${cacheStats.active} active, ${cacheStats.stale} stale`}
        >
          Cache: {cacheStats.active}
        </span>
      )}
    </div>
  );
}
