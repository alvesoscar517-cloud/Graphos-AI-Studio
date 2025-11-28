import { useState, useEffect } from 'react';
import { activityLogsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import CustomSelect from '../Common/CustomSelect';
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
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    let isMounted = true;
    
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await activityLogsApi.getStatistics(days);
        
        if (isMounted) {
          setStats(response.statistics);
        }
      } catch (err) {
        console.error('Activity stats load error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load statistics');
          notify.error('Unable to load activity statistics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [days, notify]);

  if (loading) {
    return (
      <div className="activity-stats-widget loading">
        <div className="widget-header">
          <h3>
            <img src="/icon/activity.svg" alt="Activity" />
            Activity Statistics
          </h3>
        </div>
        <div className="loading-placeholder">Loading...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="activity-stats-widget">
        <div className="widget-header">
          <h3>
            <img src="/icon/activity.svg" alt="Activity" />
            Activity Statistics
          </h3>
        </div>
        <div className="loading-placeholder">
          {error || 'No data available'}
        </div>
      </div>
    );
  }

  const timeRangeOptions = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' }
  ];

  return (
    <div className="activity-stats-widget">
      <div className="widget-header">
        <h3>
          <img src="/icon/activity.svg" alt="Activity" />
          Activity Statistics
        </h3>
        <CustomSelect
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          options={timeRangeOptions}
          className="time-range-select"
        />
      </div>

      {/* Summary Cards */}
      <div className="stats-summary">
        <div className="activity-stat-item">
          <div className="stat-value">{stats.totalActivities.toLocaleString()}</div>
          <div className="stat-label">Total Activities</div>
        </div>
        <div className="activity-stat-item">
          <div className="stat-value">{stats.totalCreditsUsed.toFixed(1)}</div>
          <div className="stat-label">Credits Used</div>
        </div>
        <div className="activity-stat-item">
          <div className="stat-value">{stats.uniqueUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>

      {/* Activity Trend Chart */}
      <div className="trend-section">
        <h4>Activity Trends</h4>
        <div className="trend-chart">
          {stats.activityTrend.map((day) => {
            const maxActivities = Math.max(...stats.activityTrend.map(d => d.activities));
            const height = maxActivities > 0 ? (day.activities / maxActivities) * 100 : 0;
            return (
              <div key={day.date} className="trend-bar">
                <div 
                  className="bar" 
                  style={{ height: `${Math.max(4, height)}%` }}
                  title={`${day.date}: ${day.activities} activities`}
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
        <h4>Top Features</h4>
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
        <h4>Top Active Users</h4>
        <div className="users-list">
          {stats.topUsers.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="user-item">
              <span className="user-rank">#{index + 1}</span>
              <span className="user-id" title={user.userId}>
                {user.userId.substring(0, 12)}...
              </span>
              <span className="user-activities">{user.activities} activities</span>
              <span className="user-credits">{user.credits} credits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
