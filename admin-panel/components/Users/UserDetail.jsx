import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './UserDetail.css';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [creditsData, setCreditsData] = useState({ amount: 0, type: 'add', reason: '' });
  const [notificationData, setNotificationData] = useState({
    type: 'info',
    priority: 'medium',
    title: '',
    message: ''
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(id);
      setUser(response.user);
      setEditData({
        name: response.user.name || '',
        email: response.user.email || ''
      });
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };



  const handleEditUser = async () => {
    try {
      await usersApi.update(id, editData);
      notify.success('User updated successfully!');
      setShowEditModal(false);
      loadUser();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleAdjustCredits = async () => {
    if (!creditsData.amount || creditsData.amount <= 0) {
      notify.warning('Please enter a valid amount');
      return;
    }
    if (!creditsData.reason) {
      notify.warning('Please enter a reason');
      return;
    }

    try {
      const result = await usersApi.adjustCredits(
        id,
        creditsData.amount,
        creditsData.type,
        creditsData.reason
      );
      notify.success(result.message);
      setShowCreditsModal(false);
      setCreditsData({ amount: 0, type: 'add', reason: '' });
      loadUser();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };



  const handleLockUser = async () => {
    console.log('[UserDetail] handleLockUser called', { userId: id, currentLocked: user.locked });
    
    const confirmed = await notify.confirm({
      title: user.locked ? 'Unlock Account' : 'Lock Account',
      message: `Are you sure you want to ${user.locked ? 'unlock' : 'lock'} this account?`,
      confirmText: user.locked ? 'Unlock' : 'Lock',
      type: 'warning'
    });

    console.log('[UserDetail] Lock confirmation result:', confirmed);
    if (!confirmed) return;

    let reason = null;
    if (!user.locked) {
      reason = await notify.prompt({
        title: 'Reason for locking account',
        message: 'Please enter the reason for locking this account:',
        placeholder: 'E.g., Terms of service violation',
        confirmText: 'Lock'
      });
      console.log('[UserDetail] Lock reason:', reason);
      if (!reason) return;
    }

    try {
      console.log('[UserDetail] Calling toggleLock API...', { id, locked: !user.locked, reason });
      const result = await usersApi.toggleLock(id, !user.locked, reason);
      console.log('[UserDetail] toggleLock API result:', result);
      notify.success(`Account ${user.locked ? 'unlocked' : 'locked'} successfully!`);
      loadUser();
    } catch (err) {
      console.error('[UserDetail] toggleLock error:', err);
      notify.error('Error: ' + err.message);
    }
  };

  const handleDeleteUser = async () => {
    console.log('[UserDetail] handleDeleteUser called', { userId: id });
    
    const confirmed = await notify.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to DELETE this user?\n\nThis action cannot be undone!',
      confirmText: 'Continue',
      type: 'danger'
    });

    console.log('[UserDetail] Delete confirmation result:', confirmed);
    if (!confirmed) return;

    const confirmation = await notify.prompt({
      title: 'Confirm Deletion',
      message: 'Type "DELETE" to confirm user deletion:',
      placeholder: 'DELETE',
      confirmText: 'Delete'
    });

    console.log('[UserDetail] Delete confirmation text:', confirmation);
    if (confirmation !== 'DELETE') {
      notify.warning('Incorrect confirmation. Action cancelled.');
      return;
    }

    try {
      console.log('[UserDetail] Calling delete API...', { id });
      const result = await usersApi.delete(id);
      console.log('[UserDetail] Delete API result:', result);
      notify.success('User deleted successfully!');
      navigate('/users');
    } catch (err) {
      console.error('[UserDetail] Delete error:', err);
      notify.error('Error: ' + err.message);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      notify.warning('Please enter notification title and message!');
      return;
    }

    try {
      setSendingNotification(true);
      
      // Send with English content, backend will auto-translate based on user's language
      const payload = {
        type: notificationData.type,
        priority: notificationData.priority,
        title: notificationData.title,
        message: notificationData.message
      };
      
      await usersApi.sendNotification(id, payload);
      notify.success('Notification sent successfully!');
      setShowNotificationModal(false);
      setNotificationData({
        type: 'info',
        priority: 'medium',
        title: '',
        message: ''
      });
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSendingNotification(false);
    }
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
          <img src="/icon/arrow-left.svg" alt="Back" />
          Back
        </button>
        <div className="header-title">
          <img src="/icon/user.svg" alt="User" />
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
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleString('en-US')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`status-indicator ${user.locked ? 'locked' : 'active'}`}>
                {user.locked ? 'Locked' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Credits + Usage Stats */}
        <div className="detail-card">
          <h2>
            <img src="/icon/dollar-sign.svg" alt="Credits" />
            Credits
          </h2>
          <div className="credits-display">
            <div className="credits-balance">
              <span className="credits-number">{user.credits?.balance || 0}</span>
              <span className="credits-label">Available</span>
            </div>
            <div className="credits-stats">
              <div className="credit-stat">
                <span className="stat-value">{user.credits?.purchased || 0}</span>
                <span className="stat-label">Purchased</span>
              </div>
              <div className="credit-stat">
                <span className="stat-value">{user.credits?.bonus || 0}</span>
                <span className="stat-label">Bonus</span>
              </div>
              <div className="credit-stat">
                <span className="stat-value">{user.credits?.used || 0}</span>
                <span className="stat-label">Used</span>
              </div>
            </div>
          </div>
          <button className="btn-adjust-credits" onClick={() => setShowCreditsModal(true)}>
            <img src="/icon/plus-circle.svg" alt="Adjust" />
            Adjust Credits
          </button>
        </div>

        {/* Usage Stats Card */}
        <div className="detail-card full-width">
          <h2>
            <img src="/icon/chart-bar.svg" alt="Stats" />
            Usage Statistics
          </h2>
          <div className="stats-grid">
            <div className="stat-box">
              <img src="/icon/folder.svg" alt="Profiles" className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{user.usage?.profilesCount || 0}</div>
                <div className="stat-label">Profiles</div>
              </div>
            </div>
            <div className="stat-box">
              <img src="/icon/search.svg" alt="Analyses" className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{user.usage?.analysesCount || 0}</div>
                <div className="stat-label">Analyses</div>
              </div>
            </div>
            <div className="stat-box">
              <img src="/icon/edit.svg" alt="Rewrites" className="stat-icon" />
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
            <img src="/icon/folder.svg" alt="Profiles" />
            Writing Profiles ({user.profiles?.length || 0})
          </h2>
          {user.profiles && user.profiles.length > 0 ? (
            <div className="profiles-list">
              {user.profiles.map(profile => (
                <div key={profile.id} className="profile-item">
                  <img src="/icon/file-text.svg" alt="Profile" className="profile-icon" />
                  <div className="profile-info">
                    <div className="profile-name">{profile.name}</div>
                    <div className="profile-meta">
                      <span className={`status-badge ${profile.status}`}>
                        <img src={`/icon/${profile.status === 'ready' ? 'check-circle' : 'clock'}.svg`} alt="Status" />
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
              <img src="/icon/inbox.svg" alt="Empty" />
              <p>User has not created any profiles yet</p>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="detail-card full-width">
          <h2>
            <img src="/icon/zap.svg" alt="Actions" />
            Actions
          </h2>
          <div className="actions-grid">
            <button 
              className="action-btn primary" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Edit User button clicked');
                setShowEditModal(true);
              }}
              type="button"
            >
              <img src="/icon/edit.svg" alt="Edit" className="action-icon" />
              <span className="action-label">Edit User</span>
            </button>
            <button 
              className="action-btn success" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Adjust Credits button clicked');
                setShowCreditsModal(true);
              }}
              type="button"
            >
              <img src="/icon/dollar-sign.svg" alt="Credits" className="action-icon" />
              <span className="action-label">Adjust Credits</span>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Send notification button clicked');
                setShowNotificationModal(true);
              }}
              type="button"
            >
              <img src="/icon/bell.svg" alt="Notification" className="action-icon" />
              <span className="action-label">Send notification</span>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Manage Profiles button clicked');
                navigate(`/users/${id}/profiles`);
              }}
              type="button"
            >
              <img src="/icon/folder.svg" alt="Profiles" className="action-icon" />
              <span className="action-label">Manage Profiles</span>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] View logs button clicked');
                navigate(`/users/${id}/logs`);
              }}
              type="button"
            >
              <img src="/icon/activity.svg" alt="Logs" className="action-icon" />
              <span className="action-label">View logs</span>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Activity Details button clicked');
                navigate(`/users/${id}/activity`);
              }}
              type="button"
            >
              <img src="/icon/bar-chart-2.svg" alt="Activity" className="action-icon" />
              <span className="action-label">Activity Details</span>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Lock/Unlock button clicked');
                handleLockUser();
              }}
              type="button"
            >
              <img src={`/icon/${user.locked ? 'unlock' : 'lock'}.svg`} alt="Lock" className="action-icon" />
              <span className="action-label">{user.locked ? 'Unlock' : 'Lock'} account</span>
            </button>
            <button 
              className="action-btn danger" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[UserDetail] Delete user button clicked');
                handleDeleteUser();
              }}
              type="button"
            >
              <img src="/icon/trash-2.svg" alt="Delete" className="action-icon" />
              <span className="action-label">Delete user</span>
            </button>
          </div>
        </div>


      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <img src="/icon/bell.svg" alt="Notification" />
                Send Notification
              </h2>
              <button className="btn-close" onClick={() => setShowNotificationModal(false)}>
                <img src="/icon/x.svg" alt="Close" />
              </button>
            </div>
            <div className="modal-body">
              <div className="notification-info-banner">
                <img src="/icon/info.svg" alt="Info" />
                <span>Write in English. The notification will be automatically translated to the user's language.</span>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <CustomSelect
                    label="Type"
                    value={notificationData.type}
                    onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
                    options={[
                      { value: 'info', label: 'Information' },
                      { value: 'success', label: 'Success' },
                      { value: 'warning', label: 'Warning' },
                      { value: 'error', label: 'Error' }
                    ]}
                  />
                </div>
                <div className="form-group half">
                  <CustomSelect
                    label="Priority"
                    value={notificationData.priority}
                    onChange={(e) => setNotificationData({...notificationData, priority: e.target.value})}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
                    ]}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                  placeholder="E.g.: Account Update, Special Offer..."
                  maxLength={100}
                />
              </div>
              
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                  placeholder="Enter your notification message here..."
                  rows="4"
                  maxLength={500}
                />
                <div className="char-count">{notificationData.message.length}/500</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNotificationModal(false)} disabled={sendingNotification}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSendNotification} disabled={sendingNotification}>
                {sendingNotification ? (
                  <>
                    <span className="spinner-small"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <img src="/icon/send.svg" alt="Send" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User Information</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <img src="/icon/x.svg" alt="Close" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="User name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditUser}>
                <img src="/icon/save.svg" alt="Save" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Credits Modal */}
      {showCreditsModal && (
        <div className="modal-overlay" onClick={() => setShowCreditsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust User Credits</h2>
              <button className="btn-close" onClick={() => setShowCreditsModal(false)}>
                <img src="/icon/x.svg" alt="Close" />
              </button>
            </div>
            <div className="modal-body">
              <div className="current-credits-info">
                <span>Current Balance:</span>
                <strong>{user.credits?.balance || 0} credits</strong>
              </div>
              <div className="form-group">
                <label>Action Type</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="creditType"
                      value="add"
                      checked={creditsData.type === 'add'}
                      onChange={(e) => setCreditsData({...creditsData, type: e.target.value})}
                    />
                    <span className="radio-label add">
                      <img src="/icon/plus.svg" alt="Add" />
                      Add Credits
                    </span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="creditType"
                      value="deduct"
                      checked={creditsData.type === 'deduct'}
                      onChange={(e) => setCreditsData({...creditsData, type: e.target.value})}
                    />
                    <span className="radio-label deduct">
                      <img src="/icon/minus.svg" alt="Deduct" />
                      Deduct Credits
                    </span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="text"
                  className="credits-amount-input"
                  value={creditsData.amount || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setCreditsData({...creditsData, amount: value ? parseInt(value) : 0});
                  }}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  className="credits-reason-input"
                  value={creditsData.reason}
                  onChange={(e) => setCreditsData({...creditsData, reason: e.target.value})}
                  placeholder="Enter reason for adjustment (required)"
                  rows="2"
                />
              </div>
              <div className="preview-adjustment">
                <span>New Balance:</span>
                <strong className={creditsData.type === 'add' ? 'positive' : 'negative'}>
                  {creditsData.type === 'add' 
                    ? (user.credits?.balance || 0) + (creditsData.amount || 0)
                    : Math.max(0, (user.credits?.balance || 0) - (creditsData.amount || 0))
                  } credits
                </strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCreditsModal(false)}>
                Cancel
              </button>
              <button 
                className={`btn-primary ${creditsData.type === 'deduct' ? 'danger' : 'success'}`}
                onClick={handleAdjustCredits}
              >
                <img src={`/icon/${creditsData.type === 'add' ? 'plus' : 'minus'}.svg`} alt={creditsData.type} />
                {creditsData.type === 'add' ? 'Add' : 'Deduct'} Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
