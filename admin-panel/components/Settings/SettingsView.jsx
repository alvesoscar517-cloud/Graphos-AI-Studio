import { useState, useEffect } from 'react';
import { settingsApi, backupApi, debugApi } from '../../services/adminApi';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import BackupSuccessModal from './BackupSuccessModal';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

export default function SettingsView() {
  const { admin, changePassword, logoutAdmin } = useAdminAuth();
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const defaultSettings = {
    system: { siteName: 'AI Authenticator', maintenanceMode: false, allowRegistration: true, requireEmailVerification: false },
    limits: { maxProfilesPerUser: 10, maxAnalysesPerDay: 100, maxRewritesPerDay: 50, maxFileSize: 5 },
    features: { enableAnalytics: true, enableNotifications: true, enableSupport: true, enableAutoBackup: false },
    email: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPassword: '', fromEmail: 'no-reply@graphosai.com', fromName: 'Graphos AI Studio' },
    security: { sessionTimeout: 24, maxLoginAttempts: 5, requireStrongPassword: true, enableTwoFactor: false },
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [backingUp, setBackingUp] = useState(false);
  const [backupList, setBackupList] = useState([]);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupResult, setBackupResult] = useState(null);
  const [emailConfig, setEmailConfig] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const notify = useNotify();

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { if (activeTab === 'backup') loadBackupList(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'email') checkEmailConfig(); }, [activeTab]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      if (response?.settings) {
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
    setSettings(prev => ({ ...prev, [category]: { ...(prev[category] || {}), [key]: value } }));
  };

  const loadBackupList = async () => {
    try {
      const response = await backupApi.list();
      if (response?.data) setBackupList(response.data);
    } catch (err) {
      console.error('Load backup list error:', err);
    }
  };

  const checkEmailConfig = async () => {
    try {
      const response = await debugApi.testEmail();
      setEmailConfig(response.config);
    } catch (err) {
      console.error('Check email config error:', err);
      setEmailConfig({ error: err.message });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      notify.warning('Please enter a test email address');
      return;
    }
    try {
      setTestingEmail(true);
      const response = await debugApi.testEmail(testEmailAddress);
      if (response.success) {
        notify.success('Test email sent successfully! Check your inbox.');
      } else {
        notify.error('Failed: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setBackingUp(true);
      notify.info('Creating backup...');
      const response = await backupApi.create();
      if (response?.success && response.data) {
        setBackupResult(response.data);
        setShowBackupModal(true);
        notify.success('Backup completed successfully!');
        loadBackupList();
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
      const response = await backupApi.getDownloadUrl(filename);
      if (response?.success && response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
        notify.success('Download started!');
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
        notify.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        notify.error(result.error?.message || 'Failed to change password');
      }
    } catch (err) {
      notify.error('Error: ' + err.message);
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

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6">
      <PageHeader
        icon="settings.svg"
        title="System Settings"
        subtitle="Manage system configuration"
        actions={
          <Button onClick={handleSave} loading={saving}>
            <img src="/icon/save.svg" alt="" className="w-4 h-4 icon-white" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="flex gap-6 mt-6">
        {/* Sidebar Tabs */}
        <div className="w-48 shrink-0">
          <div className="flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-secondary hover:text-primary"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <img src={`/icon/${tab.icon}`} alt="" className={cn("w-4 h-4", activeTab === tab.id ? "icon-white" : "icon-gray")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Account */}
          {activeTab === 'account' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Account Settings</h2>
              
              <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">{admin?.name || 'Admin'}</h3>
                  <p className="text-sm text-muted">{admin?.email || 'admin@example.com'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                    {admin?.role || 'admin'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary transition-colors text-left"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                    <img src="/icon/lock.svg" alt="" className="w-5 h-5 icon-dark" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-primary">Change Password</h4>
                    <p className="text-xs text-muted">Update your account password</p>
                  </div>
                  <img src="/icon/chevron-down.svg" alt="" className={cn("w-5 h-5 transition-transform", showPasswordForm && "rotate-180")} />
                </button>

                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="p-4 bg-surface-secondary rounded-xl space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      hint="Minimum 8 characters"
                      required
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="secondary" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                      <Button type="submit" loading={changingPassword}>Update Password</Button>
                    </div>
                  </form>
                )}

                <button
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-destructive/30 hover:border-destructive hover:bg-destructive/5 transition-colors text-left"
                  onClick={logoutAdmin}
                >
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <img src="/icon/log-out.svg" alt="" className="w-5 h-5" style={{ filter: 'invert(36%) sepia(76%) saturate(2696%) hue-rotate(338deg)' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-destructive">Logout</h4>
                    <p className="text-xs text-muted">End your current session</p>
                  </div>
                </button>
              </div>
            </Card>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">System Settings</h2>
              <div className="space-y-6">
                <Input
                  label="Website Name"
                  value={settings?.system?.siteName || ''}
                  onChange={(e) => updateSetting('system', 'siteName', e.target.value)}
                />
                <SettingToggle
                  label="Maintenance Mode"
                  description="Temporarily block user access"
                  checked={settings?.system?.maintenanceMode || false}
                  onChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                />
                <SettingToggle
                  label="Allow Registration"
                  description="New users can create accounts"
                  checked={settings?.system?.allowRegistration || false}
                  onChange={(checked) => updateSetting('system', 'allowRegistration', checked)}
                />
                <SettingToggle
                  label="Require Email Verification"
                  description="Users must verify email before using"
                  checked={settings?.system?.requireEmailVerification || false}
                  onChange={(checked) => updateSetting('system', 'requireEmailVerification', checked)}
                />
              </div>
            </Card>
          )}

          {/* Limits */}
          {activeTab === 'limits' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Usage Limits</h2>
              <div className="space-y-6">
                <Input
                  label="Max Profiles per User"
                  type="number"
                  value={settings?.limits?.maxProfilesPerUser || 10}
                  onChange={(e) => updateSetting('limits', 'maxProfilesPerUser', parseInt(e.target.value) || 10)}
                  hint="Maximum writing profiles each user can create"
                />
                <Input
                  label="Max Analyses per Day"
                  type="number"
                  value={settings?.limits?.maxAnalysesPerDay || 100}
                  onChange={(e) => updateSetting('limits', 'maxAnalysesPerDay', parseInt(e.target.value) || 100)}
                />
                <Input
                  label="Max Rewrites per Day"
                  type="number"
                  value={settings?.limits?.maxRewritesPerDay || 50}
                  onChange={(e) => updateSetting('limits', 'maxRewritesPerDay', parseInt(e.target.value) || 50)}
                />
                <Input
                  label="Max File Size (MB)"
                  type="number"
                  value={settings?.limits?.maxFileSize || 5}
                  onChange={(e) => updateSetting('limits', 'maxFileSize', parseInt(e.target.value) || 5)}
                />
              </div>
            </Card>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Features</h2>
              <div className="space-y-6">
                <SettingToggle
                  label="Enable Analytics"
                  description="Collect and display usage statistics"
                  checked={settings?.features?.enableAnalytics || false}
                  onChange={(checked) => updateSetting('features', 'enableAnalytics', checked)}
                />
                <SettingToggle
                  label="Enable Notifications"
                  description="Allow sending notifications to users"
                  checked={settings?.features?.enableNotifications || false}
                  onChange={(checked) => updateSetting('features', 'enableNotifications', checked)}
                />
                <SettingToggle
                  label="Enable Support"
                  description="Users can send support requests"
                  checked={settings?.features?.enableSupport || false}
                  onChange={(checked) => updateSetting('features', 'enableSupport', checked)}
                />
                <SettingToggle
                  label="Auto Backup"
                  description="Automatically backup data daily"
                  checked={settings?.features?.enableAutoBackup || false}
                  onChange={(checked) => updateSetting('features', 'enableAutoBackup', checked)}
                />
              </div>
            </Card>
          )}

          {/* Email */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Server SMTP Status */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Server Email Configuration</h2>
                <p className="text-sm text-muted mb-4">
                  Email settings are configured via environment variables on the server (Cloud Run).
                </p>
                
                {emailConfig ? (
                  <div className="space-y-3">
                    <div className={cn(
                      "p-4 rounded-lg",
                      emailConfig.isConfigured ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={emailConfig.isConfigured ? "/icon/check-circle.svg" : "/icon/x-circle.svg"} 
                          alt="" 
                          className="w-5 h-5" 
                        />
                        <span className={cn("font-medium", emailConfig.isConfigured ? "text-success" : "text-destructive")}>
                          {emailConfig.isConfigured ? 'SMTP Configured' : 'SMTP Not Configured'}
                        </span>
                      </div>
                      {!emailConfig.isConfigured && (
                        <p className="text-sm text-muted">
                          Set SMTP_USER and SMTP_PASS environment variables in Cloud Run to enable email sending.
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-surface-secondary rounded-lg">
                        <span className="text-muted">SMTP Host:</span>
                        <span className="ml-2 text-primary font-mono">{emailConfig.smtpHost}</span>
                      </div>
                      <div className="p-3 bg-surface-secondary rounded-lg">
                        <span className="text-muted">SMTP Port:</span>
                        <span className="ml-2 text-primary font-mono">{emailConfig.smtpPort}</span>
                      </div>
                      <div className="p-3 bg-surface-secondary rounded-lg">
                        <span className="text-muted">SMTP User:</span>
                        <span className="ml-2 text-primary font-mono">{emailConfig.smtpUser}</span>
                      </div>
                      <div className="p-3 bg-surface-secondary rounded-lg">
                        <span className="text-muted">SMTP Pass:</span>
                        <span className="ml-2 text-primary font-mono">{emailConfig.smtpPass}</span>
                      </div>
                      <div className="p-3 bg-surface-secondary rounded-lg">
                        <span className="text-muted">From Email:</span>
                        <span className="ml-2 text-primary font-mono">{emailConfig.fromEmail}</span>
                      </div>
                      <div className="p-3 bg-surface-secondary rounded-lg">
                        <span className="text-muted">From Name:</span>
                        <span className="ml-2 text-primary font-mono">{emailConfig.fromName}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">Loading configuration...</div>
                )}
              </Card>

              {/* Test Email */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Test Email</h2>
                <p className="text-sm text-muted mb-4">
                  Send a test email to verify SMTP configuration is working correctly.
                </p>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Enter test email address" 
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTestEmail} loading={testingEmail} disabled={!emailConfig?.isConfigured}>
                    <img src="/icon/send.svg" alt="" className="w-4 h-4 icon-white" />
                    {testingEmail ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
                {!emailConfig?.isConfigured && (
                  <p className="text-xs text-destructive mt-2">
                    Configure SMTP credentials first to send test emails.
                  </p>
                )}
              </Card>

              {/* Local Settings (for reference) */}
              <Card className="p-6 opacity-60">
                <h2 className="text-lg font-semibold text-primary mb-4">Local Settings (Reference Only)</h2>
                <p className="text-xs text-muted mb-4">
                  These settings are stored in database but actual email sending uses server environment variables.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SMTP Host" value={settings?.email?.smtpHost || ''} onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
                  <Input label="SMTP Port" type="number" value={settings?.email?.smtpPort || 587} onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value) || 587)} />
                  <Input label="SMTP Username" value={settings?.email?.smtpUser || ''} onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)} />
                  <Input label="SMTP Password" type="password" value={settings?.email?.smtpPassword || ''} onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)} />
                  <Input label="From Email" type="email" value={settings?.email?.fromEmail || ''} onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)} />
                  <Input label="From Name" value={settings?.email?.fromName || ''} onChange={(e) => updateSetting('email', 'fromName', e.target.value)} />
                </div>
              </Card>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Security</h2>
              <div className="space-y-6">
                <Input
                  label="Session Timeout (hours)"
                  type="number"
                  value={settings?.security?.sessionTimeout || 24}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 24)}
                  hint="Auto logout time when inactive"
                />
                <Input
                  label="Max Login Attempts"
                  type="number"
                  value={settings?.security?.maxLoginAttempts || 5}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                  hint="Lock account after failed attempts"
                />
                <SettingToggle
                  label="Require Strong Password"
                  description="Must have uppercase, numbers and special characters"
                  checked={settings?.security?.requireStrongPassword || false}
                  onChange={(checked) => updateSetting('security', 'requireStrongPassword', checked)}
                />
                <SettingToggle
                  label="Two-Factor Authentication"
                  description="Require OTP code when logging in"
                  checked={settings?.security?.enableTwoFactor || false}
                  onChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                />
              </div>
            </Card>
          )}

          {/* Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center">
                    <img src="/icon/database.svg" alt="" className="w-6 h-6 icon-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">Firestore Backup</h3>
                    <p className="text-sm text-muted">Backup all data to Cloud Storage</p>
                  </div>
                  <Button onClick={handleBackupNow} loading={backingUp}>
                    <img src="/icon/download.svg" alt="" className="w-4 h-4 icon-white" />
                    {backingUp ? 'Creating...' : 'Create Backup'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-primary mb-4">Recent Backups</h3>
                {backupList.length === 0 ? (
                  <p className="text-sm text-muted text-center py-8">No backups found</p>
                ) : (
                  <div className="space-y-2">
                    {backupList.slice(0, 10).map((backup, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
                        <img src="/icon/check-circle.svg" alt="" className="w-5 h-5 text-success" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-primary truncate">{backup.name}</div>
                          <div className="text-xs text-muted">{new Date(backup.created).toLocaleString()}</div>
                        </div>
                        <span className="text-xs text-muted">{(parseInt(backup.size) / 1024 / 1024).toFixed(2)} MB</span>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadBackup(backup.name)}>
                          <img src="/icon/download.svg" alt="" className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-surface-secondary">
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <img src="/icon/info.svg" alt="" className="w-5 h-5" />
                  Backup Information
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-center gap-2"><img src="/icon/check-circle.svg" alt="" className="w-4 h-4" /> Stored in Google Cloud Storage</li>
                  <li className="flex items-center gap-2"><img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4" /> Auto backup every 24 hours</li>
                  <li className="flex items-center gap-2"><img src="/icon/trash-2.svg" alt="" className="w-4 h-4" /> Keeps 30 most recent backups</li>
                  <li className="flex items-center gap-2"><img src="/icon/dollar-sign.svg" alt="" className="w-4 h-4" /> ~$0.02/GB/month</li>
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>

      {showBackupModal && backupResult && (
        <BackupSuccessModal backupInfo={backupResult} onClose={() => setShowBackupModal(false)} />
      )}
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div>
        <div className="font-medium text-primary">{label}</div>
        {description && <div className="text-xs text-muted mt-0.5">{description}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
