import { useState, useEffect } from 'react';
import { settingsApi, backupApi } from '../../services/adminApi';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import BackupSuccessModal from './BackupSuccessModal';
import './SettingsView.css';
import './SettingsIcons.css';

export default function SettingsView() {
  const { admin, changePassword, logoutAdmin } = useAdminAuth();
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Default settings - always available
  const defaultSettings = {
    system: {
      siteName: 'AI Authenticator',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
    },
    limits: {
      maxProfilesPerUser: 10,
      maxAnalysesPerDay: 100,
      maxRewritesPerDay: 50,
      maxFileSize: 5,
    },
    features: {
      enableAnalytics: true,
      enableNotifications: true,
      enableSupport: true,
      enableAutoBackup: false,
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Authenticator',
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      enableTwoFactor: false,
    },
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [backingUp, setBackingUp] = useState(false);
  const [backupList, setBackupList] = useState([]);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupResult, setBackupResult] = useState(null);
  const notify = useNotify();

  // Load settings only once on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load backup list when switching to backup tab
  useEffect(() => {
    if (activeTab === 'backup') {
      loadBackupList();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      if (response && response.settings) {
        // Merge with default settings to ensure all fields exist
        setSettings({
          system: { ...defaultSettings.system, ...response.settings.system },
          limits: { ...defaultSettings.limits, ...response.settings.limits },
          features: { ...defaultSettings.features, ...response.settings.features },
          email: { ...defaultSettings.email, ...response.settings.email },
          security: { ...defaultSettings.security, ...response.settings.security },
        });
      }
    } catch (err) {
      console.error('Load settings error:', err);
      // Keep using default settings
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.update(settings);
      notify.success('Settings saved successfully!');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value,
      },
    }));
  };

  const loadBackupList = async () => {
    try {
      const response = await backupApi.list();
      if (response && response.data) {
        setBackupList(response.data);
      }
    } catch (err) {
      console.error('Load backup list error:', err);
    }
  };

  const handleBackupNow = async () => {
    try {
      setBackingUp(true);
      notify.info('Creating backup...');
      
      const response = await backupApi.create();
      
      if (response && response.success && response.data) {
        // Show modal with backup information
        setBackupResult(response.data);
        setShowBackupModal(true);
        notify.success('Backup completed successfully!');
        loadBackupList(); // Refresh list
      } else {
        notify.error('Backup failed: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      notify.error('Backup error: ' + err.message);
    } finally {
      setBackingUp(false);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      notify.info('Preparing download...');
      
      // Get download URL from backend
      const response = await backupApi.getDownloadUrl(filename);
      
      if (response && response.success && response.data.downloadUrl) {
        // Open download URL in new tab
        window.open(response.data.downloadUrl, '_blank');
        notify.success('Download started! Save the file to your Drive.');
      } else {
        notify.error('Failed to get download URL');
      }
    } catch (err) {
      notify.error('Download error: ' + err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      notify.error('Please fill in all password fields');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      notify.error('New password must be at least 8 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }
    
    try {
      setChangingPassword(true);
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        notify.success('Password changed successfully! Please login again.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        notify.error(result.error?.message || 'Failed to change password');
      }
    } catch (err) {
      notify.error('Error changing password: ' + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: 'user.svg' },
    { id: 'system', label: 'System', icon: 'settings.svg' },
    { id: 'limits', label: 'Limits', icon: 'shield.svg' },
    { id: 'features', label: 'Features', icon: 'toggle-right.svg' },
    { id: 'email', label: 'Email', icon: 'mail.svg' },
    { id: 'security', label: 'Security', icon: 'lock.svg' },
    { id: 'backup', label: 'Backup', icon: 'database.svg' },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="settings-view">
      <PageHeader
        icon="settings.svg"
        title="System Settings"
        subtitle="Manage system configuration and customization"
        actions={
          <button 
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            <img src="/icon/save.svg" alt="Save" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <img src={`/icon/${tab.icon}`} alt={tab.label} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              
              <div className="account-info">
                <div className="account-avatar">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="account-details">
                  <h3>{admin?.name || 'Admin'}</h3>
                  <p>{admin?.email || 'admin@example.com'}</p>
                  <span className="account-role">{admin?.role || 'admin'}</span>
                </div>
              </div>

              <div className="account-actions">
                <div className="action-card" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                  <div className="action-icon">
                    <img src="/icon/lock.svg" alt="Password" />
                  </div>
                  <div className="action-content">
                    <h4>Change Password</h4>
                    <p>Update your account password</p>
                  </div>
                  <img 
                    src="/icon/chevron-down.svg" 
                    alt="Toggle" 
                    className={`action-chevron ${showPasswordForm ? 'expanded' : ''}`}
                  />
                </div>

                {showPasswordForm && (
                  <div className="password-form-container">
                    <form onSubmit={handleChangePassword}>
                      <div className="setting-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div className="setting-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Minimum 8 characters"
                          required
                        />
                      </div>

                      <div className="setting-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <div className="password-form-actions">
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary"
                          disabled={changingPassword}
                        >
                          <img src="/icon/lock.svg" alt="Change" />
                          {changingPassword ? 'Changing...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="action-card logout-card" onClick={logoutAdmin}>
                  <div className="action-icon logout-icon">
                    <img src="/icon/log-out.svg" alt="Logout" />
                  </div>
                  <div className="action-content">
                    <h4>Logout</h4>
                    <p>End your current session</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              
              <div className="setting-group">
                <label>Website Name</label>
                <input
                  type="text"
                  value={settings?.system?.siteName || ''}
                  onChange={(e) => updateSetting('system', 'siteName', e.target.value)}
                  placeholder="AI Authenticator"
                />
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.system?.maintenanceMode || false}
                    onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Maintenance Mode
                    <small>Temporarily block user access</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.system?.allowRegistration || false}
                    onChange={(e) => updateSetting('system', 'allowRegistration', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Allow Registration
                    <small>New users can create accounts</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.system?.requireEmailVerification || false}
                    onChange={(e) => updateSetting('system', 'requireEmailVerification', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Require Email Verification
                    <small>Users must verify email before using</small>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Limits Settings */}
          {activeTab === 'limits' && (
            <div className="settings-section">
              <h2>Usage Limits</h2>
              
              <div className="setting-group">
                <label>Max Profiles per User</label>
                <input
                  type="number"
                  value={settings?.limits?.maxProfilesPerUser || 10}
                  onChange={(e) => updateSetting('limits', 'maxProfilesPerUser', parseInt(e.target.value) || 10)}
                  min="1"
                  max="100"
                />
                <small>Maximum number of writing profiles each user can create</small>
              </div>

              <div className="setting-group">
                <label>Max Analyses per Day</label>
                <input
                  type="number"
                  value={settings?.limits?.maxAnalysesPerDay || 100}
                  onChange={(e) => updateSetting('limits', 'maxAnalysesPerDay', parseInt(e.target.value) || 100)}
                  min="1"
                  max="1000"
                />
                <small>Maximum text analyses per day</small>
              </div>

              <div className="setting-group">
                <label>Max Rewrites per Day</label>
                <input
                  type="number"
                  value={settings?.limits?.maxRewritesPerDay || 50}
                  onChange={(e) => updateSetting('limits', 'maxRewritesPerDay', parseInt(e.target.value) || 50)}
                  min="1"
                  max="1000"
                />
                <small>Maximum text rewrites per day</small>
              </div>

              <div className="setting-group">
                <label>Max File Size (MB)</label>
                <input
                  type="number"
                  value={settings?.limits?.maxFileSize || 5}
                  onChange={(e) => updateSetting('limits', 'maxFileSize', parseInt(e.target.value) || 5)}
                  min="1"
                  max="50"
                />
                <small>Maximum file upload size</small>
              </div>
            </div>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="settings-section">
              <h2>Features</h2>
              
              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.features?.enableAnalytics || false}
                    onChange={(e) => updateSetting('features', 'enableAnalytics', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Enable Analytics
                    <small>Collect and display usage statistics</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.features?.enableNotifications || false}
                    onChange={(e) => updateSetting('features', 'enableNotifications', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Enable Notifications
                    <small>Allow sending notifications to users</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.features?.enableSupport || false}
                    onChange={(e) => updateSetting('features', 'enableSupport', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Enable Support
                    <small>Users can send support requests</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.features?.enableAutoBackup || false}
                    onChange={(e) => updateSetting('features', 'enableAutoBackup', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Auto Backup
                    <small>Automatically backup data daily</small>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <h2>Email Configuration</h2>
              
              <div className="setting-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings?.email?.smtpHost || ''}
                  onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings?.email?.smtpPort || 587}
                  onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value) || 587)}
                  placeholder="587"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  value={settings?.email?.smtpUser || ''}
                  onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Password</label>
                <input
                  type="password"
                  value={settings?.email?.smtpPassword || ''}
                  onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="setting-group">
                <label>From Email</label>
                <input
                  type="email"
                  value={settings?.email?.fromEmail || ''}
                  onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  placeholder="noreply@example.com"
                />
              </div>

              <div className="setting-group">
                <label>From Name</label>
                <input
                  type="text"
                  value={settings?.email?.fromName || ''}
                  onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  placeholder="AI Authenticator"
                />
              </div>

              <button className="btn-test">
                <img src="/icon/send.svg" alt="Test" />
                Send Test Email
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security</h2>
              
              <div className="setting-group">
                <label>Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings?.security?.sessionTimeout || 24}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 24)}
                  min="1"
                  max="168"
                />
                <small>Auto logout time when inactive</small>
              </div>

              <div className="setting-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  value={settings?.security?.maxLoginAttempts || 5}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                  min="3"
                  max="10"
                />
                <small>Lock account after failed login attempts</small>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.security?.requireStrongPassword || false}
                    onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Require Strong Password
                    <small>Password must have uppercase, numbers and special characters</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings?.security?.enableTwoFactor || false}
                    onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Two-Factor Authentication
                    <small>Require OTP code when logging in</small>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <h2>Backup & Restore</h2>
              
              <div className="backup-actions">
                <div className="backup-card">
                  <img src="/icon/database.svg" alt="Backup" />
                  <h3>Firestore Backup to Cloud Storage</h3>
                  <p>Backup all Firestore data to Google Cloud Storage</p>
                  <button 
                    className="btn-primary"
                    onClick={handleBackupNow}
                    disabled={backingUp}
                  >
                    <img src="/icon/download.svg" alt="Backup" />
                    {backingUp ? 'Creating Backup...' : 'Create Backup Now'}
                  </button>
                </div>
              </div>

              <div className="backup-history">
                <h3>Recent Backups (Cloud Storage)</h3>
                {backupList.length === 0 ? (
                  <p className="no-data">No backups found. Click "Create Backup Now" to start.</p>
                ) : (
                  <div className="history-list">
                    {backupList.slice(0, 10).map((backup, index) => (
                      <div key={index} className="history-item">
                        <img src="/icon/check-circle.svg" alt="Success" />
                        <div className="history-info">
                          <span className="history-name">{backup.name}</span>
                          <span className="history-date">
                            {new Date(backup.created).toLocaleString()}
                          </span>
                        </div>
                        <span className="history-size">
                          {(parseInt(backup.size) / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button 
                          className="btn-icon"
                          title="Download backup directly"
                          onClick={() => handleDownloadBackup(backup.name)}
                        >
                          <img src="/icon/download.svg" alt="Download" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="backup-info">
                <h3>
                  <img src="/icon/info.svg" alt="Info" />
                  Backup Information
                </h3>
                <ul>
                  <li>
                    <img src="/icon/check-circle.svg" alt="" />
                    Backups stored in Google Cloud Storage bucket
                  </li>
                  <li>
                    <img src="/icon/refresh-cw.svg" alt="" />
                    Automatic backup runs every 24 hours
                  </li>
                  <li>
                    <img src="/icon/mail.svg" alt="" />
                    Download link sent to your email after each backup
                  </li>
                  <li>
                    <img src="/icon/trash-2.svg" alt="" />
                    Old backups automatically cleaned up (keeps 30 most recent)
                  </li>
                  <li>
                    <img src="/icon/database.svg" alt="" />
                    Backup includes: users, notifications, support tickets, voice profiles
                  </li>
                  <li>
                    <img src="/icon/dollar-sign.svg" alt="" />
                    Storage cost: ~$0.02/GB/month (very cheap!)
                  </li>
                  <li>
                    <img src="/icon/lightbulb.svg" alt="" />
                    <strong>Tip:</strong> Public URL never expires - Save to your personal Google Drive
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backup Success Modal */}
      {showBackupModal && backupResult && (
        <BackupSuccessModal 
          backupInfo={backupResult}
          onClose={() => setShowBackupModal(false)}
        />
      )}
    </div>
  );
}
