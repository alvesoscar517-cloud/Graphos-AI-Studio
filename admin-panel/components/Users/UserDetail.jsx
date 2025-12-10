import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { StatusBadge, Badge } from '../ui/badge';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';

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
  const [adjustingCredits, setAdjustingCredits] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [lockingUser, setLockingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

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
      setEditingUser(true);
      await usersApi.update(id, editData);
      notify.success('User updated successfully!');
      setShowEditModal(false);
      loadUser();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setEditingUser(false);
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
      setAdjustingCredits(true);
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
    } finally {
      setAdjustingCredits(false);
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
      setLockingUser(true);
      await usersApi.toggleLock(id, !user.locked, reason);
      notify.success(`Account ${user.locked ? 'unlocked' : 'locked'} successfully!`);
      loadUser();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setLockingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = await notify.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to DELETE this user?\n\nThis action cannot be undone!',
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
      setDeletingUser(true);
      await usersApi.delete(id);
      notify.success('User deleted successfully!');
      navigate('/users');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      notify.warning('Please enter notification title and message!');
      return;
    }

    try {
      setSendingNotification(true);
      await usersApi.sendNotification(id, {
        type: notificationData.type,
        priority: notificationData.priority,
        title: notificationData.title,
        message: notificationData.message
      });
      notify.success('Notification sent successfully!');
      setShowNotificationModal(false);
      setNotificationData({ type: 'info', priority: 'medium', title: '', message: '' });
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSendingNotification(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <div className="p-6 text-destructive">User not found</div>;

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="user.svg"
        title="User Details"
        actions={
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-muted hover:text-primary hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4 icon-gray" />
            <span className="text-xs sm:text-sm">Back</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Basic Information */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <img src="/icon/user.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            Basic Information
          </h2>
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl sm:text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border gap-2">
              <span className="text-muted text-sm flex-shrink-0">Name</span>
              <span className="font-medium text-sm truncate">{user.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border gap-2">
              <span className="text-muted text-sm flex-shrink-0">Email</span>
              <span className="font-medium text-sm truncate">{user.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border gap-2">
              <span className="text-muted text-sm flex-shrink-0">ID</span>
              <span className="font-mono text-[10px] sm:text-xs bg-surface-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[120px] sm:max-w-none">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border gap-2">
              <span className="text-muted text-sm flex-shrink-0">Created</span>
              <span className="font-medium text-xs sm:text-sm">{new Date(user.createdAt).toLocaleDateString('en-US')}</span>
            </div>
            <div className="flex justify-between items-center py-2 gap-2">
              <span className="text-muted text-sm flex-shrink-0">Status</span>
              <StatusBadge status={user.locked ? 'suspended' : 'active'}>
                {user.locked ? 'Locked' : 'Active'}
              </StatusBadge>
            </div>
          </div>
        </Card>

        {/* Credits */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <img src="/icon/dollar-sign.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            Credits
          </h2>
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-2xl sm:text-4xl font-bold text-primary truncate" title={user.credits?.balance || 0}>
              {Math.round((user.credits?.balance || 0) * 100) / 100}
            </div>
            <div className="text-muted text-xs sm:text-sm">Available Credits</div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-2 sm:p-3 bg-surface-secondary rounded-lg overflow-hidden">
              <div className="text-base sm:text-xl font-semibold text-success truncate" title={user.credits?.purchased || 0}>
                {Math.round(user.credits?.purchased || 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted">Purchased</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-surface-secondary rounded-lg overflow-hidden">
              <div className="text-base sm:text-xl font-semibold text-info truncate" title={user.credits?.bonus || 0}>
                {Math.round(user.credits?.bonus || 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted">Bonus</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-surface-secondary rounded-lg overflow-hidden">
              <div className="text-base sm:text-xl font-semibold text-muted truncate" title={user.credits?.used || 0}>
                {Math.round((user.credits?.used || 0) * 100) / 100}
              </div>
              <div className="text-[10px] sm:text-xs text-muted">Used</div>
            </div>
          </div>
          <Button variant="secondary" className="w-full" size="sm" onClick={() => setShowCreditsModal(true)}>
            <img src="/icon/plus-circle.svg" alt="" className="w-4 h-4 icon-dark" />
            Adjust Credits
          </Button>
        </Card>

        {/* Usage Statistics */}
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <img src="/icon/bar-chart-2.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            Usage Statistics
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-surface-secondary rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <img src="/icon/folder.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 icon-dark" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold">{user.usage?.profilesCount || 0}</div>
                <div className="text-xs sm:text-sm text-muted">Profiles</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-surface-secondary rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <img src="/icon/search.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 icon-dark" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold">{user.usage?.analysesCount || 0}</div>
                <div className="text-xs sm:text-sm text-muted">Analyses</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-surface-secondary rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <img src="/icon/edit.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 icon-dark" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold">{user.usage?.rewritesCount || 0}</div>
                <div className="text-xs sm:text-sm text-muted">Rewrites</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Writing Profiles */}
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <img src="/icon/folder.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            Writing Profiles ({user.profiles?.length || 0})
          </h2>
          {user.profiles && user.profiles.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {user.profiles.map(profile => (
                <div key={profile.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-surface-secondary rounded-lg">
                  <img src="/icon/file-text.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-gray flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{profile.name}</div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted">
                      <Badge variant={profile.status === 'ready' ? 'success' : 'warning'}>
                        {profile.status === 'ready' ? 'Ready' : 'Processing'}
                      </Badge>
                      <span>{profile.samplesCount} samples</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted">
              <img src="/icon/inbox.svg" alt="" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 icon-gray" />
              <p className="text-xs sm:text-sm">User has not created any profiles yet</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <img src="/icon/zap.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
            Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
              <img src="/icon/edit.svg" alt="" className="w-4 h-4 icon-dark" />
              <span className="hidden sm:inline">Edit User</span>
              <span className="sm:hidden">Edit</span>
            </Button>
            <Button variant="success" size="sm" onClick={() => setShowCreditsModal(true)}>
              <img src="/icon/dollar-sign.svg" alt="" className="w-4 h-4 icon-white" />
              <span className="hidden sm:inline">Adjust Credits</span>
              <span className="sm:hidden">Credits</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowNotificationModal(true)}>
              <img src="/icon/bell.svg" alt="" className="w-4 h-4 icon-dark" />
              <span className="hidden sm:inline">Send Notification</span>
              <span className="sm:hidden">Notify</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/users/${id}/profiles`)}>
              <img src="/icon/folder.svg" alt="" className="w-4 h-4 icon-dark" />
              <span className="hidden sm:inline">Manage Profiles</span>
              <span className="sm:hidden">Profiles</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/users/${id}/logs`)}>
              <img src="/icon/activity.svg" alt="" className="w-4 h-4 icon-dark" />
              <span className="hidden sm:inline">Activity Logs</span>
              <span className="sm:hidden">Logs</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/users/${id}/credits`)}>
              <img src="/icon/credit-card.svg" alt="" className="w-4 h-4 icon-dark" />
              <span className="hidden sm:inline">Credit Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLockUser} disabled={lockingUser} loading={lockingUser}>
              <img src={`/icon/${user.locked ? 'unlock' : 'lock'}.svg`} alt="" className="w-4 h-4 icon-dark" />
              <span className="hidden sm:inline">{user.locked ? 'Unlock' : 'Lock'} Account</span>
              <span className="sm:hidden">{user.locked ? 'Unlock' : 'Lock'}</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteUser} disabled={deletingUser} loading={deletingUser}>
              <img src="/icon/trash-2.svg" alt="" className="w-4 h-4 icon-white" />
              <span className="hidden sm:inline">Delete User</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
        </Card>
      </div>


      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNotificationModal(false)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <img src="/icon/bell.svg" alt="" className="w-5 h-5 icon-dark" />
                Send Notification
              </h2>
              <button className="p-1 hover:bg-surface-secondary rounded" onClick={() => setShowNotificationModal(false)}>
                <img src="/icon/x.svg" alt="Close" className="w-5 h-5 icon-gray" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-info/10 text-info rounded-lg text-sm">
                <img src="/icon/info.svg" alt="" className="w-4 h-4" />
                Write in English. Auto-translated to user's language.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
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
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select
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
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                  placeholder="E.g.: Account Update, Special Offer..."
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary focus:outline-none focus:bg-surface transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                  placeholder="Enter your notification message..."
                  rows="3"
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary focus:outline-none focus:bg-surface transition-colors resize-none"
                />
                <div className="text-xs text-muted text-right mt-1">{notificationData.message.length}/500</div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button variant="secondary" onClick={() => setShowNotificationModal(false)} disabled={sendingNotification}>
                Cancel
              </Button>
              <Button onClick={handleSendNotification} disabled={sendingNotification} loading={sendingNotification}>
                Send Notification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Edit User Information</h2>
              <button className="p-1 hover:bg-surface-secondary rounded" onClick={() => setShowEditModal(false)}>
                <img src="/icon/x.svg" alt="Close" className="w-5 h-5 icon-gray" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="User name"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary focus:outline-none focus:bg-surface transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary focus:outline-none focus:bg-surface transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={editingUser}>Cancel</Button>
              <Button onClick={handleEditUser} disabled={editingUser} loading={editingUser}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Credits Modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreditsModal(false)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Adjust User Credits</h2>
              <button className="p-1 hover:bg-surface-secondary rounded" onClick={() => setShowCreditsModal(false)}>
                <img src="/icon/x.svg" alt="Close" className="w-5 h-5 icon-gray" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                <span className="text-muted text-sm">Current Balance:</span>
                <span className="text-lg sm:text-xl font-bold truncate ml-2">{Math.round((user.credits?.balance || 0) * 100) / 100} credits</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${creditsData.type === 'add' ? 'bg-success/15 text-success' : 'bg-surface-secondary hover:bg-surface-tertiary'}`}>
                    <input
                      type="radio"
                      name="creditType"
                      value="add"
                      checked={creditsData.type === 'add'}
                      onChange={(e) => setCreditsData({...creditsData, type: e.target.value})}
                      className="hidden"
                    />
                    <img src="/icon/plus.svg" alt="" className="w-4 h-4" />
                    <span className="font-medium">Add</span>
                  </label>
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${creditsData.type === 'deduct' ? 'bg-destructive/15 text-destructive' : 'bg-surface-secondary hover:bg-surface-tertiary'}`}>
                    <input
                      type="radio"
                      name="creditType"
                      value="deduct"
                      checked={creditsData.type === 'deduct'}
                      onChange={(e) => setCreditsData({...creditsData, type: e.target.value})}
                      className="hidden"
                    />
                    <img src="/icon/minus.svg" alt="" className="w-4 h-4" />
                    <span className="font-medium">Deduct</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="text"
                  value={creditsData.amount || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setCreditsData({...creditsData, amount: value ? parseInt(value) : 0});
                  }}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary focus:outline-none focus:bg-surface transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason *</label>
                <textarea
                  value={creditsData.reason}
                  onChange={(e) => setCreditsData({...creditsData, reason: e.target.value})}
                  placeholder="Enter reason for adjustment (required)"
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary focus:outline-none focus:bg-surface transition-colors resize-none"
                />
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                <span className="text-muted text-sm">New Balance:</span>
                <span className={`text-lg sm:text-xl font-bold truncate ml-2 ${creditsData.type === 'add' ? 'text-success' : 'text-destructive'}`}>
                  {Math.round((creditsData.type === 'add' 
                    ? (user.credits?.balance || 0) + (creditsData.amount || 0)
                    : Math.max(0, (user.credits?.balance || 0) - (creditsData.amount || 0))
                  ) * 100) / 100} credits
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button variant="secondary" onClick={() => setShowCreditsModal(false)} disabled={adjustingCredits}>Cancel</Button>
              <Button variant={creditsData.type === 'add' ? 'success' : 'destructive'} onClick={handleAdjustCredits} disabled={adjustingCredits} loading={adjustingCredits}>
                {creditsData.type === 'add' ? 'Add' : 'Deduct'} Credits
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
