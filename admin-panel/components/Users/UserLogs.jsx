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

// All activity types configuration
const ACTIVITY_CONFIG = {
  // Authentication
  login: { label: 'Login', icon: 'log-in.svg', color: 'bg-success' },
  register: { label: 'Register', icon: 'user-plus.svg', color: 'bg-info' },
  verify_email: { label: 'Verify Email', icon: 'mail.svg', color: 'bg-success' },
  forgot_password: { label: 'Forgot Password', icon: 'key.svg', color: 'bg-warning' },
  reset_password: { label: 'Reset Password', icon: 'refresh-cw.svg', color: 'bg-info' },
  change_password: { label: 'Change Password', icon: 'lock.svg', color: 'bg-warning' },
  delete_account: { label: 'Delete Account', icon: 'user-x.svg', color: 'bg-destructive' },
  // Profile operations
  profile_create: { label: 'Create Profile', icon: 'folder-plus.svg', color: 'bg-info' },
  profile_update: { label: 'Update Profile', icon: 'edit.svg', color: 'bg-warning' },
  profile_delete: { label: 'Delete Profile', icon: 'trash-2.svg', color: 'bg-destructive' },
  profile_sample_add: { label: 'Add Sample', icon: 'file-plus.svg', color: 'bg-purple-500' },
  profile_finalize: { label: 'Finalize Profile', icon: 'check-circle.svg', color: 'bg-success' },
  // Analysis operations
  ai_detection: { label: 'AI Detection', icon: 'search.svg', color: 'bg-orange-500' },
  text_analysis: { label: 'Text Analysis', icon: 'bar-chart.svg', color: 'bg-indigo-500' },
  check_humanization: { label: 'Check Humanization', icon: 'shield.svg', color: 'bg-emerald-500' },
  // Rewrite operations
  text_rewrite: { label: 'Text Rewrite', icon: 'edit-3.svg', color: 'bg-pink-500' },
  humanize: { label: 'Humanize', icon: 'user.svg', color: 'bg-cyan-500' },
  iterative_humanize: { label: 'Iterative Humanize', icon: 'repeat.svg', color: 'bg-teal-500' },
  // Chat operations
  chat_message: { label: 'Chat', icon: 'message-circle.svg', color: 'bg-violet-500' },
  chat_humanized: { label: 'Chat Humanized', icon: 'message-square.svg', color: 'bg-amber-600' },
  conversation_summarize: { label: 'Summarize', icon: 'file-text.svg', color: 'bg-slate-500' },
  // Translation & File
  translation: { label: 'Translation', icon: 'globe.svg', color: 'bg-sky-500' },
  file_upload: { label: 'Upload File', icon: 'upload.svg', color: 'bg-lime-500' },
  // Credit operations
  credit_purchase: { label: 'Purchase Credits', icon: 'credit-card.svg', color: 'bg-success' },
  credit_deduct: { label: 'Use Credits', icon: 'minus-circle.svg', color: 'bg-destructive' },
  credits_added: { label: 'Credits Added', icon: 'plus-circle.svg', color: 'bg-success' },
  credit_bonus: { label: 'Bonus Credits', icon: 'gift.svg', color: 'bg-warning' },
  // Account operations
  account_locked: { label: 'Account Locked', icon: 'lock.svg', color: 'bg-destructive' },
  account_unlocked: { label: 'Account Unlocked', icon: 'unlock.svg', color: 'bg-success' },
  // Notification
  notification_received: { label: 'Notification', icon: 'bell.svg', color: 'bg-info' }
};

const getActivityConfig = (type) => ACTIVITY_CONFIG[type] || { label: type, icon: 'activity.svg', color: 'bg-muted' };

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

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-US');

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
            ...Object.entries(ACTIVITY_CONFIG).map(([key, config]) => ({
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

      {/* Logs */}
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
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const config = getActivityConfig(log.type);
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-secondary transition-colors">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', config.color)}>
                      <img src={`/icon/${config.icon}`} alt="" className="w-5 h-5 icon-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-primary">{config.label}</span>
                        <span className="text-xs text-muted">{formatTimestamp(log.timestamp)}</span>
                      </div>

                      {/* Credits Info */}
                      {log.creditsUsed !== undefined && log.creditsUsed !== 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded',
                              log.creditsUsed > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                            )}
                          >
                            {log.creditsUsed > 0 ? `-${log.creditsUsed.toFixed(2)}` : `+${Math.abs(log.creditsUsed).toFixed(2)}`} credits
                          </span>
                          {log.creditsBefore !== undefined && log.creditsAfter !== undefined && (
                            <span className="text-xs text-muted">
                              ({log.creditsBefore.toFixed(2)} → {log.creditsAfter.toFixed(2)})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {log.wordCount && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.wordCount} words</span>
                        )}
                        {log.inputLength && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.inputLength} chars input</span>
                        )}
                        {log.outputLength && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.outputLength} chars output</span>
                        )}
                        {log.aiProbability !== undefined && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            log.aiProbability > 0.7 ? "bg-destructive/10 text-destructive" : 
                            log.aiProbability > 0.3 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                          )}>
                            AI: {(log.aiProbability * 100).toFixed(0)}%
                          </span>
                        )}
                        {log.isAuthentic !== undefined && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            log.isAuthentic ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          )}>
                            {log.isAuthentic ? 'Authentic' : 'Not Authentic'}
                          </span>
                        )}
                        {log.voiceCompatibility !== undefined && (
                          <span className="text-xs px-2 py-0.5 rounded bg-info/10 text-info">
                            Voice: {(log.voiceCompatibility * 100).toFixed(0)}%
                          </span>
                        )}
                        {log.iterations && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.iterations} iterations</span>
                        )}
                        {log.reachedTarget !== undefined && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            log.reachedTarget ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          )}>
                            {log.reachedTarget ? 'Target Reached' : 'Target Not Reached'}
                          </span>
                        )}
                        {log.model && <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">{log.model}</span>}
                        {log.feature && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.feature}</span>
                        )}
                        {log.duration && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.duration}ms</span>
                        )}
                        {log.profileName && (
                          <span className="text-xs px-2 py-0.5 rounded bg-info/10 text-info">{log.profileName}</span>
                        )}
                        {log.profileId && !log.profileName && (
                          <span className="text-xs px-2 py-0.5 rounded bg-info/10 text-info">
                            Profile: {log.profileId.substring(0, 8)}...
                          </span>
                        )}
                        {log.sourceLang && log.targetLang && (
                          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600">
                            {log.sourceLang} → {log.targetLang}
                          </span>
                        )}
                        {log.fileName && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.fileName}</span>
                        )}
                        {log.messagesCount && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.messagesCount} messages</span>
                        )}
                        {log.overallRisk && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            log.overallRisk === 'high' ? "bg-destructive/10 text-destructive" :
                            log.overallRisk === 'medium' ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                          )}>
                            Risk: {log.overallRisk}
                          </span>
                        )}
                        {log.ip && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">IP: {log.ip}</span>
                        )}
                        {log.source && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-muted">{log.source}</span>
                        )}
                        {log.reason && (
                          <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">{log.reason}</span>
                        )}
                      </div>

                      {log.error && <div className="text-xs text-destructive mt-1">{log.error}</div>}
                    </div>
                  </div>
                );
              })}
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
