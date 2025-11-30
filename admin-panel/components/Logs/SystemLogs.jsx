import { useState, useEffect } from 'react';
import { useRealtime } from '../../contexts/RealtimeContext';
import { logsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';

export default function SystemLogs() {
  const { systemLogs: logs, loading: realtimeLoading, loadLogs, setActiveTab } = useRealtime();
  const [filter, setFilter] = useState('all');
  const notify = useNotify();

  useEffect(() => {
    setActiveTab('logs');
    handleLoadLogs();
  }, [filter]);

  const handleLoadLogs = async () => {
    try {
      const params = filter !== 'all' ? { level: filter } : {};
      await loadLogs(params);
    } catch (err) {
      notify.error('Unable to load logs');
    }
  };

  const handleClearLogs = async () => {
    const confirmed = await notify.confirm({
      title: 'Clear all logs',
      message: 'Are you sure you want to clear all logs? This action cannot be undone.',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await logsApi.clear();
      await loadLogs({}, true);
      notify.success('All logs cleared!');
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const getLevelIcon = (level) => {
    const icons = { info: 'info.svg', success: 'check-circle.svg', warning: 'alert-triangle.svg', error: 'x-circle.svg' };
    return icons[level] || icons.info;
  };

  const getLevelColor = (level) => {
    const colors = { info: 'text-info', success: 'text-success', warning: 'text-warning', error: 'text-destructive' };
    return colors[level] || 'text-muted';
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-US');

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  return (
    <div className="p-6">
      <PageHeader
        icon="file-text.svg"
        title="System Logs"
        subtitle="Monitor system activities and events"
        actions={
          <Button variant="destructive" size="sm" onClick={handleClearLogs}>
            <img src="/icon/trash-2.svg" alt="" className="w-4 h-4 icon-white" />
            Clear all logs
          </Button>
        }
      />

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="info" className="gap-1.5">
            <img src="/icon/info.svg" alt="" className="w-3.5 h-3.5" /> Info
          </TabsTrigger>
          <TabsTrigger value="success" className="gap-1.5">
            <img src="/icon/check-circle.svg" alt="" className="w-3.5 h-3.5" /> Success
          </TabsTrigger>
          <TabsTrigger value="warning" className="gap-1.5">
            <img src="/icon/alert-triangle.svg" alt="" className="w-3.5 h-3.5" /> Warning
          </TabsTrigger>
          <TabsTrigger value="error" className="gap-1.5">
            <img src="/icon/x-circle.svg" alt="" className="w-3.5 h-3.5" /> Error
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Logs List */}
      <Card className={cn("mt-4 overflow-hidden transition-opacity duration-200", realtimeLoading.logs && "opacity-60")}>
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src="/icon/inbox.svg" alt="" className="w-12 h-12 icon-gray mb-4" />
            <p className="text-sm text-muted">No logs</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-secondary transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <img src={`/icon/${getLevelIcon(log.level)}`} alt={log.level} className="w-5 h-5 icon-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-primary">{log.message}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span className={cn("font-semibold uppercase", getLevelColor(log.level))}>
                      {log.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <img src="/icon/user.svg" alt="" className="w-3 h-3" />
                      {log.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <img src="/icon/globe.svg" alt="" className="w-3 h-3" />
                      {log.ip}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted shrink-0">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
