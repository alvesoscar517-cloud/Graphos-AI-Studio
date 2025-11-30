import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { ordersApi, supportApi } from '../../services/adminApi';
import { Card } from '../ui/card';
import { SkeletonStatsCard, SkeletonCard, SkeletonListItem } from '../ui/skeleton';
import PageHeader from '../Common/PageHeader';
import StatsCard from './StatsCard';
import ActivityStatsWidget from './ActivityStatsWidget';
import { Button } from '../ui/button';

export default function DashboardView() {
  const { overview: stats, loading: realtimeLoading, loadOverview, setActiveTab } = useRealtime();
  const [error, setError] = useState('');
  const [revenueStats, setRevenueStats] = useState(null);
  const [supportStats, setSupportStats] = useState(null);
  const navigate = useNavigate();
  const loading = realtimeLoading.overview;

  useEffect(() => {
    setError('');
    setActiveTab('dashboard');
    loadStats();
    loadExtraStats();
    
    return () => {};
  }, []);

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

  return (
    <div className="p-6">
      <PageHeader
        icon="layout-dashboard.svg"
        title="Dashboard"
        subtitle="System overview and recent activities"
      />

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
          <div className="flex items-center gap-2 mb-4">
            <img src="/icon/clock.svg" alt="Activity" className="w-5 h-5 icon-dark" />
            <h2 className="text-lg font-semibold text-primary">Recent Activities</h2>
          </div>
          <div className="flex flex-col gap-3">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary">
                <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                  <img src={`/icon/${getActivityIcon(activity.action)}`} alt={activity.action} className="w-4 h-4 icon-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{getActivityTitle(activity)}</p>
                  <p className="text-xs text-muted">{formatTimeAgo(activity.timestamp)}</p>
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
