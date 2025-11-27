import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityLogsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import './AllActivityLogs.css';

// Activity type config
const ACTIVITY_CONFIG = {
  login: { label: 'Login', icon: 'log-in.svg', color: '#4caf50' },
  logout: { label: 'Logout', icon: 'log-out.svg', color: '#607d8b' },
  profile_create: { label: 'Create Profile', icon: 'folder-plus.svg', color: '#2196f3' },
  profile_update: { label: 'Update Profile', icon: 'edit.svg', color: '#ff9800' },
  profile_delete: { label: 'Delete Profile', icon: 'trash-2.svg', color: '#f44336' },
  profile_sample_add: { label: 'Add Sample', icon: 'file-plus.svg', color: '#9c27b0' },
  profile_finalize: { label: 'Finalize Profile', icon: 'check-circle.svg', color: '#4caf50' },
  ai_detection: { label: 'AI Detection', icon: 'search.svg', color: '#ff5722' },
  text_analysis: { label: 'Text Analysis', icon: 'bar-chart.svg', color: '#3f51b5' },
  text_rewrite: { label: 'Text Rewrite', icon: 'edit-3.svg', color: '#e91e63' },
  humanize: { label: 'Humanize', icon: 'user.svg', color: '#00bcd4' },
  iterative_humanize: { label: 'Iterative Humanize', icon: 'repeat.svg', color: '#009688' },
  chat_message: { label: 'Chat', icon: 'message-circle.svg', color: '#673ab7' },
  chat_humanized: { label: 'Chat Humanized', icon: 'message-square.svg', color: '#795548' },
  conversation_summarize: { label: 'Conversation Summary', icon: 'file-text.svg', color: '#607d8b' },
  translation: { label: 'Translation', icon: 'globe.svg', color: '#03a9f4' },
  file_upload: { label: 'Upload File', icon: 'upload.svg', color: '#8bc34a' },
  credit_purchase: { label: 'Purchase Credits', icon: 'credit-card.svg', color: '#4caf50' },
  credit_deduct: { label: 'Deduct Credits', icon: 'minus-circle.svg', color: '#f44336' }
};

const getActivityConfig = (type) => {
  return ACTIVITY_CONFIG[type] || { label: type, icon: 'activity.svg', color: '#666' };
};

export default function AllActivityLogs() {
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [filter, setFilter] = useState({
    type: 'all',
    userId: '',
    startDate: '',
    endDate: ''
  });
  
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 50,
    hasMore: false
  });

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

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US');
  };

  return (
    <div className="all-activity-logs">
      <PageHeader
        icon="activity.svg"
        title="Activity Logs"
        subtitle="Track all user activities"
        actions={
          <button className="btn-cleanup" onClick={handleCleanup}>
            <img src="/icon/trash-2.svg" alt="Cleanup" />
            Clean Up Old Logs
          </button>
        }
      />

      {/* Stats Summary */}
      {!statsLoading && stats && (
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">
              <img src="/icon/activity.svg" alt="Activities" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalActivities.toLocaleString()}</div>
              <div className="stat-label">Activities (7 days)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <img src="/icon/credit-card.svg" alt="Credits" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalCreditsUsed.toFixed(1)}</div>
              <div className="stat-label">Credits Used</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <img src="/icon/users.svg" alt="Users" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.uniqueUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <select 
          value={filter.type} 
          onChange={(e) => setFilter({...filter, type: e.target.value})}
        >
          <option value="all">All Types</option>
          {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        
        <input 
          type="text"
          placeholder="User ID..."
          value={filter.userId}
          onChange={(e) => setFilter({...filter, userId: e.target.value})}
        />
        
        <input 
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({...filter, startDate: e.target.value})}
        />
        
        <input 
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({...filter, endDate: e.target.value})}
        />
        
        <button className="btn-filter" onClick={handleFilter}>
          <img src="/icon/filter.svg" alt="Filter" />
          Filter
        </button>
      </div>

      {/* Logs List */}
      <div className="logs-container">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <img src="/icon/inbox.svg" alt="Empty" />
            <p>No activity logs</p>
          </div>
        ) : (
          <>
            <div className="logs-list">
              {logs.map(log => {
                const config = getActivityConfig(log.type);
                return (
                  <div key={log.id} className="log-item">
                    <div className="log-icon" style={{ background: config.color }}>
                      <img src={`/icon/${config.icon}`} alt={log.type} />
                    </div>
                    <div className="log-content">
                      <div className="log-header">
                        <span className="log-type">{config.label}</span>
                        <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <div className="log-user">
                        <span 
                          className="user-id" 
                          onClick={() => navigate(`/users/${log.userId}/activity`)}
                          title="View Details user"
                        >
                          {log.userId.substring(0, 16)}...
                        </span>
                      </div>
                      <div className="log-details">
                        {log.creditsUsed !== undefined && (
                          <span className="credits">
                            {log.creditsUsed > 0 ? `-${log.creditsUsed.toFixed(2)}` : `+${Math.abs(log.creditsUsed).toFixed(2)}`} credits
                          </span>
                        )}
                        {log.feature && <span className="tag">{log.feature}</span>}
                        {log.model && <span className="tag">{log.model}</span>}
                        {log.wordCount && <span className="tag">{log.wordCount} words</span>}
                        {log.duration && <span className="tag">{log.duration}ms</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {pagination.hasMore && (
              <button className="btn-load-more" onClick={() => loadLogs(true)}>
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
