import { useState, useEffect } from 'react';
import { settingsApi, backupApi, emailConfigApi } from '../../services/adminApi';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import BackupSuccessModal from './BackupSuccessModal';
import EnvironmentConfig from './EnvironmentConfig';
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
  const [storageStats, setStorageStats] = useState(null);
  const [emailConfig, setEmailConfig] = useState(null);
  const [emailForm, setEmailForm] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: 'no-reply@graphosai.com',
    fromName: 'Graphos AI Studio',
    supportEmail: 'support@graphosai.com'
  });
  const [savingEmail, setSavingEmail] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const notify = useNotify();

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { 
    if (activeTab === 'backup') {
      loadBackupList();
      loadStorageStats();
    }
  }, [activeTab]);
  useEffect(() => { if (activeTab === 'email') loadEmailConfig(); }, [activeTab]);

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

  const loadStorageStats = async () => {
    try {
      const response = await backupApi.getStorageStats();
      if (response?.data) setStorageStats(response.data);
    } catch (err) {
      console.error('Load storage stats error:', err);
    }
  };

  const loadEmailConfig = async () => {
    try {
      const response = await emailConfigApi.get();
      if (response?.config) {
        setEmailConfig(response.config);
        setEmailForm(prev => ({
          ...prev,
          smtpHost: response.config.smtpHost || 'smtp.gmail.com',
          smtpPort: response.config.smtpPort || 587,
          fromEmail: response.config.fromEmail || 'no-reply@graphosai.com',
          fromName: response.config.fromName || 'Graphos AI Studio',
          supportEmail: response.config.supportEmail || 'support@graphosai.com',
        }));
      }
    } catch (err) {
      console.error('Load email config error:', err);
      setEmailConfig({ error: err.message });
    }
  };

  const handleSaveEmailConfig = async () => {
    if (!emailForm.smtpUser || !emailForm.smtpPass) {
      notify.warning('Please enter SMTP username and password');
      return;
    }
    try {
      setSavingEmail(true);
      const response = await emailConfigApi.save(emailForm);
      if (response.success) {
        notify.success('Email configuration saved!');
        setEmailConfig(response.config);
        setEmailForm(prev => ({ ...prev, smtpPass: '' }));
      }
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      notify.warning('Please enter a test email address');
      return;
    }
    try {
      setTestingEmail(true);
      const response = await emailConfigApi.test(testEmailAddress);
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
        loadStorageStats();
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
    { id: 'environment', label: 'Environment', icon: 'terminal.svg' },
    { id: 'security', label: 'Security', icon: 'lock.svg' },
    { id: 'backup', label: 'Backup', icon: 'database.svg' },
  ];

  if (loading) return <LoadingScreen />;


  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="settings.svg"
        title="System Settings"
        subtitle="Manage system configuration"
        actions={
          <Button onClick={handleSave} loading={saving} size="sm">
            <img src="/icon/save.svg" alt="" className="w-4 h-4 icon-white" />
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
            <span className="sm:hidden">{saving ? 'Saving' : 'Save'}</span>
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Sidebar Tabs - Horizontal scroll on mobile, vertical on desktop */}
        <div className="lg:w-48 lg:shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-secondary hover:text-primary"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <img src={`/icon/${tab.icon}`} alt="" className={cn("w-4 h-4", activeTab === tab.id ? "icon-white" : "icon-gray")} />
                <span className="hidden sm:inline lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
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
                    <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} required />
                    <Input label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} hint="Minimum 8 characters" required />
                    <Input label="Confirm Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="secondary" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                      <Button type="submit" loading={changingPassword}>Update Password</Button>
                    </div>
                  </form>
                )}

                <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-destructive/30 hover:border-destructive hover:bg-destructive/5 transition-colors text-left" onClick={logoutAdmin}>
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
                <Input label="Website Name" value={settings?.system?.siteName || ''} onChange={(e) => updateSetting('system', 'siteName', e.target.value)} />
                <SettingToggle label="Maintenance Mode" description="Temporarily block user access" checked={settings?.system?.maintenanceMode || false} onChange={(checked) => updateSetting('system', 'maintenanceMode', checked)} />
                <SettingToggle label="Allow Registration" description="New users can create accounts" checked={settings?.system?.allowRegistration || false} onChange={(checked) => updateSetting('system', 'allowRegistration', checked)} />
                <SettingToggle label="Require Email Verification" description="Users must verify email before using" checked={settings?.system?.requireEmailVerification || false} onChange={(checked) => updateSetting('system', 'requireEmailVerification', checked)} />
              </div>
            </Card>
          )}

          {/* Limits */}
          {activeTab === 'limits' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Usage Limits</h2>
              <div className="space-y-6">
                <Input label="Max Profiles per User" type="number" value={settings?.limits?.maxProfilesPerUser || 10} onChange={(e) => updateSetting('limits', 'maxProfilesPerUser', parseInt(e.target.value) || 10)} hint="Maximum writing profiles each user can create" />
                <Input label="Max Analyses per Day" type="number" value={settings?.limits?.maxAnalysesPerDay || 100} onChange={(e) => updateSetting('limits', 'maxAnalysesPerDay', parseInt(e.target.value) || 100)} />
                <Input label="Max Rewrites per Day" type="number" value={settings?.limits?.maxRewritesPerDay || 50} onChange={(e) => updateSetting('limits', 'maxRewritesPerDay', parseInt(e.target.value) || 50)} />
                <Input label="Max File Size (MB)" type="number" value={settings?.limits?.maxFileSize || 5} onChange={(e) => updateSetting('limits', 'maxFileSize', parseInt(e.target.value) || 5)} />
              </div>
            </Card>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Features</h2>
              <div className="space-y-6">
                <SettingToggle label="Enable Analytics" description="Collect and display usage statistics" checked={settings?.features?.enableAnalytics || false} onChange={(checked) => updateSetting('features', 'enableAnalytics', checked)} />
                <SettingToggle label="Enable Notifications" description="Allow sending notifications to users" checked={settings?.features?.enableNotifications || false} onChange={(checked) => updateSetting('features', 'enableNotifications', checked)} />
                <SettingToggle label="Enable Support" description="Users can send support requests" checked={settings?.features?.enableSupport || false} onChange={(checked) => updateSetting('features', 'enableSupport', checked)} />
                <SettingToggle label="Auto Backup" description="Automatically backup data daily" checked={settings?.features?.enableAutoBackup || false} onChange={(checked) => updateSetting('features', 'enableAutoBackup', checked)} />
              </div>
            </Card>
          )}


          {/* Email */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-primary">SMTP Configuration</h2>
                    <p className="text-sm text-muted">Configure email settings for sending notifications</p>
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1", emailConfig?.isConfigured ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    <img src={emailConfig?.isConfigured ? "/icon/check-circle.svg" : "/icon/x-circle.svg"} alt="" className="w-4 h-4" />
                    {emailConfig?.isConfigured ? 'Configured' : 'Not Configured'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input label="SMTP Host" value={emailForm.smtpHost} onChange={(e) => setEmailForm(prev => ({ ...prev, smtpHost: e.target.value }))} placeholder="smtp.gmail.com" />
                  <Input label="SMTP Port" type="number" value={emailForm.smtpPort} onChange={(e) => setEmailForm(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))} />
                  <Input label="SMTP Username (Email)" type="email" value={emailForm.smtpUser} onChange={(e) => setEmailForm(prev => ({ ...prev, smtpUser: e.target.value }))} placeholder="your-email@gmail.com" hint={emailConfig?.smtpUser ? `Current: ${emailConfig.smtpUser}` : ''} />
                  <Input label="SMTP Password (App Password)" type="password" value={emailForm.smtpPass} onChange={(e) => setEmailForm(prev => ({ ...prev, smtpPass: e.target.value }))} placeholder={emailConfig?.isConfigured ? '••••••••' : 'Enter app password'} hint="For Gmail, use App Password (16 chars, no spaces)" />
                  <Input label="From Email" type="email" value={emailForm.fromEmail} onChange={(e) => setEmailForm(prev => ({ ...prev, fromEmail: e.target.value }))} placeholder="no-reply@yourdomain.com" />
                  <Input label="From Name" value={emailForm.fromName} onChange={(e) => setEmailForm(prev => ({ ...prev, fromName: e.target.value }))} placeholder="Your App Name" />
                  <Input label="Support Email" type="email" value={emailForm.supportEmail} onChange={(e) => setEmailForm(prev => ({ ...prev, supportEmail: e.target.value }))} placeholder="support@yourdomain.com" />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveEmailConfig} loading={savingEmail}>
                    <img src="/icon/save.svg" alt="" className="w-4 h-4 icon-white" />
                    {savingEmail ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Test Email</h2>
                <p className="text-sm text-muted mb-4">Send a test email to verify SMTP configuration is working correctly.</p>
                <div className="flex gap-3">
                  <Input placeholder="Enter test email address" type="email" value={testEmailAddress} onChange={(e) => setTestEmailAddress(e.target.value)} className="flex-1" />
                  <Button onClick={handleTestEmail} loading={testingEmail} disabled={!emailConfig?.isConfigured}>
                    <img src="/icon/send.svg" alt="" className="w-4 h-4 icon-white" />
                    {testingEmail ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
                {!emailConfig?.isConfigured && <p className="text-xs text-destructive mt-2">Configure SMTP credentials above first to send test emails.</p>}
              </Card>

              <Card className="p-6 bg-surface-secondary">
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <img src="/icon/info.svg" alt="" className="w-5 h-5" />
                  Gmail SMTP Setup Guide
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-start gap-2"><span className="text-primary font-medium">1.</span>Enable 2-Factor Authentication on your Google Account</li>
                  <li className="flex items-start gap-2"><span className="text-primary font-medium">2.</span>Go to Google Account → Security → App Passwords</li>
                  <li className="flex items-start gap-2"><span className="text-primary font-medium">3.</span>Create a new App Password (select "Mail" and your device)</li>
                  <li className="flex items-start gap-2"><span className="text-primary font-medium">4.</span>Copy the 16-character password (remove spaces) and paste above</li>
                </ul>
              </Card>
            </div>
          )}

          {/* Environment */}
          {activeTab === 'environment' && <EnvironmentConfig />}

          {/* Security */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">Security</h2>
              <div className="space-y-6">
                <Input label="Session Timeout (hours)" type="number" value={settings?.security?.sessionTimeout || 24} onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 24)} hint="Auto logout time when inactive" />
                <Input label="Max Login Attempts" type="number" value={settings?.security?.maxLoginAttempts || 5} onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)} hint="Lock account after failed attempts" />
                <SettingToggle label="Require Strong Password" description="Must have uppercase, numbers and special characters" checked={settings?.security?.requireStrongPassword || false} onChange={(checked) => updateSetting('security', 'requireStrongPassword', checked)} />
                <SettingToggle label="Two-Factor Authentication" description="Require OTP code when logging in" checked={settings?.security?.enableTwoFactor || false} onChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)} />
              </div>
            </Card>
          )}


          {/* Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Storage Overview */}
              {storageStats && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Cloud Storage Card */}
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <img src="/icon/cloud.svg" alt="" className="w-5 h-5" style={{ filter: 'invert(45%) sepia(98%) saturate(1653%) hue-rotate(196deg)' }} />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Cloud Storage</h4>
                        <p className="text-xs text-muted">Primary backup storage</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Total Backups</span>
                        <span className="font-medium text-primary">{storageStats.cloudStorage?.totalFiles || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Total Size</span>
                        <span className="font-medium text-primary">{storageStats.cloudStorage?.totalSizeFormatted || '0 Bytes'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Est. Monthly Cost</span>
                        <span className="font-medium text-success">{storageStats.cloudStorage?.estimatedMonthlyCost || '$0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Bucket</span>
                        <span className="font-medium text-primary text-xs truncate max-w-[150px]">{storageStats.cloudStorage?.bucket || 'N/A'}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Google Drive Card */}
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", storageStats.googleDrive?.enabled ? "bg-green-500/10" : "bg-gray-500/10")}>
                        <img src="/icon/hard-drive.svg" alt="" className="w-5 h-5" style={{ filter: storageStats.googleDrive?.enabled ? 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg)' : 'grayscale(100%)' }} />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Google Drive</h4>
                        <p className="text-xs text-muted">Secondary sync (shared folder)</p>
                      </div>
                    </div>
                    {storageStats.googleDrive?.enabled ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted">Synced Backups</span>
                          <span className="font-medium text-primary">{storageStats.googleDrive?.backupCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Backup Size</span>
                          <span className="font-medium text-primary">{storageStats.googleDrive?.backupSizeFormatted || '0 Bytes'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Status</span>
                          <span className="font-medium text-success flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-success"></span>
                            Connected
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted">
                        <p className="mb-2">Drive sync is disabled. Share a folder with Service Account and set GOOGLE_DRIVE_FOLDER_ID in Environment settings.</p>
                        <p className="text-xs">Auto-enables when folder ID is configured</p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Create Backup */}
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center">
                    <img src="/icon/database.svg" alt="" className="w-6 h-6 icon-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">Firestore Backup</h3>
                    <p className="text-sm text-muted">Backup to Cloud Storage → Sync to Google Drive</p>
                  </div>
                  <Button onClick={handleBackupNow} loading={backingUp}>
                    <img src="/icon/download.svg" alt="" className="w-4 h-4 icon-white" />
                    {backingUp ? 'Creating...' : 'Create Backup'}
                  </Button>
                </div>
              </Card>

              {/* Recent Backups */}
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
                          <div className="text-xs text-muted flex items-center gap-2">
                            <span>{new Date(backup.created).toLocaleString()}</span>
                            {backup.driveSynced && (
                              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded text-[10px]">Drive ✓</span>
                            )}
                          </div>
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

              {/* Backup Info */}
              <Card className="p-6 bg-surface-secondary">
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <img src="/icon/info.svg" alt="" className="w-5 h-5" />
                  Backup Architecture
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-center gap-2"><img src="/icon/cloud.svg" alt="" className="w-4 h-4" /> Primary: Google Cloud Storage (cost-optimized lifecycle)</li>
                  <li className="flex items-center gap-2"><img src="/icon/hard-drive.svg" alt="" className="w-4 h-4" /> Secondary: Google Drive (share folder with Service Account)</li>
                  <li className="flex items-center gap-2"><img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4" /> Auto backup every 24 hours (if enabled)</li>
                  <li className="flex items-center gap-2"><img src="/icon/trash-2.svg" alt="" className="w-4 h-4" /> Cloud Storage: keeps 60 backups, Drive: keeps ALL backups</li>
                  <li className="flex items-center gap-2"><img src="/icon/dollar-sign.svg" alt="" className="w-4 h-4" /> Cost: ~$0.02/GB/month (auto-moves to cheaper tiers)</li>
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
