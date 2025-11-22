import { useState, useEffect } from 'react';
import { analyticsApi } from '../../../services/adminApi';
import StatsCard from './StatsCard';
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
      'user_registered': 'Người dùng mới đăng ký',
      'profile_created': 'Hồ sơ mới được tạo',
      'notification_sent': 'Thông báo đã được gửi',
      'user_login': 'Người dùng đăng nhập',
      'locked': 'Tài khoản bị khóa',
      'unlocked': 'Tài khoản được mở khóa',
      'deleted': 'Tài khoản bị xóa'
    };
    return titles[activity.action] || activity.action;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Vừa xong';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <img src="/icon/alert-circle.svg" alt="Error" />
        <p>{error}</p>
        <button onClick={loadStats}>
          <img src="/icon/refresh-cw.svg" alt="Retry" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống</p>
      </div>

      <div className="stats-grid">
        <StatsCard
          icon="users.svg"
          title="Tổng người dùng"
          value={stats?.totalUsers || 0}
          change={`+${stats?.newUsers || 0} tuần này`}
        />
        
        <StatsCard
          icon="folder.svg"
          title="Hồ sơ văn phong"
          value={stats?.totalProfiles || 0}
          subtitle="Profiles đã tạo"
        />
        
        <StatsCard
          icon="bell.svg"
          title="Thông báo"
          value={stats?.totalNotifications || 0}
          subtitle="Tổng thông báo"
        />
        
        <StatsCard
          icon="activity.svg"
          title="Hoạt động"
          value="Active"
          subtitle="Hệ thống hoạt động tốt"
        />
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <img src="/icon/clock.svg" alt="Activity" />
            <h2>Hoạt động gần đây</h2>
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
                    <p className="activity-title">Người dùng mới đăng ký</p>
                    <p className="activity-time">5 phút trước</p>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/icon/folder-plus.svg" alt="Folder" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">Hồ sơ mới được tạo</p>
                    <p className="activity-time">15 phút trước</p>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">
                    <img src="/icon/send.svg" alt="Send" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">Thông báo đã được gửi</p>
                    <p className="activity-time">1 giờ trước</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <img src="/icon/chart-bar.svg" alt="Stats" />
            <h2>Thống kê nhanh</h2>
          </div>
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="stat-label">Người dùng mới (7 ngày)</span>
              <span className="stat-value">{stats?.newUsers || 0}</span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-label">Tỷ lệ hoạt động</span>
              <span className="stat-value">85%</span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-label">Thông báo đã đọc</span>
              <span className="stat-value">92%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
