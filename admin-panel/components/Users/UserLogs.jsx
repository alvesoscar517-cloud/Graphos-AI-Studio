import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { activityLogsApi, usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { cn } from '@/lib/utils';

// Activity types configuration
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

export default function UserLogs() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  const [filter, setFilter] = useState({ type: 'all', startDate: null, endDate: null });
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, hasMore: false });

  useEffect(() => {
    loadUserInfo();
  }, [userId]);

  useEffect(() => {
    if (user) loadLogs();
  }, [user, filter]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(userId);
      setUser(response.user);
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate(`/users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (append = false) => {
    try {
      setLogsLoading(true);
      const params = {
        limit: pagination.limit,
        offset: append ? pagination.offset + pagination.limit : 0,
        type: filter.type !== 'all' ? filter.type : undefined,
        startDate: filter.startDate ? format(filter.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filter.endDate ? format(filter.endDate, 'yyyy-MM-dd') : undefined
      };
      const response = await activityLogsApi.getUserLogs(userId, params);

      if (append) {
        setLogs((prev) => [...prev, ...response.logs]);
      } else {
        setLogs(response.logs);
      }

      setPagination({
        ...pagination,
        offset: append ? pagination.offset + pagination.limit : 0,
        hasMore: response.pagination.hasMore
      });
    } catch (err) {
      notify.error('Error loading logs: ' + err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6">
      <PageHeader
        icon="activity.svg"
        title={`Activity Logs - ${user?.name || user?.email || userId}`}
        subtitle="All user activities and actions"
        actions={
          <Button variant="ghost" onClick={() => navigate(`/users/${userId}`)}>
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" /> Back
          </Button>
        }
      />

      {/* Quick Info */}
      <div className="flex gap-6 mt-4 text-sm">
        <div>
          <span className="text-muted">Email:</span> <span className="text-primary font-medium">{user?.email}</span>
        </div>
        <div>
          <span className="text-muted">Total:</span> <span className="text-primary font-medium">{logs.length} logs</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <Select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          options={[
            { value: 'all', label: 'All Activities' },
            ...Object.entries(ACTIVITY_TYPES).map(([key, config]) => ({
              value: key,
              label: config.label
            }))
          ]}
          className="w-48"
        />
        <div className="w-40">
          <DatePicker
            value={filter.startDate}
            onChange={(date) => setFilter({ ...filter, startDate: date })}
            placeholder="Start date"
            maxDate={filter.endDate || undefined}
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={filter.endDate}
            onChange={(date) => setFilter({ ...filter, endDate: date })}
            placeholder="End date"
            minDate={filter.startDate || undefined}
          />
        </div>
        <Button variant="secondary" onClick={() => loadLogs()}>
          <img src="/icon/filter.svg" alt="" className="w-4 h-4 icon-dark" /> Filter
        </Button>
        {(filter.startDate || filter.endDate) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilter({ ...filter, startDate: null, endDate: null })}
          >
            Clear dates
          </Button>
        )}
      </div>

      {/* Logs Table */}
      <Card className="mt-4 overflow-hidden">
        {logsLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-surface-secondary border-t-primary rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src="/icon/inbox.svg" alt="" className="w-12 h-12 icon-gray mb-4" />
            <h3 className="font-semibold text-primary mb-1">No activity logs</h3>
            <p className="text-sm text-muted">User has no recorded activities yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="p-3 text-left text-xs font-medium text-muted uppercase">Activity</th>
                    <th className="p-3 text-right text-xs font-medium text-muted uppercase">Credits</th>
                    <th className="p-3 text-left text-xs font-medium text-muted uppercase">Details</th>
                    <th className="p-3 text-right text-xs font-medium text-muted uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const config = getActivityConfig(log.type);
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-surface-secondary transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
                              <img src={`/icon/${config.icon}`} alt="" className="w-4 h-4 icon-dark" />
                            </div>
                            <span className="text-sm font-medium text-primary">{config.label}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {log.creditsUsed !== undefined && log.creditsUsed !== 0 ? (
                            <div>
                              <span className={cn(
                                "text-sm font-medium",
                                log.creditsUsed > 0 ? "text-primary" : "text-muted"
                              )}>
                                {log.creditsUsed > 0 ? `-${log.creditsUsed.toFixed(2)}` : `+${Math.abs(log.creditsUsed).toFixed(2)}`}
                              </span>
                              {log.creditsBefore !== undefined && log.creditsAfter !== undefined && (
                                <div className="text-xs text-muted">
                                  {log.creditsBefore.toFixed(0)} → {log.creditsAfter.toFixed(0)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            {log.wordCount && <span>{log.wordCount} words</span>}
                            {log.inputLength && <span>{log.inputLength} chars</span>}
                            {log.duration && <span>{log.duration}ms</span>}
                            {log.model && <span>{log.model}</span>}
                            {log.profileName && <span>{log.profileName}</span>}
                            {log.profileId && !log.profileName && <span>Profile: {log.profileId.substring(0, 8)}...</span>}
                            {log.aiProbability !== undefined && <span>AI: {(log.aiProbability * 100).toFixed(0)}%</span>}
                            {log.voiceCompatibility !== undefined && <span>Voice: {(log.voiceCompatibility * 100).toFixed(0)}%</span>}
                            {log.iterations && <span>{log.iterations} iterations</span>}
                            {log.sourceLang && log.targetLang && <span>{log.sourceLang} → {log.targetLang}</span>}
                            {log.fileName && <span>{log.fileName}</span>}
                            {log.messagesCount && <span>{log.messagesCount} messages</span>}
                            {log.ip && <span>IP: {log.ip}</span>}
                            {log.source && <span>{log.source}</span>}
                            {log.feature && <span>{log.feature}</span>}
                            {log.error && <span className="text-destructive">{log.error}</span>}
                            {!log.wordCount && !log.inputLength && !log.duration && !log.model && !log.profileName && !log.profileId && log.aiProbability === undefined && !log.ip && !log.source && !log.feature && !log.error && (
                              <span>—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-xs text-muted whitespace-nowrap">
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
              <div className="p-4 border-t border-border">
                <Button variant="secondary" className="w-full" onClick={() => loadLogs(true)} disabled={logsLoading}>
                  {logsLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
