import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activityLogsApi, usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import './UserActivityLogs.css';

// Activity type labels and icons
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
  credit_deduct: { label: 'Deduct Credits', icon: 'minus-circle.svg', color: '#f44336' },
  credit_bonus: { label: 'Bonus Credits', icon: 'gift.svg', color: '#ff9800' },
  account_update: { label: 'Update Account', icon: 'settings.svg', color: '#9e9e9e' },
  account_locked: { label: 'Lock Account', icon: 'lock.svg', color: '#f44336' },
  account_unlocked: { label: 'Unlock Account', icon: 'unlock.svg', color: '#4caf50' }
};

const getActivityConfig = (type) => {
  return ACTIVITY_CONFIG[type] || { label: type, icon: 'activity.svg', color: '#666' };
};

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
  const [filter, setFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    days: 30
  });
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 50,
    hasMore: false
  });

  // Load user info
  useEffect(() => {
    loadUserInfo();
  }, [userId]);

  // Load data when tab or filter changes
  useEffect(() => {
    if (user) {
      loadTabData();
    }
  }, [activeTab, filter, user]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(userId);
      setUser(response.user);
    } catch (err) {
      notify.error('Unable to load user info: ' + err.message);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    setLogsLoading(true);
    try {
      switch (activeTab) {
        case 'logs':
          await loadActivityLogs();
          break;
        case 'summary':
          await loadSummary();
          break;
        case 'credits':
          await loadCreditTransactions();
          break;
        case 'features':
          await loadFeatureUsage();
          break;
      }
    } catch (err) {
      notify.error('Error loading data: ' + err.message);
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

  const loadMore = () => {
    loadActivityLogs(true);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US');
  };

  const formatCredits = (credits) => {
    if (credits === undefined || credits === null) return '-';
    return credits >= 0 ? `+${credits.toFixed(2)}` : credits.toFixed(2);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="user-activity-logs">
      <PageHeader
        icon="activity.svg"
        title={`Activity Logs - ${user?.name || user?.email || userId}`}
        subtitle="Activity details and credit usage"
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
          <span className="label">Credits:</span>
          <span className="value">{user?.credits?.balance?.toFixed(2) || 0}</span>
        </div>
        <div className="info-item">
          <span className="label">Tier:</span>
          <span className={`tier-badge ${user?.tier}`}>{user?.tier || 'free'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="activity-tabs">
        <button 
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          <img src="/icon/list.svg" alt="Logs" />
          Activity Logs
        </button>
        <button 
          className={activeTab === 'summary' ? 'active' : ''}
          onClick={() => setActiveTab('summary')}
        >
          <img src="/icon/pie-chart.svg" alt="Summary" />
          Total quan
        </button>
        <button 
          className={activeTab === 'credits' ? 'active' : ''}
          onClick={() => setActiveTab('credits')}
        >
          <img src="/icon/credit-card.svg" alt="Credits" />
          Credit Transactions
        </button>
        <button 
          className={activeTab === 'features' ? 'active' : ''}
          onClick={() => setActiveTab('features')}
        >
          <img src="/icon/bar-chart-2.svg" alt="Features" />
          Feature Usage
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'logs' && (
        <div className="activity-filters">
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
            type="date" 
            value={filter.startDate}
            onChange={(e) => setFilter({...filter, startDate: e.target.value})}
            placeholder="From Date"
          />
          <input 
            type="date" 
            value={filter.endDate}
            onChange={(e) => setFilter({...filter, endDate: e.target.value})}
            placeholder="To Date"
          />
          <button className="btn-filter" onClick={() => loadActivityLogs()}>
            <img src="/icon/filter.svg" alt="Filter" />
            Filter
          </button>
        </div>
      )}

      {(activeTab === 'summary' || activeTab === 'features') && (
        <div className="activity-filters">
          <select 
            value={filter.days} 
            onChange={(e) => setFilter({...filter, days: parseInt(e.target.value)})}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="activity-content">
        {logsLoading ? (
          <div className="loading-small">Loading...</div>
        ) : (
          <>
            {/* Activity Logs Tab */}
            {activeTab === 'logs' && (
              <div className="logs-list">
                {logs.length === 0 ? (
                  <div className="empty-state">
                    <img src="/icon/inbox.svg" alt="Empty" />
                    <p>No activity logs</p>
                  </div>
                ) : (
                  <>
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
                            <div className="log-details">
                              {log.creditsUsed !== undefined && (
                                <span className={`credits ${log.creditsUsed > 0 ? 'deduct' : 'add'}`}>
                                  {log.creditsUsed > 0 ? `-${log.creditsUsed.toFixed(2)}` : `+${Math.abs(log.creditsUsed).toFixed(2)}`} credits
                                </span>
                              )}
                              {log.feature && <span className="feature">{log.feature}</span>}
                              {log.model && <span className="model">{log.model}</span>}
                              {log.wordCount && <span className="word-count">{log.wordCount} words</span>}
                              {log.profileName && <span className="profile">{log.profileName}</span>}
                              {log.duration && <span className="duration">{log.duration}ms</span>}
                            </div>
                            {log.error && <div className="log-error">{log.error}</div>}
                          </div>
                        </div>
                      );
                    })}
                    {pagination.hasMore && (
                      <button className="btn-load-more" onClick={loadMore}>
                        Load More
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && summary && (
              <div className="summary-content">
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="card-icon">
                      <img src="/icon/activity.svg" alt="Activities" />
                    </div>
                    <div className="card-value">{summary.totalActivities}</div>
                    <div className="card-label">Total Activities</div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon">
                      <img src="/icon/credit-card.svg" alt="Credits" />
                    </div>
                    <div className="card-value">{summary.totalCreditsUsed.toFixed(2)}</div>
                    <div className="card-label">Credits Used</div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon">
                      <img src="/icon/trending-up.svg" alt="Average" />
                    </div>
                    <div className="card-value">{summary.averageDaily.toFixed(1)}</div>
                    <div className="card-label">Average/day</div>
                  </div>
                </div>

                <div className="summary-section">
                  <h3>Top Features Used</h3>
                  <div className="feature-list">
                    {summary.mostUsedFeatures.map((item, index) => {
                      const config = getActivityConfig(item.type);
                      return (
                        <div key={item.type} className="feature-item">
                          <span className="rank">#{index + 1}</span>
                          <div className="feature-icon" style={{ background: config.color }}>
                            <img src={`/icon/${config.icon}`} alt={item.type} />
                          </div>
                          <span className="feature-name">{config.label}</span>
                          <span className="feature-count">{item.count} times</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="summary-section">
                  <h3>Activities by Day</h3>
                  <div className="daily-chart">
                    {summary.byDate.map(day => (
                      <div key={day.date} className="day-bar">
                        <div 
                          className="bar" 
                          style={{ 
                            height: `${Math.min(100, (day.activities / Math.max(...summary.byDate.map(d => d.activities))) * 100)}%` 
                          }}
                          title={`${day.date}: ${day.activities} activities, ${day.credits.toFixed(2)} credits`}
                        />
                        <span className="day-label">{day.date.slice(-5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Credit Transactions Tab */}
            {activeTab === 'credits' && (
              <div className="transactions-list">
                {creditTransactions.length === 0 ? (
                  <div className="empty-state">
                    <img src="/icon/inbox.svg" alt="Empty" />
                    <p>No credit transactions</p>
                  </div>
                ) : (
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Feature</th>
                        <th>Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditTransactions.map(tx => (
                        <tr key={tx.id}>
                          <td>{formatTimestamp(tx.timestamp)}</td>
                          <td>
                            <span className={`tx-type ${tx.type}`}>
                              {tx.type === 'addition' ? 'Add' : 'Deduct'}
                            </span>
                          </td>
                          <td className={tx.amount >= 0 ? 'positive' : 'negative'}>
                            {formatCredits(tx.amount)}
                          </td>
                          <td>{tx.feature || tx.source || '-'}</td>
                          <td>{tx.balanceAfter?.toFixed(2) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Feature Usage Tab */}
            {activeTab === 'features' && featureUsage && (
              <div className="feature-usage-content">
                <div className="usage-summary">
                  <div className="usage-card">
                    <span className="label">Total Cost</span>
                    <span className="value">{featureUsage.totalCost} credits</span>
                  </div>
                </div>

                <div className="usage-section">
                  <h3>Details by Feature</h3>
                  <div className="feature-breakdown">
                    {featureUsage.featureBreakdown.map(item => {
                      const config = getActivityConfig(item.feature);
                      const maxCost = Math.max(...featureUsage.featureBreakdown.map(f => f.cost));
                      return (
                        <div key={item.feature} className="breakdown-item">
                          <div className="breakdown-info">
                            <div className="feature-icon" style={{ background: config.color }}>
                              <img src={`/icon/${config.icon}`} alt={item.feature} />
                            </div>
                            <span className="feature-name">{config.label}</span>
                          </div>
                          <div className="breakdown-stats">
                            <span className="count">{item.count} times</span>
                            <span className="cost">{item.cost} credits</span>
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="bar-fill" 
                              style={{ 
                                width: `${(item.cost / maxCost) * 100}%`,
                                background: config.color 
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="usage-section">
                  <h3>Usage by Day</h3>
                  <div className="daily-usage">
                    {featureUsage.dailyUsage.map(day => (
                      <div key={day.date} className="daily-item">
                        <span className="date">{day.date}</span>
                        <span className="count">{day.count} times</span>
                        <span className="cost">{day.cost} credits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
