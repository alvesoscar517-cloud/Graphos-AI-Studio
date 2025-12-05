/**
 * Realtime Context for Admin Panel
 * Provides centralized real-time data management across all components
 * 
 * Features:
 * - Firestore Realtime for instant updates (primary)
 * - Smart caching with TTL to reduce API calls
 * - Automatic reconnection
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { analyticsApi, advancedAnalyticsApi, supportApi, usersApi, logsApi, notificationsApi } from '../services/adminApi';
import { cache } from '../utils/cache';
import { isAuthenticated } from '../services/authService';
import firestoreRealtimeService from '../services/firestoreRealtimeService';

const RealtimeContext = createContext();

// Cache TTL settings (in milliseconds)
const CACHE_TTL = {
  overview: 5 * 60 * 1000,      // 5 minutes - overview stats
  analytics: 10 * 60 * 1000,    // 10 minutes - analytics data
  users: 3 * 60 * 1000,         // 3 minutes - user list
  support: 2 * 60 * 1000,       // 2 minutes - support tickets
  logs: 1 * 60 * 1000,          // 1 minute - system logs
  notifications: 2 * 60 * 1000  // 2 minutes - notifications
};

// Minimum refresh interval to prevent spam
const MIN_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

export function RealtimeProvider({ children }) {
  // Centralized state for all data
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [usageAnalytics, setUsageAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportStats, setSupportStats] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    overview: false,
    analytics: false,
    users: false,
    support: false,
    logs: false,
    notifications: false
  });

  // Realtime connection state
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const unsubscribersRef = useRef([]);

  // Last fetch timestamps to prevent excessive calls
  const lastFetch = useRef({
    overview: 0,
    analytics: 0,
    users: 0,
    support: 0,
    logs: 0,
    notifications: 0
  });

  // Track active tab for smart refresh
  const [activeTab, setActiveTab] = useState('dashboard');

  /**
   * Initialize Firestore Realtime listeners
   */
  const initializeRealtime = useCallback(() => {
    if (!isAuthenticated()) {
      console.log('[RealtimeContext] Not authenticated, skipping realtime init');
      return;
    }

    // Cleanup existing subscriptions first to prevent memory leaks
    unsubscribersRef.current.forEach(unsub => {
      try { unsub(); } catch (e) { /* ignore */ }
    });
    unsubscribersRef.current = [];

    // Initialize Firestore Realtime
    const success = firestoreRealtimeService.init();
    
    if (success) {
      setRealtimeConnected(true);
      console.log('[RealtimeContext] Firestore Realtime connected');

      // Subscribe to stats updates
      const unsubStats = firestoreRealtimeService.subscribe('stats', (data) => {
        if (data.type === 'stats_update' && data.stats) {
          setOverview(prev => ({
            ...prev,
            totalUsers: data.stats.totalUsers,
            totalProfiles: data.stats.totalProfiles,
            totalNotifications: data.stats.totalNotifications,
            newUsers: data.stats.newUsers,
            lastUpdated: data.stats.timestamp
          }));
          cache.set('admin_overview', data.stats, CACHE_TTL.overview);
          lastFetch.current.overview = Date.now();
        }
      });
      unsubscribersRef.current.push(unsubStats);

      // Subscribe to support updates
      const unsubSupport = firestoreRealtimeService.subscribe('support', (data) => {
        if (data.type === 'support_update') {
          if (data.tickets) {
            setSupportTickets(data.tickets);
          }
          if (data.statistics) {
            setSupportStats(data.statistics);
          }
          cache.set('admin_support', data, CACHE_TTL.support);
          lastFetch.current.support = Date.now();
        }
      });
      unsubscribersRef.current.push(unsubSupport);

      // Subscribe to new user registrations
      const unsubUsers = firestoreRealtimeService.subscribe('users', (data) => {
        if (data.type === 'user_created' && data.user) {
          console.log('[RealtimeContext] New user:', data.user.email);
          // Invalidate users cache to trigger refetch
          cache.delete('admin_users');
          lastFetch.current.users = 0;
          // Update users list if loaded
          setUsers(prev => {
            if (!prev || prev.length === 0) return prev;
            // Add new user at the beginning if not already present
            const exists = prev.some(u => u.id === data.user.id);
            if (exists) return prev;
            return [data.user, ...prev].slice(0, 100);
          });
        }
      });
      unsubscribersRef.current.push(unsubUsers);

      // Subscribe to new orders (purchases)
      const unsubOrders = firestoreRealtimeService.subscribe('orders', (data) => {
        if (data.type === 'order_created' && data.order) {
          console.log('[RealtimeContext] New order:', data.order.productName);
          // Could show a toast notification here
          // Invalidate analytics cache
          cache.delete('admin_analytics');
          lastFetch.current.analytics = 0;
        }
      });
      unsubscribersRef.current.push(unsubOrders);
    } else {
      console.warn('[RealtimeContext] Firestore Realtime not available');
      setRealtimeConnected(false);
    }
  }, []);

  /**
   * Cleanup realtime connections
   */
  const cleanupRealtime = useCallback(() => {
    unsubscribersRef.current.forEach(unsub => {
      try { unsub(); } catch (e) { /* ignore */ }
    });
    unsubscribersRef.current = [];
    firestoreRealtimeService.cleanup();
    setRealtimeConnected(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (isAuthenticated()) {
      initializeRealtime();
    }
    
    return () => {
      cleanupRealtime();
    };
  }, [initializeRealtime, cleanupRealtime]);

  /**
   * Check if data should be refreshed based on TTL and last fetch time
   */
  const shouldRefresh = useCallback((key) => {
    const now = Date.now();
    const lastTime = lastFetch.current[key] || 0;
    const ttl = CACHE_TTL[key] || 60000;
    
    // Check if minimum interval has passed
    if (now - lastTime < MIN_REFRESH_INTERVAL) {
      return false;
    }
    
    // Check if cache is still valid
    const cached = cache.get(`admin_${key}`);
    if (cached && (now - lastTime) < ttl) {
      return false;
    }
    
    return true;
  }, []);

  /**
   * Load overview data (Dashboard)
   */
  const loadOverview = useCallback(async (force = false) => {
    if (!force && !shouldRefresh('overview')) {
      const cached = cache.get('admin_overview');
      if (cached) {
        setOverview(cached);
        return cached;
      }
    }

    setLoading(prev => ({ ...prev, overview: true }));
    try {
      const response = await analyticsApi.getOverview();
      const data = response?.overview || null;
      
      if (data) {
        setOverview(data);
        cache.set('admin_overview', data, CACHE_TTL.overview);
        lastFetch.current.overview = Date.now();
      }
      
      return data;
    } catch (err) {
      console.error('Load overview error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  }, [shouldRefresh]);

  /**
   * Load analytics data
   */
  const loadAnalytics = useCallback(async (timeRange = 30, force = false) => {
    const cacheKey = `admin_analytics_${timeRange}`;
    
    if (!force && !shouldRefresh('analytics')) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setUserAnalytics(cached.userAnalytics);
        setUsageAnalytics(cached.usageAnalytics);
        return cached;
      }
    }

    setLoading(prev => ({ ...prev, analytics: true }));
    try {
      const [overviewRes, userRes, usageRes] = await Promise.all([
        analyticsApi.getOverview(),
        advancedAnalyticsApi.getUserAnalytics(timeRange),
        advancedAnalyticsApi.getUsageAnalytics()
      ]);

      const data = {
        overview: overviewRes.overview || {},
        userAnalytics: userRes.analytics || {},
        usageAnalytics: usageRes.analytics || {}
      };

      setOverview(data.overview);
      setUserAnalytics(data.userAnalytics);
      setUsageAnalytics(data.usageAnalytics);
      
      cache.set(cacheKey, data, CACHE_TTL.analytics);
      cache.set('admin_overview', data.overview, CACHE_TTL.overview);
      lastFetch.current.analytics = Date.now();
      lastFetch.current.overview = Date.now();
      
      return data;
    } catch (err) {
      console.error('Load analytics error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  }, [shouldRefresh]);

  /**
   * Load users data
   */
  const loadUsers = useCallback(async (params = {}, force = false) => {
    const cacheKey = `admin_users_${JSON.stringify(params)}`;
    
    if (!force && !shouldRefresh('users')) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setUsers(cached);
        return cached;
      }
    }

    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await usersApi.getAll({ limit: 100, ...params });
      const data = response.users;
      
      setUsers(data);
      cache.set(cacheKey, data, CACHE_TTL.users);
      lastFetch.current.users = Date.now();
      
      return data;
    } catch (err) {
      console.error('Load users error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [shouldRefresh]);

  /**
   * Load support tickets
   */
  const loadSupport = useCallback(async (params = {}, force = false) => {
    const cacheKey = `admin_support_${JSON.stringify(params)}`;
    
    if (!force && !shouldRefresh('support')) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setSupportTickets(cached.tickets);
        setSupportStats(cached.statistics);
        return cached;
      }
    }

    setLoading(prev => ({ ...prev, support: true }));
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        supportApi.getAll({ limit: 100, ...params }),
        supportApi.getStatistics()
      ]);

      const data = {
        tickets: ticketsRes.tickets,
        statistics: statsRes.statistics
      };

      setSupportTickets(data.tickets);
      setSupportStats(data.statistics);
      cache.set(cacheKey, data, CACHE_TTL.support);
      lastFetch.current.support = Date.now();
      
      return data;
    } catch (err) {
      console.error('Load support error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, support: false }));
    }
  }, [shouldRefresh]);

  /**
   * Load system logs
   */
  const loadLogs = useCallback(async (params = {}, force = false) => {
    const cacheKey = `admin_logs_${JSON.stringify(params)}`;
    
    if (!force && !shouldRefresh('logs')) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setSystemLogs(cached);
        return cached;
      }
    }

    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const response = await logsApi.getAll(params);
      const data = response.logs || [];
      
      setSystemLogs(data);
      cache.set(cacheKey, data, CACHE_TTL.logs);
      lastFetch.current.logs = Date.now();
      
      return data;
    } catch (err) {
      console.error('Load logs error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  }, [shouldRefresh]);

  /**
   * Load notifications
   */
  const loadNotifications = useCallback(async (params = {}, force = false) => {
    const cacheKey = `admin_notifications_${JSON.stringify(params)}`;
    
    if (!force && !shouldRefresh('notifications')) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setNotifications(cached);
        return cached;
      }
    }

    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const response = await notificationsApi.getAll(params);
      const data = response.notifications;
      
      setNotifications(data);
      cache.set(cacheKey, data, CACHE_TTL.notifications);
      lastFetch.current.notifications = Date.now();
      
      return data;
    } catch (err) {
      console.error('Load notifications error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [shouldRefresh]);

  /**
   * Invalidate cache for specific key
   */
  const invalidateCache = useCallback((key) => {
    if (key) {
      cache.delete(`admin_${key}`);
      lastFetch.current[key] = 0;
    } else {
      Object.keys(lastFetch.current).forEach(k => {
        cache.delete(`admin_${k}`);
        lastFetch.current[k] = 0;
      });
    }
  }, []);

  /**
   * Force refresh all data for current tab
   */
  const refreshCurrentTab = useCallback(async () => {
    switch (activeTab) {
      case 'dashboard':
        return loadOverview(true);
      case 'analytics':
        return loadAnalytics(30, true);
      case 'users':
        return loadUsers({}, true);
      case 'support':
        return loadSupport({}, true);
      case 'logs':
        return loadLogs({}, true);
      case 'notifications':
        return loadNotifications({}, true);
      default:
        return null;
    }
  }, [activeTab, loadOverview, loadAnalytics, loadUsers, loadSupport, loadLogs, loadNotifications]);

  // Auto-refresh based on visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshCurrentTab();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshCurrentTab]);

  const value = {
    // Data
    overview,
    userAnalytics,
    usageAnalytics,
    users,
    supportTickets,
    supportStats,
    systemLogs,
    notifications,
    
    // Loading states
    loading,
    
    // Realtime status (renamed from sseConnected for compatibility)
    sseConnected: realtimeConnected,
    realtimeConnected,
    
    // Actions
    loadOverview,
    loadAnalytics,
    loadUsers,
    loadSupport,
    loadLogs,
    loadNotifications,
    invalidateCache,
    refreshCurrentTab,
    setActiveTab,
    
    // Realtime controls
    reconnectSSE: initializeRealtime,
    closeSSE: cleanupRealtime,
    
    // Utilities
    activeTab
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

export default RealtimeContext;
