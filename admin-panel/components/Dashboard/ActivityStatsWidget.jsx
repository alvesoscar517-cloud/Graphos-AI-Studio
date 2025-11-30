import { useState, useEffect } from 'react';
import { activityLogsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import { Card } from '../ui/card';
import { Select } from '../ui/select';
import { cn } from '@/lib/utils';

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

  const timeRangeOptions = [
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' }
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <img src="/icon/activity.svg" alt="Activity" className="w-5 h-5 icon-dark" />
          <h3 className="text-lg font-semibold text-primary">Activity Statistics</h3>
        </div>
        <div className="text-center py-8 text-muted">Loading...</div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <img src="/icon/activity.svg" alt="Activity" className="w-5 h-5 icon-dark" />
          <h3 className="text-lg font-semibold text-primary">Activity Statistics</h3>
        </div>
        <div className="text-center py-8 text-muted">
          {error || 'No data available'}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/icon/activity.svg" alt="Activity" className="w-5 h-5 icon-dark" />
          <h3 className="text-lg font-semibold text-primary">Activity Statistics</h3>
        </div>
        <Select
          value={String(days)}
          onChange={(e) => setDays(parseInt(e.target.value))}
          options={timeRangeOptions}
          className="w-28"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-surface-secondary text-center">
          <div className="text-xl font-bold text-primary">{stats.totalActivities.toLocaleString()}</div>
          <div className="text-xs text-muted mt-1">Total Activities</div>
        </div>
        <div className="p-3 rounded-lg bg-surface-secondary text-center">
          <div className="text-xl font-bold text-primary">{stats.totalCreditsUsed.toFixed(1)}</div>
          <div className="text-xs text-muted mt-1">Credits Used</div>
        </div>
        <div className="p-3 rounded-lg bg-surface-secondary text-center">
          <div className="text-xl font-bold text-primary">{stats.uniqueUsers}</div>
          <div className="text-xs text-muted mt-1">Active Users</div>
        </div>
      </div>

      {/* Activity Trend Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-primary mb-3">Activity Trends</h4>
        <div className="flex items-end gap-1 h-24">
          {stats.activityTrend.map((day) => {
            const maxActivities = Math.max(...stats.activityTrend.map(d => d.activities));
            const height = maxActivities > 0 ? (day.activities / maxActivities) * 100 : 0;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-primary rounded-t transition-all duration-300"
                  style={{ height: `${Math.max(4, height)}%` }}
                  title={`${day.date}: ${day.activities} activities`}
                />
                <span className="text-xxs text-muted">
                  {day.date.slice(-5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Usage */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-primary mb-3">Top Features</h4>
        <div className="flex flex-col gap-2">
          {stats.featureUsage.slice(0, 5).map((feature, index) => {
            const maxCount = stats.featureUsage[0]?.count || 1;
            const percentage = (feature.count / maxCount) * 100;
            return (
              <div key={feature.type} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="text-muted">#{index + 1}</span>
                    <span className="text-primary font-medium">
                      {ACTIVITY_LABELS[feature.type] || feature.type}
                    </span>
                  </span>
                  <span className="text-muted">{feature.count}</span>
                </div>
                <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Users */}
      <div>
        <h4 className="text-sm font-medium text-primary mb-3">Top Active Users</h4>
        <div className="flex flex-col gap-2">
          {stats.topUsers.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="flex items-center gap-2 text-xs p-2 rounded bg-surface-secondary">
              <span className="text-muted w-5">#{index + 1}</span>
              <span className="text-primary font-medium flex-1 truncate" title={user.userId}>
                {user.userId.substring(0, 12)}...
              </span>
              <span className="text-muted">{user.activities} acts</span>
              <span className="text-success">{user.credits} cr</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
