import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { activityLogsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { SimpleTooltip } from '../ui/tooltip';
import { cn } from '@/lib/utils';

const ACTIVITY_TYPES = {
  // Authentication
  login: { label: 'Login', icon: 'log-in.svg' },
  register: { label: 'Register', icon: 'user-plus.svg' },
  verify_email: { label: 'Verify Email', icon: 'mail.svg' },
  forgot_password: { label: 'Forgot Password', icon: 'key.svg' },
  reset_password: { label: 'Reset Password', icon: 'refresh-cw.svg' },
  change_password: { label: 'Change Password', icon: 'lock.svg' },
  delete_account: { label: 'Delete Account', icon: 'user-x.svg' },
  // Profile operations
  profile_create: { label: 'Create Profile', icon: 'folder-plus.svg' },
  profile_update: { label: 'Update Profile', icon: 'edit.svg' },
  profile_delete: { label: 'Delete Profile', icon: 'trash-2.svg' },
  profile_sample_add: { label: 'Add Sample', icon: 'file-plus.svg' },
  profile_finalize: { label: 'Finalize Profile', icon: 'check-circle.svg' },
  // Analysis operations
  ai_detection: { label: 'AI Detection', icon: 'search.svg' },
  text_analysis: { label: 'Text Analysis', icon: 'bar-chart.svg' },
  check_humanization: { label: 'Check Humanization', icon: 'shield.svg' },
  // Rewrite operations
  text_rewrite: { label: 'Text Rewrite', icon: 'edit-3.svg' },
  humanize: { label: 'Humanize', icon: 'user.svg' },
  iterative_humanize: { label: 'Iterative Humanize', icon: 'repeat.svg' },
  // Chat operations
  chat_message: { label: 'Chat', icon: 'message-circle.svg' },
  chat_humanized: { label: 'Chat Humanized', icon: 'message-square.svg' },
  conversation_summarize: { label: 'Summarize', icon: 'file-text.svg' },
  // Translation & File
  translation: { label: 'Translation', icon: 'globe.svg' },
  file_upload: { label: 'Upload File', icon: 'upload.svg' },
  // Credit operations
  credit_purchase: { label: 'Purchase Credits', icon: 'credit-card.svg' },
  credit_deduct: { label: 'Use Credits', icon: 'minus-circle.svg' },
  credits_added: { label: 'Credits Added', icon: 'plus-circle.svg' },
  credit_bonus: { label: 'Bonus Credits', icon: 'gift.svg' },
  // Account operations
  account_locked: { label: 'Account Locked', icon: 'lock.svg' },
  account_unlocked: { label: 'Account Unlocked', icon: 'unlock.svg' },
  // Notification
  notification_received: { label: 'Notification', icon: 'bell.svg' }
};

const getActivityConfig = (type) => ACTIVITY_TYPES[type] || { label: type, icon: 'activity.svg' };

export default function AllActivityLogs() {
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [filter, setFilter] = useState({ type: 'all', userId: '', startDate: null, endDate: null });
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, hasMore: false });
  const [cleaning, setCleaning] = useState(false);
  const [filtering, setFiltering] = useState(false);

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
        startDate: filter.startDate ? format(filter.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filter.endDate ? format(filter.endDate, 'yyyy-MM-dd') : undefined
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

  const handleFilter = async () => {
    setFiltering(true);
    setPagination({ ...pagination, offset: 0 });
    await loadLogs();
    setFiltering(false);
  };

  const handleCleanup = async () => {
    const confirmed = await notify.confirm({
      title: 'Clean Up Old Logs',
      message: 'Delete all activity logs older than 90 days?',
      type: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
      setCleaning(true);
      const result = await activityLogsApi.cleanup(90);
      notify.success(`Deleted ${result.deleted.logs} logs and ${result.deleted.aggregations} aggregations`);
      loadLogs();
      loadStats();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setCleaning(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="activity.svg"
        title="Activity Logs"
        subtitle="Track all user activities"
        actions={
          <Button variant="secondary" size="sm" onClick={handleCleanup} disabled={cleaning} loading={cleaning}>
            <img src="/icon/trash-2.svg" alt="" className="w-4 h-4 icon-dark" />
            <span className="hidden sm:inline">Clean Up Old Logs</span>
            <span className="sm:hidden">Clean</span>
          </Button>
        }
      />

      {/* Stats Summary - Responsive */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
          <Card className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
              <img src="/icon/activity.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.totalActivities.toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-muted truncate">Activities (7d)</div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
              <img src="/icon/credit-card.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.totalCreditsUsed.toFixed(1)}</div>
              <div className="text-[10px] sm:text-xs text-muted truncate">Credits Used</div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
              <img src="/icon/users.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.uniqueUsers}</div>
              <div className="text-[10px] sm:text-xs text-muted truncate">Active Users</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters - Responsive */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Select
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            options={[
              { value: 'all', label: 'All Types' },
              ...Object.entries(ACTIVITY_TYPES).map(([key, config]) => ({ value: key, label: config.label }))
            ]}
            className="w-full sm:w-44"
          />
          <Input
            placeholder="User ID..."
            value={filter.userId}
            onChange={(e) => setFilter({...filter, userId: e.target.value})}
            containerClassName="w-full sm:w-40"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="w-[calc(50%-4px)] sm:w-40">
            <DatePicker
              value={filter.startDate}
              onChange={(date) => setFilter({...filter, startDate: date})}
              placeholder="Start date"
              maxDate={filter.endDate || undefined}
            />
          </div>
          <div className="w-[calc(50%-4px)] sm:w-40">
            <DatePicker
              value={filter.endDate}
              onChange={(date) => setFilter({...filter, endDate: date})}
              placeholder="End date"
              minDate={filter.startDate || undefined}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleFilter} disabled={filtering} loading={filtering} className="flex-1 sm:flex-none">
            <img src="/icon/filter.svg" alt="" className="w-4 h-4 icon-dark" />
            Filter
          </Button>
          {(filter.startDate || filter.endDate) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter({...filter, startDate: null, endDate: null})}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Logs Table - Responsive */}
      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="w-8 h-8 border-2 border-surface-secondary border-t-primary rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <img src="/icon/inbox.svg" alt="" className="w-10 h-10 sm:w-12 sm:h-12 icon-gray mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-muted">No activity logs</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Type</th>
                    <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">User</th>
                    <th className="p-2 sm:p-3 text-right text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Credits</th>
                    <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden md:table-cell">Details</th>
                    <th className="p-2 sm:p-3 text-right text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const config = getActivityConfig(log.type);
                    return (
                    <tr 
                      key={log.id} 
                      className="border-b border-border hover:bg-surface-secondary transition-colors"
                    >
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
                            <img src={`/icon/${config.icon}`} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-dark" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-[80px] sm:max-w-none">
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <button 
                          className="text-xs sm:text-sm text-muted hover:text-primary hover:underline transition-colors"
                          onClick={() => navigate(`/users/${log.userId}/credits`)}
                        >
                          <SimpleTooltip content={log.userId}>
                            <span>{log.userId.substring(0, 8)}...</span>
                          </SimpleTooltip>
                        </button>
                      </td>
                      <td className="p-2 sm:p-3 text-right">
                        {log.creditsUsed !== undefined && log.creditsUsed !== 0 ? (
                          <span className={cn(
                            "text-xs sm:text-sm font-medium",
                            log.creditsUsed > 0 ? "text-primary" : "text-muted"
                          )}>
                            {log.creditsUsed > 0 ? `-${log.creditsUsed.toFixed(2)}` : `+${Math.abs(log.creditsUsed).toFixed(2)}`}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-muted">—</span>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted flex-wrap">
                          {log.wordCount && <span>{log.wordCount} words</span>}
                          {log.inputLength && <span>{log.inputLength} chars</span>}
                          {log.duration && <span>{log.duration}ms</span>}
                          {log.model && <span className="truncate max-w-[60px]">{log.model}</span>}
                          {log.feature && <span>{log.feature}</span>}
                          {log.profileName && <span className="truncate max-w-[80px]">{log.profileName}</span>}
                          {log.aiProbability !== undefined && (
                            <span>AI: {(log.aiProbability * 100).toFixed(0)}%</span>
                          )}
                          {!log.wordCount && !log.inputLength && !log.duration && !log.model && !log.feature && !log.profileName && log.aiProbability === undefined && (
                            <span>—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-right">
                        <span className="text-[10px] sm:text-xs text-muted whitespace-nowrap">
                          {formatTime(log.timestamp)}
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {pagination.hasMore && (
              <div className="p-3 sm:p-4 border-t border-border">
                <Button variant="secondary" size="sm" className="w-full" onClick={() => loadLogs(true)}>
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
