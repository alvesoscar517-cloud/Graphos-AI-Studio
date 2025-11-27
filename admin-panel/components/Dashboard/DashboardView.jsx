import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { ordersApi, supportApi } from '../../services/adminApi';
import PageHeader from '../Common/PageHeader';
import StatsCard from './StatsCard';
import ActivityStatsWidget from './ActivityStatsWidget';
import LoadingScreen from '../Common/LoadingScreen';
import './DashboardView.css';

export default function DashboardView() {
  const { overview: stats, loading: realtimeLoading, loadOverview, setActiveTab } = useRealtime();
  const [error, setError] = useState('');
  const [revenueStats, setRevenueStats] = useState(null);
  const [supportStats, setSupportStats] = useState(null);
  const navigate = useNavigate();
  const loading = realtimeLoading.overview;

  useEffect(() => {
    setActiveTab('dashboard');
    loadStats();
    loadExtraStats();
  }, []);

  const loadStats = async () => {
    try {
      await loadOverview();
    } catch (err) {
      setError(err.message);
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
      // Silent fail for extra stats
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
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !stats) {
    return (
      <div className="dashboard-error">
        <img src="/icon/alert-circle.svg" alt="Error" />
        <p>{error}</p>
        <button onClick={() => loadOverview(true)}>
          <img src="/icon/refresh-cw.svg" alt="Retry" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <PageHeader
        icon="layout-dashboard.svg"
        title="Dashboard"
        subtitle="System overview and recent activities"
      />

      <div className="dashboard-stats-grid">
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
          value={`$${revenueStats?.totalRevenue?.toFixed(2) || '0.00'}`}
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

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <img src="/icon/clock.svg" alt="Activity" />
            <h2>Recent Activities</h2>
          </div>
          <div className="activity-list">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="activity-item">
                  <div className="activity-icon">
                    <img src={`/icon/${getActivityIcon(activity.action)}`} alt={activity.action} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{getActivityTitle(activity)}</p>
                    <p className="activity-time">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/icon/user-plus.svg" alt="User" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">New user registered</p>
                    <p className="activity-time">5 minutes ago</p>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/icon/folder-plus.svg" alt="Folder" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">New profile created</p>
                    <p className="activity-time">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/icon/send.svg" alt="Send" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">Notification sent</p>
                    <p className="activity-time">1 hour ago</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="section activity-stats-section">
          <ActivityStatsWidget />
        </div>
      </div>
    </div>
  );
}
