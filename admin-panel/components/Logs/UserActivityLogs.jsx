import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activityLogsApi, usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
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
  credit_deduct: { label: 'Deduct Credits', icon: 'minus-circle.svg', color: 'bg-destructive' },
  credit_bonus: { label: 'Bonus Credits', icon: 'gift.svg', color: 'bg-warning' },
  account_locked: { label: 'Lock Account', icon: 'lock.svg', color: 'bg-destructive' },
  account_unlocked: { label: 'Unlock Account', icon: 'unlock.svg', color: 'bg-success' }
};

const getActivityConfig = (type) => ACTIVITY_CONFIG[type] || { label: type, icon: 'activity.svg', color: 'bg-muted' };

export default function UserActivityLogs() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [featureUsage, setFeatureUsage] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('logs');
  const [filter, setFilter] = useState({ type: 'all', startDate: '', endDate: '', days: 30 });
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, hasMore: false });

  useEffect(() => { loadUserInfo(); }, [userId]);
  useEffect(() => { if (user) loadTabData(); }, [activeTab, filter, user]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(userId);
      setUser(response.user);
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    setLogsLoading(true);
    try {
      switch (activeTab) {
        case 'logs': await loadActivityLogs(); break;
        case 'summary': await loadSummary(); break;
        case 'credits': await loadCreditTransactions(); break;
        case 'features': await loadFeatureUsage(); break;
      }
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadActivityLogs = async (append = false) => {
    const params = {
      limit: pagination.limit,
      offset: append ? pagination.offset + pagination.limit : 0,
      type: filter.type !== 'all' ? filter.type : undefined,
      startDate: filter.startDate || undefined,
      endDate: filter.endDate || undefined
    };
    const response = await activityLogsApi.getUserLogs(userId, params);
    if (append) setLogs(prev => [...prev, ...response.logs]);
    else setLogs(response.logs);
    setPagination({ ...pagination, offset: append ? pagination.offset + pagination.limit : 0, hasMore: response.pagination.hasMore });
  };

  const loadSummary = async () => {
    const response = await activityLogsApi.getUserSummary(userId, { days: filter.days });
    setSummary(response.summary);
  };

  const loadCreditTransactions = async () => {
    const response = await activityLogsApi.getUserCredits(userId, { limit: 100 });
    setCreditTransactions(response.transactions);
  };

  const loadFeatureUsage = async () => {
    const response = await activityLogsApi.getUserFeatures(userId, { days: filter.days });
    setFeatureUsage(response.usage);
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-US');

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6">
      <PageHeader
        icon="activity.svg"
        title={`Activity - ${user?.name || user?.email || userId}`}
        subtitle="Activity details and credit usage"
        actions={
          <Button variant="ghost" onClick={() => navigate(`/users/${userId}`)}>
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" /> Back
          </Button>
        }
      />

      {/* Quick Info */}
      <div className="flex gap-6 mt-4 text-sm">
        <div><span className="text-muted">Email:</span> <span className="text-primary font-medium">{user?.email}</span></div>
        <div><span className="text-muted">Credits:</span> <span className="text-primary font-medium">{user?.credits?.balance?.toFixed(2) || 0}</span></div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="logs" className="gap-1.5">
            <img src="/icon/list.svg" alt="" className="w-4 h-4" /> Logs
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5">
            <img src="/icon/pie-chart.svg" alt="" className="w-4 h-4" /> Summary
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-1.5">
            <img src="/icon/credit-card.svg" alt="" className="w-4 h-4" /> Credits
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5">
            <img src="/icon/bar-chart-2.svg" alt="" className="w-4 h-4" /> Features
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      {activeTab === 'logs' && (
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <Select
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            options={[
              { value: 'all', label: 'All Types' },
              ...Object.entries(ACTIVITY_CONFIG).map(([key, config]) => ({ value: key, label: config.label }))
            ]}
            className="w-44"
          />
          <Input type="date" value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})} containerClassName="w-36" />
          <Input type="date" value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})} containerClassName="w-36" />
          <Button variant="secondary" onClick={() => loadActivityLogs()}>
            <img src="/icon/filter.svg" alt="" className="w-4 h-4 icon-dark" /> Filter
          </Button>
        </div>
      )}

      {(activeTab === 'summary' || activeTab === 'features') && (
        <div className="mt-4">
          <Select
            value={String(filter.days)}
            onChange={(e) => setFilter({...filter, days: parseInt(e.target.value)})}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' }
            ]}
            className="w-36"
          />
        </div>
      )}

      {/* Content */}
      {logsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-surface-secondary border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <Card className="mt-4 overflow-hidden">
              {logs.length === 0 ? (
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
                            <img src={`/icon/${config.icon}`} alt="" className="w-5 h-5 icon-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-primary">{config.label}</span>
                              <span className="text-xs text-muted">{formatTimestamp(log.timestamp)}</span>
                            </div>
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
                            {log.error && <div className="text-xs text-destructive mt-1">{log.error}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {pagination.hasMore && (
                    <div className="p-4 border-t border-border">
                      <Button variant="secondary" className="w-full" onClick={() => loadActivityLogs(true)}>Load More</Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && summary && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 text-center">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-surface-secondary flex items-center justify-center mb-3">
                    <img src="/icon/activity.svg" alt="" className="w-6 h-6 icon-dark" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{summary.totalActivities}</div>
                  <div className="text-xs text-muted mt-1">Total Activities</div>
                </Card>
                <Card className="p-5 text-center">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-surface-secondary flex items-center justify-center mb-3">
                    <img src="/icon/credit-card.svg" alt="" className="w-6 h-6 icon-dark" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{summary.totalCreditsUsed.toFixed(2)}</div>
                  <div className="text-xs text-muted mt-1">Credits Used</div>
                </Card>
                <Card className="p-5 text-center">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-surface-secondary flex items-center justify-center mb-3">
                    <img src="/icon/trending-up.svg" alt="" className="w-6 h-6 icon-dark" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{summary.averageDaily.toFixed(1)}</div>
                  <div className="text-xs text-muted mt-1">Average/day</div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Top Features</h3>
                <div className="space-y-3">
                  {summary.mostUsedFeatures.map((item, index) => {
                    const config = getActivityConfig(item.type);
                    return (
                      <div key={item.type} className="flex items-center gap-3">
                        <span className="text-xs text-muted w-6">#{index + 1}</span>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.color)}>
                          <img src={`/icon/${config.icon}`} alt="" className="w-4 h-4 icon-white" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{config.label}</span>
                        <span className="text-sm text-muted">{item.count} times</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Daily Activity</h3>
                <div className="flex items-end gap-1 h-32">
                  {summary.byDate.map(day => {
                    const max = Math.max(...summary.byDate.map(d => d.activities));
                    const height = Math.max(5, (day.activities / max) * 100);
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary rounded-t transition-all" style={{ height: `${height}%` }} title={`${day.date}: ${day.activities}`} />
                        <span className="text-xxs text-muted">{day.date.slice(-5)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Credits Tab */}
          {activeTab === 'credits' && (
            <Card className="mt-4 overflow-hidden">
              {creditTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <img src="/icon/inbox.svg" alt="" className="w-12 h-12 icon-gray mb-4" />
                  <p className="text-sm text-muted">No transactions</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-surface-secondary">
                        <th className="p-3 text-left text-xs font-medium text-muted uppercase">Time</th>
                        <th className="p-3 text-left text-xs font-medium text-muted uppercase">Type</th>
                        <th className="p-3 text-left text-xs font-medium text-muted uppercase">Amount</th>
                        <th className="p-3 text-left text-xs font-medium text-muted uppercase">Feature</th>
                        <th className="p-3 text-left text-xs font-medium text-muted uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditTransactions.map(tx => (
                        <tr key={tx.id} className="border-b border-border hover:bg-surface-secondary">
                          <td className="p-3 text-sm text-muted">{formatTimestamp(tx.timestamp)}</td>
                          <td className="p-3">
                            <span className={cn("text-xs px-2 py-1 rounded", tx.type === 'addition' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                              {tx.type === 'addition' ? 'Add' : 'Deduct'}
                            </span>
                          </td>
                          <td className={cn("p-3 text-sm font-medium", tx.amount >= 0 ? "text-success" : "text-destructive")}>
                            {tx.amount >= 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-sm text-muted">{tx.feature || tx.source || '-'}</td>
                          <td className="p-3 text-sm text-primary">{tx.balanceAfter?.toFixed(2) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && featureUsage && (
            <div className="mt-4 space-y-6">
              <Card className="p-5">
                <div className="text-center">
                  <div className="text-xs text-muted mb-1">Total Cost</div>
                  <div className="text-2xl font-bold text-primary">{featureUsage.totalCost} credits</div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Feature Breakdown</h3>
                <div className="space-y-4">
                  {featureUsage.featureBreakdown.map(item => {
                    const config = getActivityConfig(item.feature);
                    const maxCost = Math.max(...featureUsage.featureBreakdown.map(f => f.cost));
                    return (
                      <div key={item.feature}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.color)}>
                              <img src={`/icon/${config.icon}`} alt="" className="w-4 h-4 icon-white" />
                            </div>
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted mr-3">{item.count} times</span>
                            <span className="text-sm font-medium">{item.cost} cr</span>
                          </div>
                        </div>
                        <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", config.color)} style={{ width: `${(item.cost / maxCost) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Daily Usage</h3>
                <div className="space-y-2">
                  {featureUsage.dailyUsage.map(day => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex gap-4 text-sm text-muted">
                        <span>{day.count} times</span>
                        <span className="font-medium text-primary">{day.cost} cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
