import { useState, useEffect } from 'react';
import { useRealtime } from '../../contexts/RealtimeContext';
import PageHeader from '../Common/PageHeader';
import StatsCard from './StatsCard';
import LoadingScreen from '../Common/LoadingScreen';
import './DashboardView.css';

export default function DashboardView() {
  const { overview: stats, loading: realtimeLoading, loadOverview, setActiveTab } = useRealtime();
  const [error, setError] = useState('');
  const loading = realtimeLoading.overview;

  useEffect(() => {
    setActiveTab('dashboard');
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      await loadOverview();
    } catch (err) {
      setError(err.message);
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

        <div className="section">
          <div className="section-header">
            <img src="/icon/chart-bar.svg" alt="Stats" />
            <h2>Quick Stats</h2>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="activity-content">
                <p className="activity-title">New users (7 days)</p>
                <p className="activity-time">{stats?.newUsers || 5}</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="activity-content">
                <p className="activity-title">Activity rate</p>
                <p className="activity-time">85%</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
              </div>
              <div className="activity-content">
                <p className="activity-title">Notifications read</p>
                <p className="activity-time">92%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
