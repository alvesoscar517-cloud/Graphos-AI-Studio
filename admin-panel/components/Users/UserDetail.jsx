import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import './UserDetail.css';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'info',
    priority: 'medium',
    translations: { vi: '', en: '' }
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(id);
      setUser(response.user);
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await usersApi.getLogs(id, { limit: 100 });
      setLogs(response.logs);
      setShowLogs(true);
    } catch (err) {
      notify.error('Error loading logs: ' + err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLockUser = async () => {
    const confirmed = await notify.confirm({
      title: user.locked ? 'Unlock Account' : 'Lock Account',
      message: `Are you sure you want to ${user.locked ? 'unlock' : 'lock'} this account?`,
      confirmText: user.locked ? 'Unlock' : 'Lock',
      type: 'warning'
    });

    if (!confirmed) return;

    let reason = null;
    if (!user.locked) {
      reason = await notify.prompt({
        title: 'Reason for locking account',
        message: 'Please enter the reason for locking this account:',
        placeholder: 'E.g., Terms of service violation',
        confirmText: 'Lock'
      });
      if (!reason) return;
    }

    try {
      await usersApi.toggleLock(id, !user.locked, reason);
      notify.success(`Account ${user.locked ? 'unlocked' : 'locked'} successfully!`);
      loadUser();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = await notify.confirm({
      title: 'Delete User',
      message: '⚠️ ARE YOU SURE YOU WANT TO DELETE THIS USER?\n\nThis action cannot be undone!',
      confirmText: 'Continue',
      type: 'danger'
    });

    if (!confirmed) return;

    const confirmation = await notify.prompt({
      title: 'Confirm Deletion',
      message: 'Type "DELETE" to confirm user deletion:',
      placeholder: 'DELETE',
      confirmText: 'Delete'
    });

    if (confirmation !== 'DELETE') {
      notify.warning('Incorrect confirmation. Action cancelled.');
      return;
    }

    try {
      await usersApi.delete(id);
      notify.success('User deleted successfully!');
      navigate('/users');
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationData.translations.vi || !notificationData.translations.en) {
      notify.warning('Please enter notification content in both Vietnamese and English!');
      return;
    }

    try {
      await usersApi.sendNotification(id, notificationData);
      notify.success('Notification sent successfully!');
      setShowNotificationModal(false);
      setNotificationData({
        type: 'info',
        priority: 'medium',
        translations: { vi: '', en: '' }
      });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getLogIcon = (type) => {
    const icons = {
      'account_status': 'shield.svg',
      'notification': 'bell.svg',
      'profile': 'folder.svg',
      'analysis': 'search.svg',
      'rewrite': 'edit.svg',
      'login': 'log-in.svg',
      'logout': 'log-out.svg'
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
      'logout': '#607d8b'
    };
    return colors[type] || '#666';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="user-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/users')}>
          <img src="/admin/icon/arrow-left.svg" alt="Back" />
          Back
        </button>
        <div className="header-title">
          <img src="/admin/icon/user.svg" alt="User" />
          <h1>User Details</h1>
        </div>
      </div>

      <div className="detail-grid">
        {/* User Info Card */}
        <div className="detail-card">
          <h2>Basic Information</h2>
          <div className="user-avatar-large">
            {user.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{user.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value user-id">{user.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tier:</span>
              <span className={`tier-badge ${user.tier}`}>
                <img src={`/admin/icon/${user.tier === 'premium' ? 'star' : 'circle'}.svg`} alt={user.tier} />
                {user.tier === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Usage Stats Card */}
        <div className="detail-card">
          <h2>
            <img src="/admin/icon/chart-bar.svg" alt="Stats" />
            Usage Statistics
          </h2>
          <div className="stats-grid">
            <div className="stat-box">
              <img src="/admin/icon/folder.svg" alt="Profiles" className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{user.usage?.profilesCount || 0}</div>
                <div className="stat-label">Profiles</div>
              </div>
            </div>
            <div className="stat-box">
              <img src="/admin/icon/search.svg" alt="Analyses" className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{user.usage?.analysesCount || 0}</div>
                <div className="stat-label">Analyses</div>
              </div>
            </div>
            <div className="stat-box">
              <img src="/admin/icon/edit.svg" alt="Rewrites" className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{user.usage?.rewritesCount || 0}</div>
                <div className="stat-label">Rewrites</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Card */}
        <div className="detail-card full-width">
          <h2>
            <img src="/admin/icon/folder.svg" alt="Profiles" />
            Writing Profiles ({user.profiles?.length || 0})
          </h2>
          {user.profiles && user.profiles.length > 0 ? (
            <div className="profiles-list">
              {user.profiles.map(profile => (
                <div key={profile.id} className="profile-item">
                  <img src="/admin/icon/file-text.svg" alt="Profile" className="profile-icon" />
                  <div className="profile-info">
                    <div className="profile-name">{profile.name}</div>
                    <div className="profile-meta">
                      <span className={`status-badge ${profile.status}`}>
                        <img src={`/admin/icon/${profile.status === 'ready' ? 'check-circle' : 'clock'}.svg`} alt="Status" />
                        {profile.status === 'ready' ? 'Ready' : 'Processing'}
                      </span>
                      <span className="profile-samples">
                        {profile.samplesCount} samples
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <img src="/admin/icon/inbox.svg" alt="Empty" />
              <p>User has not created any profiles yet</p>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="detail-card full-width">
          <h2>
            <img src="/admin/icon/zap.svg" alt="Actions" />
            Actions
          </h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setShowNotificationModal(true)}>
              <img src="/admin/icon/bell.svg" alt="Notification" className="action-icon" />
              <span className="action-label">Send notification</span>
            </button>
            <button className="action-btn" onClick={loadLogs}>
              <img src="/admin/icon/activity.svg" alt="Logs" className="action-icon" />
              <span className="action-label">View logs</span>
            </button>
            <button className="action-btn" onClick={handleLockUser}>
              <img src={`/admin/icon/${user.locked ? 'unlock' : 'lock'}.svg`} alt="Lock" className="action-icon" />
              <span className="action-label">{user.locked ? 'Unlock' : 'Lock'} account</span>
            </button>
            <button className="action-btn danger" onClick={handleDeleteUser}>
              <img src="/admin/icon/trash-2.svg" alt="Delete" className="action-icon" />
              <span className="action-label">Delete user</span>
            </button>
          </div>
        </div>

        {/* Logs Card */}
        {showLogs && (
          <div className="detail-card full-width">
            <div className="card-header-with-action">
              <h2>
                <img src="/admin/icon/activity.svg" alt="Logs" />
                Activity Logs ({logs.length})
              </h2>
              <button className="btn-close" onClick={() => setShowLogs(false)}>
                <img src="/admin/icon/x.svg" alt="Close" />
              </button>
            </div>
            {logsLoading ? (
              <div className="loading-small">Loading logs...</div>
            ) : logs.length > 0 ? (
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log.id} className="log-item">
                    <div className="log-icon" style={{ background: getLogColor(log.type) }}>
                      <img src={`/admin/icon/${getLogIcon(log.type)}`} alt={log.type} />
                    </div>
                    <div className="log-content">
                      <div className="log-header">
                        <span className="log-type">{log.type}</span>
                        <span className="log-action">{log.action}</span>
                      </div>
                      {log.reason && <div className="log-reason">Reason: {log.reason}</div>}
                      <div className="log-time">
                        {new Date(log.timestamp).toLocaleString('en-US')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <img src="/admin/icon/inbox.svg" alt="Empty" />
                <p>No activities yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send notification to user</h2>
              <button className="btn-close" onClick={() => setShowNotificationModal(false)}>
                <img src="/admin/icon/x.svg" alt="Close" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Notification type</label>
                <select 
                  value={notificationData.type}
                  onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={notificationData.priority}
                  onChange={(e) => setNotificationData({...notificationData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Content (Vietnamese)</label>
                <textarea
                  value={notificationData.translations.vi}
                  onChange={(e) => setNotificationData({
                    ...notificationData,
                    translations: {...notificationData.translations, vi: e.target.value}
                  })}
                  placeholder="Enter notification content in Vietnamese..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Content (English)</label>
                <textarea
                  value={notificationData.translations.en}
                  onChange={(e) => setNotificationData({
                    ...notificationData,
                    translations: {...notificationData.translations, en: e.target.value}
                  })}
                  placeholder="Enter notification content in English..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNotificationModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSendNotification}>
                <img src="/admin/icon/send.svg" alt="Send" />
                Send notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
