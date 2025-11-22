import { useState, useEffect } from 'react';
import { logsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import './SystemLogs.css';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const notify = useNotify();

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      const params = filter !== 'all' ? { level: filter } : {};
      const response = await logsApi.getAll(params);
      setLogs(response.logs || []);
    } catch (err) {
      notify.error('Unable to load logs');
      setLogs([]);
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
      setLogs([]);
      notify.success('All logs cleared!');
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const getLevelIcon = (level) => {
    const icons = {
      info: 'info.svg',
      success: 'check-circle.svg',
      warning: 'alert-triangle.svg',
      error: 'x-circle.svg'
    };
    return icons[level] || icons.info;
  };

  const getLevelColor = () => {
    return '#fff';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  return (
    <div className="system-logs">
      <PageHeader
        icon="file-text.svg"
        title="System Logs"
        subtitle="Monitor system activities and events"
        actions={
          <button className="btn-clear" onClick={handleClearLogs}>
            <img src="/admin/icon/trash-2.svg" alt="Clear" />
            Clear all logs
          </button>
        }
      />

      <div className="logs-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'info' ? 'active' : ''}
          onClick={() => setFilter('info')}
        >
          <img src="/admin/icon/info.svg" alt="Info" />
          Info
        </button>
        <button 
          className={filter === 'success' ? 'active' : ''}
          onClick={() => setFilter('success')}
        >
          <img src="/admin/icon/check-circle.svg" alt="Success" />
          Success
        </button>
        <button 
          className={filter === 'warning' ? 'active' : ''}
          onClick={() => setFilter('warning')}
        >
          <img src="/admin/icon/alert-triangle.svg" alt="Warning" />
          Warning
        </button>
        <button 
          className={filter === 'error' ? 'active' : ''}
          onClick={() => setFilter('error')}
        >
          <img src="/admin/icon/x-circle.svg" alt="Error" />
          Error
        </button>
      </div>

      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <img src="/admin/icon/inbox.svg" alt="Empty" />
            <p>No logs</p>
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map(log => (
              <div key={log.id} className="log-item">
                <div className="log-icon" style={{ background: getLevelColor(log.level) }}>
                  <img src={`/admin/icon/${getLevelIcon(log.level)}`} alt={log.level} />
                </div>
                
                <div className="log-content">
                  <div className="log-header">
                    <span className="log-action">{log.action}</span>
                    <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <div className="log-message">{log.message}</div>
                  <div className="log-meta">
                    <span>
                      <img src="/admin/icon/user.svg" alt="User" />
                      {log.user}
                    </span>
                    <span>
                      <img src="/admin/icon/globe.svg" alt="IP" />
                      {log.ip}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
