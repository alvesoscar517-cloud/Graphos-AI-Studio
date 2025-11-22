import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/adminApi';
import PageHeader from '../Common/PageHeader';
import StatsCard from './StatsCard';
import LoadingScreen from '../Common/LoadingScreen';
import './DashboardView.css';

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getOverview();
      setStats(response.overview);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="dashboard-error">
        <img src="/admin/icon/alert-circle.svg" alt="Error" />
        <p>{error}</p>
        <button onClick={loadStats}>
          <img src="/admin/icon/refresh-cw.svg" alt="Retry" />
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

      <div className="stats-grid">
        <StatsCard
          icon="users.svg"
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={`+${stats?.newUsers || 0} this week`}
        />
        
        <StatsCard
          icon="folder.svg"
          title="Writing Profiles"
          value={stats?.totalProfiles || 0}
          subtitle="Profiles created"
        />
        
        <StatsCard
          icon="bell.svg"
          title="Notifications"
          value={stats?.totalNotifications || 0}
          subtitle="Total notifications"
        />
        
        <StatsCard
          icon="activity.svg"
          title="Activity"
          value="Active"
          subtitle="System running well"
        />
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <img src="/admin/icon/clock.svg" alt="Activity" />
            <h2>Recent Activities</h2>
          </div>
          <div className="activity-list">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="activity-item">
                  <div className="activity-icon">
                    <img src={`/admin/icon/${getActivityIcon(activity.action)}`} alt={activity.action} />
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
                    <img src="/admin/icon/user-plus.svg" alt="User" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">New user registered</p>
                    <p className="activity-time">5 minutes ago</p>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/admin/icon/folder-plus.svg" alt="Folder" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">New profile created</p>
                    <p className="activity-time">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/admin/icon/send.svg" alt="Send" />
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

        <div className="section">
          <div className="section-header">
            <img src="/admin/icon/chart-bar.svg" alt="Stats" />
            <h2>Quick Stats</h2>
          </div>
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="stat-label">New users (7 days)</span>
              <span className="stat-value">{stats?.newUsers || 0}</span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-label">Activity rate</span>
              <span className="stat-value">85%</span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-label">Notifications read</span>
              <span className="stat-value">92%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
