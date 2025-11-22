import { useState, useEffect } from 'react';
import { logsApi } from '../../../services/adminApi';
import { useNotify } from '../../Common/NotificationProvider';
import './SystemLogs.css';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { level: filter } : {};
      const response = await logsApi.getAll(params);
      setLogs(response.logs || []);
    } catch (err) {
      console.error('Load logs error:', err);
      notify.error('Không thể tải logs');
      // Fallback to mock data
      const mockLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        action: 'user_login',
        message: 'User logged in successfully',
        user: 'user@example.com',
        ip: '192.168.1.1'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'warning',
        action: 'failed_login',
        message: 'Failed login attempt',
        user: 'unknown@example.com',
        ip: '192.168.1.2'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'error',
        action: 'api_error',
        message: 'API request failed: timeout',
        user: 'system',
        ip: 'internal'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'info',
        action: 'profile_created',
        message: 'New profile created',
        user: 'user2@example.com',
        ip: '192.168.1.3'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        level: 'success',
        action: 'backup_completed',
        message: 'System backup completed successfully',
        user: 'system',
        ip: 'internal'
      }
    ];
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    const confirmed = await notify.confirm({
      title: 'Xóa tất cả logs',
      message: 'Bạn có chắc muốn xóa tất cả logs? Hành động này không thể hoàn tác.',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await logsApi.clear();
      setLogs([]);
      notify.success('Đã xóa tất cả logs!');
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
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

  const getLevelColor = (level) => {
    // All levels use white/black only
    return '#fff';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  return (
    <div className="system-logs">
      <div className="logs-header">
        <div className="header-title">
          <img src="/icon/file-text.svg" alt="Logs" />
          <div>
            <h1>System Logs</h1>
            <p>Theo dõi hoạt động và sự kiện hệ thống</p>
          </div>
        </div>

        <div className="logs-actions">
          <button className="btn-refresh" onClick={loadLogs}>
            <img src="/icon/refresh-cw.svg" alt="Refresh" />
            Refresh
          </button>
          <button className="btn-clear" onClick={handleClearLogs}>
            <img src="/icon/trash-2.svg" alt="Clear" />
            Clear Logs
          </button>
        </div>
      </div>

      <div className="logs-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={filter === 'info' ? 'active' : ''}
          onClick={() => setFilter('info')}
        >
          <img src="/icon/info.svg" alt="Info" />
          Info
        </button>
        <button 
          className={filter === 'success' ? 'active' : ''}
          onClick={() => setFilter('success')}
        >
          <img src="/icon/check-circle.svg" alt="Success" />
          Success
        </button>
        <button 
          className={filter === 'warning' ? 'active' : ''}
          onClick={() => setFilter('warning')}
        >
          <img src="/icon/alert-triangle.svg" alt="Warning" />
          Warning
        </button>
        <button 
          className={filter === 'error' ? 'active' : ''}
          onClick={() => setFilter('error')}
        >
          <img src="/icon/x-circle.svg" alt="Error" />
          Error
        </button>
      </div>

      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <img src="/icon/inbox.svg" alt="Empty" />
            <p>Không có logs</p>
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map(log => (
              <div key={log.id} className="log-item">
                <div className="log-icon" style={{ background: getLevelColor(log.level) }}>
                  <img src={`/icon/${getLevelIcon(log.level)}`} alt={log.level} />
                </div>
                
                <div className="log-content">
                  <div className="log-header">
                    <span className="log-action">{log.action}</span>
                    <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <div className="log-message">{log.message}</div>
                  <div className="log-meta">
                    <span>
                      <img src="/icon/user.svg" alt="User" />
                      {log.user}
                    </span>
                    <span>
                      <img src="/icon/globe.svg" alt="IP" />
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
