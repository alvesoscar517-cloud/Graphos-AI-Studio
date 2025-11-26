import { useState, useEffect } from 'react';
import { activityLogsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import './ActivityStatsWidget.css';

// Activity type config
const ACTIVITY_LABELS = {
  ai_detection: 'AI Detection',
  text_analysis: 'Text Analysis',
  text_rewrite: 'Text Rewrite',
  humanize: 'Humanize',
  iterative_humanize: 'Iterative Humanize',
  chat_message: 'Chat',
  chat_humanized: 'Chat Humanized',
  translation: 'Translation',
  profile_create: 'Profile Create',
  profile_sample_add: 'Sample Add',
  profile_finalize: 'Profile Finalize',
  file_upload: 'File Upload',
  credit_purchase: 'Credit Purchase'
};

export default function ActivityStatsWidget() {
  const notify = useNotify();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await activityLogsApi.getStatistics(days);
      setStats(response.statistics);
    } catch (err) {
      notify.error('Không thể tải activity statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="activity-stats-widget loading">
        <div className="widget-header">
          <h3>
            <img src="/icon/activity.svg" alt="Activity" />
            Activity Statistics
          </h3>
        </div>
        <div className="loading-placeholder">Đang tải...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="activity-stats-widget">
      <div className="widget-header">
        <h3>
          <img src="/icon/activity.svg" alt="Activity" />
          Activity Statistics
        </h3>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
          <option value={7}>7 ngày</option>
          <option value={14}>14 ngày</option>
          <option value={30}>30 ngày</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.totalActivities.toLocaleString()}</div>
          <div className="stat-label">Tổng hoạt động</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalCreditsUsed.toFixed(1)}</div>
          <div className="stat-label">Credits đã dùng</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.uniqueUsers}</div>
          <div className="stat-label">Users hoạt động</div>
        </div>
      </div>

      {/* Activity Trend Chart */}
      <div className="trend-section">
        <h4>Xu hướng hoạt động</h4>
        <div className="trend-chart">
          {stats.activityTrend.map((day, index) => {
            const maxActivities = Math.max(...stats.activityTrend.map(d => d.activities));
            const height = maxActivities > 0 ? (day.activities / maxActivities) * 100 : 0;
            return (
              <div key={day.date} className="trend-bar">
                <div 
                  className="bar" 
                  style={{ height: `${Math.max(4, height)}%` }}
                  title={`${day.date}: ${day.activities} hoạt động`}
                />
                <span className="bar-label">
                  {day.date.slice(-5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Usage */}
      <div className="feature-section">
        <h4>Top tính năng</h4>
        <div className="feature-list">
          {stats.featureUsage.slice(0, 5).map((feature, index) => {
            const maxCount = stats.featureUsage[0]?.count || 1;
            const percentage = (feature.count / maxCount) * 100;
            return (
              <div key={feature.type} className="feature-item">
                <div className="feature-info">
                  <span className="feature-rank">#{index + 1}</span>
                  <span className="feature-name">
                    {ACTIVITY_LABELS[feature.type] || feature.type}
                  </span>
                  <span className="feature-count">{feature.count}</span>
                </div>
                <div className="feature-bar">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Users */}
      <div className="users-section">
        <h4>Top users hoạt động</h4>
        <div className="users-list">
          {stats.topUsers.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="user-item">
              <span className="user-rank">#{index + 1}</span>
              <span className="user-id" title={user.userId}>
                {user.userId.substring(0, 12)}...
              </span>
              <span className="user-activities">{user.activities} hoạt động</span>
              <span className="user-credits">{user.credits} credits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
