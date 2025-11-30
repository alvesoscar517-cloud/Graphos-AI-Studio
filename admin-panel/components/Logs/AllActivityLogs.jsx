import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityLogsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { cn } from '@/lib/utils';

const ACTIVITY_CONFIG = {
  login: { label: 'Login', icon: 'log-in.svg', color: 'bg-success' },
  logout: { label: 'Logout', icon: 'log-out.svg', color: 'bg-muted' },
  profile_create: { label: 'Create Profile', icon: 'folder-plus.svg', color: 'bg-info' },
  profile_update: { label: 'Update Profile', icon: 'edit.svg', color: 'bg-warning' },
  profile_delete: { label: 'Delete Profile', icon: 'trash-2.svg', color: 'bg-destructive' },
  profile_sample_add: { label: 'Add Sample', icon: 'file-plus.svg', color: 'bg-purple-500' },
  profile_finalize: { label: 'Finalize Profile', icon: 'check-circle.svg', color: 'bg-success' },
  ai_detection: { label: 'AI Detection', icon: 'search.svg', color: 'bg-orange-500' },
  text_analysis: { label: 'Text Analysis', icon: 'bar-chart.svg', color: 'bg-indigo-500' },
  text_rewrite: { label: 'Text Rewrite', icon: 'edit-3.svg', color: 'bg-pink-500' },
  humanize: { label: 'Humanize', icon: 'user.svg', color: 'bg-cyan-500' },
  iterative_humanize: { label: 'Iterative Humanize', icon: 'repeat.svg', color: 'bg-teal-500' },
  chat_message: { label: 'Chat', icon: 'message-circle.svg', color: 'bg-violet-500' },
  chat_humanized: { label: 'Chat Humanized', icon: 'message-square.svg', color: 'bg-amber-600' },
  translation: { label: 'Translation', icon: 'globe.svg', color: 'bg-sky-500' },
  file_upload: { label: 'Upload File', icon: 'upload.svg', color: 'bg-lime-500' },
  credit_purchase: { label: 'Purchase Credits', icon: 'credit-card.svg', color: 'bg-success' },
  credit_deduct: { label: 'Deduct Credits', icon: 'minus-circle.svg', color: 'bg-destructive' }
};

const getActivityConfig = (type) => ACTIVITY_CONFIG[type] || { label: type, icon: 'activity.svg', color: 'bg-muted' };

export default function AllActivityLogs() {
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [filter, setFilter] = useState({ type: 'all', userId: '', startDate: '', endDate: '' });
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, hasMore: false });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async (append = false) => {
    try {
      if (!append) setLoading(true);
      
      const params = {
        limit: pagination.limit,
        offset: append ? pagination.offset + pagination.limit : 0,
        type: filter.type !== 'all' ? filter.type : undefined,
        userId: filter.userId || undefined,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined
      };
      
      const response = await activityLogsApi.getAll(params);
      
      if (append) {
        setLogs(prev => [...prev, ...response.logs]);
      } else {
        setLogs(response.logs);
      }
      
      setPagination({
        ...pagination,
        offset: append ? pagination.offset + pagination.limit : 0,
        hasMore: response.pagination.hasMore
      });
    } catch (err) {
      notify.error('Unable to load activity logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await activityLogsApi.getStatistics(7);
      setStats(response.statistics);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilter = () => {
    setPagination({ ...pagination, offset: 0 });
    loadLogs();
  };

  const handleCleanup = async () => {
    const confirmed = await notify.confirm({
      title: 'Clean Up Old Logs',
      message: 'Delete all activity logs older than 90 days?',
      type: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
      const result = await activityLogsApi.cleanup(90);
      notify.success(`Deleted ${result.deleted.logs} logs and ${result.deleted.aggregations} aggregations`);
      loadLogs();
      loadStats();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-US');

  return (
    <div className="p-6">
      <PageHeader
        icon="activity.svg"
        title="Activity Logs"
        subtitle="Track all user activities"
        actions={
          <Button variant="secondary" size="sm" onClick={handleCleanup}>
            <img src="/icon/trash-2.svg" alt="" className="w-4 h-4 icon-dark" />
            Clean Up Old Logs
          </Button>
        }
      />

      {/* Stats Summary */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
              <img src="/icon/activity.svg" alt="" className="w-5 h-5 icon-dark" />
            </div>
            <div>
              <div className="text-xl font-bold text-primary">{stats.totalActivities.toLocaleString()}</div>
              <div className="text-xs text-muted">Activities (7 days)</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
              <img src="/icon/credit-card.svg" alt="" className="w-5 h-5 icon-dark" />
            </div>
            <div>
              <div className="text-xl font-bold text-primary">{stats.totalCreditsUsed.toFixed(1)}</div>
              <div className="text-xs text-muted">Credits Used</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
              <img src="/icon/users.svg" alt="" className="w-5 h-5 icon-dark" />
            </div>
            <div>
              <div className="text-xl font-bold text-primary">{stats.uniqueUsers}</div>
              <div className="text-xs text-muted">Active Users</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mt-6">
        <Select
          value={filter.type}
          onChange={(e) => setFilter({...filter, type: e.target.value})}
          options={[
            { value: 'all', label: 'All Types' },
            ...Object.entries(ACTIVITY_CONFIG).map(([key, config]) => ({
              value: key,
              label: config.label
            }))
          ]}
          className="w-44"
        />
        <Input
          placeholder="User ID..."
          value={filter.userId}
          onChange={(e) => setFilter({...filter, userId: e.target.value})}
          containerClassName="w-40"
        />
        <Input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({...filter, startDate: e.target.value})}
          containerClassName="w-36"
        />
        <Input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({...filter, endDate: e.target.value})}
          containerClassName="w-36"
        />
        <Button variant="secondary" onClick={handleFilter}>
          <img src="/icon/filter.svg" alt="" className="w-4 h-4 icon-dark" />
          Filter
        </Button>
      </div>

      {/* Logs List */}
      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-surface-secondary border-t-primary rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src="/icon/inbox.svg" alt="" className="w-12 h-12 icon-gray mb-4" />
            <p className="text-sm text-muted">No activity logs</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {logs.map(log => {
                const config = getActivityConfig(log.type);
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-secondary transition-colors">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                      <img src={`/icon/${config.icon}`} alt={log.type} className="w-5 h-5 icon-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-primary">{config.label}</span>
                        <span className="text-xs text-muted">{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <button 
                        className="text-xs text-info hover:underline mt-1"
                        onClick={() => navigate(`/users/${log.userId}/activity`)}
                      >
                        {log.userId.substring(0, 16)}...
                      </button>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {log.creditsUsed !== undefined && (
                          <span className={cn("text-xs px-2 py-0.5 rounded", log.creditsUsed > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>
                            {log.creditsUsed > 0 ? `-${log.creditsUsed.toFixed(2)}` : `+${Math.abs(log.creditsUsed).toFixed(2)}`} credits
                          </span>
                        )}
                        {log.feature && <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.feature}</span>}
                        {log.model && <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.model}</span>}
                        {log.wordCount && <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.wordCount} words</span>}
                        {log.duration && <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.duration}ms</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {pagination.hasMore && (
              <div className="p-4 border-t border-border">
                <Button variant="secondary" className="w-full" onClick={() => loadLogs(true)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
