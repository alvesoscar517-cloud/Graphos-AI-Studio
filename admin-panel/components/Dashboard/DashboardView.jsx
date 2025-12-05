import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { ordersApi, supportApi } from '../../services/adminApi';
import { Card } from '../ui/card';
import { SkeletonStatsCard, SkeletonCard, SkeletonListItem } from '../ui/skeleton';
import PageHeader from '../Common/PageHeader';
import StatsCard from './StatsCard';
import ActivityStatsWidget from './ActivityStatsWidget';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function DashboardView() {
  const { 
    overview: stats, 
    loading: realtimeLoading, 
    loadOverview, 
    setActiveTab,
    realtimeEvents,
    realtimeConnected
  } = useRealtime();
  const [error, setError] = useState('');
  const [revenueStats, setRevenueStats] = useState(null);
  const [supportStats, setSupportStats] = useState(null);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const navigate = useNavigate();
  const loading = realtimeLoading.overview;
  
  // Track last seen events
  const lastSeenEvents = useRef({ user: null, order: null });

  useEffect(() => {
    setError('');
    setActiveTab('dashboard');
    loadStats();
    loadExtraStats();
    
    return () => {};
  }, []);
  
  // Listen for realtime events and show alerts
  useEffect(() => {
    const newAlerts = [];
    
    // New user alert
    if (realtimeEvents?.lastNewUser && 
        realtimeEvents.lastNewUser.timestamp !== lastSeenEvents.current.user) {
      lastSeenEvents.current.user = realtimeEvents.lastNewUser.timestamp;
      const user = realtimeEvents.lastNewUser.user;
      newAlerts.push({
        id: `user-${Date.now()}`,
        type: 'user',
        icon: 'user-plus.svg',
        title: 'New User Registered',
        message: user.email || user.name || 'Unknown user',
        timestamp: realtimeEvents.lastNewUser.timestamp,
        action: () => navigate('/users')
      });
    }
    
    // New order alert
    if (realtimeEvents?.lastNewOrder && 
        realtimeEvents.lastNewOrder.timestamp !== lastSeenEvents.current.order) {
      lastSeenEvents.current.order = realtimeEvents.lastNewOrder.timestamp;
      const order = realtimeEvents.lastNewOrder.order;
      const amount = order.amount || order.price || 0;
      newAlerts.push({
        id: `order-${Date.now()}`,
        type: 'order',
        icon: 'dollar-sign.svg',
        title: 'New Purchase',
        message: `${order.productName || 'Credits'} - $${amount.toFixed(2)}`,
        timestamp: realtimeEvents.lastNewOrder.timestamp,
        action: () => navigate('/orders')
      });
      
      // Refresh revenue stats
      loadExtraStats();
    }
    
    if (newAlerts.length > 0) {
      setRealtimeAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
    }
  }, [realtimeEvents?.lastNewUser, realtimeEvents?.lastNewOrder, navigate]);

  const loadStats = async () => {
    try {
      setError('');
      await loadOverview();
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    }
  };

  const loadExtraStats = async () => {
    try {
      const [revenue, support] = await Promise.all([
        ordersApi.getRevenueStats(30).catch(() => null),
        supportApi.getStatistics().catch(() => null)
      ]);
      if (revenue?.stats) setRevenueStats(revenue.stats);
      if (support?.statistics) setSupportStats(support.statistics);
    } catch (err) {
      console.error('Extra stats load error:', err);
    }
  };

  const getActivityIcon = (action) => {
    const icons = {
      'user_registered': 'user-plus.svg',
      'profile_created': 'folder-plus.svg',
      'notification_sent': 'send.svg',
      'user_login': 'log-in.svg',
      'locked': 'lock.svg',
      'unlocked': 'unlock.svg',
      'deleted': 'trash-2.svg'
    };
    return icons[action] || 'activity.svg';
  };

  const getActivityTitle = (activity) => {
    const titles = {
      'user_registered': 'New user registered',
      'profile_created': 'New profile created',
      'notification_sent': 'Notification sent',
      'user_login': 'User logged in',
      'locked': 'Account locked',
      'unlocked': 'Account unlocked',
      'deleted': 'Account deleted'
    };
    return titles[activity.action] || activity.action;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          icon="layout-dashboard.svg"
          title="Dashboard"
          subtitle="Loading..."
        />
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <SkeletonStatsCard />
          <SkeletonStatsCard />
          <SkeletonStatsCard />
          <SkeletonStatsCard />
        </div>
        {/* Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SkeletonCard className="p-6">
            <div className="space-y-3">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          </SkeletonCard>
          <SkeletonCard className="p-6">
            <div className="space-y-3">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          </SkeletonCard>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <img src="/icon/alert-circle.svg" alt="Error" className="w-12 h-12 icon-gray" />
        <p className="text-muted">{error}</p>
        <Button variant="secondary" onClick={() => loadOverview(true)}>
          <img src="/icon/refresh-cw.svg" alt="Retry" className="w-4 h-4 icon-dark" />
          Retry
        </Button>
      </div>
    );
  }

  const defaultActivities = [
    { action: 'user_registered', timestamp: null },
    { action: 'profile_created', timestamp: null },
    { action: 'notification_sent', timestamp: null }
  ];

  const activities = stats?.recentActivities?.length > 0 
    ? stats.recentActivities.slice(0, 5) 
    : defaultActivities;

  // Dismiss alert
  const dismissAlert = (alertId) => {
    setRealtimeAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <div className="p-6">
      <PageHeader
        icon="layout-dashboard.svg"
        title="Dashboard"
        subtitle="System overview and recent activities"
        actions={
          <div className="flex items-center gap-2">
            {realtimeConnected && (
              <span className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
        }
      />
      
      {/* Realtime Alerts Banner */}
      {realtimeAlerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {realtimeAlerts.map(alert => (
            <div 
              key={alert.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border animate-in slide-in-from-top-2 duration-300",
                alert.type === 'user' && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                alert.type === 'order' && "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                alert.type === 'user' && "bg-blue-100 dark:bg-blue-900",
                alert.type === 'order' && "bg-green-100 dark:bg-green-900"
              )}>
                <img src={`/icon/${alert.icon}`} alt="" className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">{alert.title}</p>
                <p className="text-xs text-muted truncate">{alert.message}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={alert.action}>
                View
              </Button>
              <button 
                onClick={() => dismissAlert(alert.id)}
                className="p-1 hover:bg-surface-secondary rounded"
              >
                <img src="/icon/x.svg" alt="Dismiss" className="w-4 h-4 icon-gray" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatsCard
          icon="users.svg"
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={`+${stats?.newUsers || 0} this week`}
          onClick={() => navigate('/users')}
        />
        
        <StatsCard
          icon="dollar-sign.svg"
          title="Revenue (30d)"
          value={`${revenueStats?.totalRevenue?.toFixed(2) || '0.00'}`}
          subtitle={`${revenueStats?.orderCount || 0} orders`}
          onClick={() => navigate('/orders')}
        />
        
        <StatsCard
          icon="headphones.svg"
          title="Open Tickets"
          value={supportStats?.open || 0}
          subtitle={`${supportStats?.total || 0} total`}
          onClick={() => navigate('/support')}
        />
        
        <StatsCard
          icon="folder.svg"
          title="Writing Profiles"
          value={stats?.totalProfiles || 0}
          subtitle="Profiles created"
        />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <img src="/icon/clock.svg" alt="Activity" className="w-5 h-5 icon-dark" />
            <h2 className="text-[17px] font-semibold text-primary tracking-[-0.015em]">Recent Activities</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-secondary/60 transition-colors duration-150 hover:bg-surface-secondary">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 shadow-xs">
                  <img src={`/icon/${getActivityIcon(activity.action)}`} alt={activity.action} className="w-4 h-4 icon-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-primary">{getActivityTitle(activity)}</p>
                  <p className="text-[12px] text-muted mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Stats Widget */}
        <ActivityStatsWidget />
      </div>
    </div>
  );
}
