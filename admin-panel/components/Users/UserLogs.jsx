import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import CustomSelect from '../Common/CustomSelect';
import './UserLogs.css';

const getLogIcon = (type) => {
  const icons = {
    'account_status': 'shield.svg',
    'notification': 'bell.svg',
    'profile': 'folder.svg',
    'analysis': 'search.svg',
    'rewrite': 'edit.svg',
    'login': 'log-in.svg',
    'logout': 'log-out.svg',
    'credits': 'dollar-sign.svg'
  };
  return icons[type] || 'activity.svg';
};

const getLogColor = (type) => {
  const colors = {
    'account_status': '#f44336',
    'notification': '#2196f3',
    'profile': '#4caf50',
    'analysis': '#ff9800',
    'rewrite': '#9c27b0',
    'login': '#00bcd4',
    'logout': '#607d8b',
    'credits': '#ffc107'
  };
  return colors[type] || '#666';
};

export default function UserLogs() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [userId]);

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
      notify.error('Error loading data: ' + err.message);
      navigate(`/users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const logTypes = ['all', ...new Set(logs.map(log => log.type))];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="user-logs-page">
      <PageHeader
        icon="activity.svg"
        title={`Activity Logs - ${user?.name || user?.email || userId}`}
        subtitle="User activity history and logs"
        actions={
          <button className="btn-back" onClick={() => navigate(`/users/${userId}`)}>
            <img src="/icon/arrow-left.svg" alt="Back" />
            Back
          </button>
        }
      />

      {/* User Quick Info */}
      <div className="user-quick-info">
        <div className="info-item">
          <span className="label">Email:</span>
          <span className="value">{user?.email}</span>
        </div>
        <div className="info-item">
          <span className="label">Total Logs:</span>
          <span className="value">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Filters */}
      {logs.length > 0 && (
        <div className="logs-filters">
          {logTypes.map(type => (
            <button
              key={type}
              className={`filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Logs Content */}
      <div className="logs-content">
        {filteredLogs.length > 0 ? (
          <div className="logs-list">
            {filteredLogs.map(log => (
              <div key={log.id} className="log-card">
                <div 
                  className="log-card-icon" 
                  style={{ background: getLogColor(log.type) }}
                >
                  <img src={`/icon/${getLogIcon(log.type)}`} alt={log.type} />
                </div>
                
                <div className="log-card-content">
                  <div className="log-card-header">
                    <span className="log-card-type">{log.type}</span>
                    <span className="log-card-action">{log.action}</span>
                  </div>
                  
                  {log.reason && (
                    <div className="log-card-reason">
                      <img src="/icon/info.svg" alt="Reason" />
                      <span>{log.reason}</span>
                    </div>
                  )}
                  
                  {log.details && (
                    <div className="log-card-details">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key} className="log-detail-item">
                          <span className="log-detail-key">{key}:</span>
                          <span className="log-detail-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="log-card-time">
                    <img src="/icon/clock.svg" alt="Time" />
                    <span>{new Date(log.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <img src="/icon/inbox.svg" alt="Empty" />
            <h3>No activity logs found</h3>
            <p>
              {filter === 'all' 
                ? "This user doesn't have any activity logs yet"
                : `No logs found for type: ${filter}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
