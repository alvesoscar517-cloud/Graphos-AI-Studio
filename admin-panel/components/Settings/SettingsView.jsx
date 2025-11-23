import { useState, useEffect } from 'react';
import { settingsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import './SettingsView.css';
import './SettingsIcons.css';

export default function SettingsView() {
  console.log('SettingsView rendering...');
  
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
  const [activeTab, setActiveTab] = useState('system');
  const notify = useNotify();

  useEffect(() => {
    loadSettings();
  }, []);

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

  const tabs = [
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
              <h2>Backup & Export</h2>
              
              <div className="backup-actions">
                <div className="backup-card">
                  <img src="/icon/database.svg" alt="Backup" />
                  <h3>Full Data Backup</h3>
                  <p>Backup all user data, profiles and settings</p>
                  <button className="btn-primary">
                    <img src="/icon/download.svg" alt="Backup" />
                    Create Backup Now
                  </button>
                </div>

                <div className="backup-card">
                  <img src="/icon/users.svg" alt="Users" />
                  <h3>Export User List</h3>
                  <p>Export user list to CSV file</p>
                  <button className="btn-primary">
                    <img src="/icon/download.svg" alt="Export" />
                    Export Users (CSV)
                  </button>
                </div>

                <div className="backup-card">
                  <img src="/icon/chart-line.svg" alt="Analytics" />
                  <h3>Export Analytics Report</h3>
                  <p>Export detailed statistics report</p>
                  <button className="btn-primary">
                    <img src="/icon/file-text.svg" alt="Report" />
                    Export Report (PDF)
                  </button>
                </div>

                <div className="backup-card restore-card">
                  <img src="/icon/upload.svg" alt="Restore" />
                  <h3>Restore from Backup</h3>
                  <p>Restore data from backup file</p>
                  <button className="btn-secondary">
                    <img src="/icon/upload.svg" alt="Restore" />
                    Select Backup File
                  </button>
                </div>
              </div>

              <div className="backup-history">
                <h3>Backup History</h3>
                <div className="history-list">
                  <div className="history-item">
                    <img src="/icon/check-circle.svg" alt="Success" />
                    <div className="history-info">
                      <span className="history-name">backup_2024_01_15.zip</span>
                      <span className="history-date">15/01/2024 - 10:30 AM</span>
                    </div>
                    <span className="history-size">2.5 MB</span>
                    <button className="btn-icon">
                      <img src="/icon/download.svg" alt="Download" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
