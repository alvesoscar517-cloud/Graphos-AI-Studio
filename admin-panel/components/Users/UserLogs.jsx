import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';

const LOG_CONFIG = {
  account_status: { icon: 'shield.svg', color: 'bg-destructive' },
  notification: { icon: 'bell.svg', color: 'bg-info' },
  profile: { icon: 'folder.svg', color: 'bg-success' },
  analysis: { icon: 'search.svg', color: 'bg-warning' },
  rewrite: { icon: 'edit.svg', color: 'bg-purple-500' },
  login: { icon: 'log-in.svg', color: 'bg-cyan-500' },
  logout: { icon: 'log-out.svg', color: 'bg-muted' },
  credits: { icon: 'dollar-sign.svg', color: 'bg-amber-500' }
};

const getLogConfig = (type) => LOG_CONFIG[type] || { icon: 'activity.svg', color: 'bg-muted' };

export default function UserLogs() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userResponse, logsResponse] = await Promise.all([
        usersApi.getById(userId),
        usersApi.getLogs(userId, { limit: 100 })
      ]);
      setUser(userResponse.user);
      setLogs(logsResponse.logs);
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate(`/users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);
  const logTypes = ['all', ...new Set(logs.map(log => log.type))];

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6">
      <PageHeader
        icon="activity.svg"
        title={`Activity - ${user?.name || user?.email || userId}`}
        subtitle="User activity history"
        actions={
          <Button variant="ghost" onClick={() => navigate(`/users/${userId}`)}>
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" /> Back
          </Button>
        }
      />

      {/* Quick Info */}
      <div className="flex gap-6 mt-4 text-sm">
        <div><span className="text-muted">Email:</span> <span className="text-primary font-medium">{user?.email}</span></div>
        <div><span className="text-muted">Total:</span> <span className="text-primary font-medium">{filteredLogs.length} logs</span></div>
      </div>

      {/* Filters */}
      {logs.length > 0 && (
        <Tabs value={filter} onValueChange={setFilter} className="mt-6">
          <TabsList>
            {logTypes.map(type => (
              <TabsTrigger key={type} value={type}>
                {type === 'all' ? 'All' : type.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Logs */}
      {filteredLogs.length > 0 ? (
        <Card className="mt-4 overflow-hidden">
          <div className="divide-y divide-border">
            {filteredLogs.map(log => {
              const config = getLogConfig(log.type);
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-secondary transition-colors">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                    <img src={`/icon/${config.icon}`} alt="" className="w-5 h-5 icon-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary capitalize">{log.type.replace('_', ' ')}</span>
                      <span className="text-xs text-muted">{log.action}</span>
                    </div>
                    {log.reason && (
                      <div className="flex items-center gap-1 text-xs text-muted mb-1">
                        <img src="/icon/info.svg" alt="" className="w-3 h-3" />
                        {log.reason}
                      </div>
                    )}
                    {log.details && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(log.details).map(([key, value]) => (
                          <span key={key} className="text-xs px-2 py-0.5 bg-surface-secondary rounded">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted mt-2">
                      <img src="/icon/clock.svg" alt="" className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 mt-6 bg-surface rounded-xl border border-border">
          <img src="/icon/inbox.svg" alt="" className="w-12 h-12 icon-gray mb-4" />
          <h3 className="font-semibold text-primary mb-1">No logs found</h3>
          <p className="text-sm text-muted">
            {filter === 'all' ? "No activity logs yet" : `No ${filter} logs`}
          </p>
        </div>
      )}
    </div>
  );
}
