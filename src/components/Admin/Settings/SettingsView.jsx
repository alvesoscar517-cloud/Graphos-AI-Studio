import { useState, useEffect } from 'react';
import { settingsApi } from '../../../services/adminApi';
import { useNotify } from '../../Common/NotificationProvider';
import './SettingsView.css';

export default function SettingsView() {
  const [settings, setSettings] = useState({
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
      maxFileSize: 5, // MB
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
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      enableTwoFactor: false,
    },
  });

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
      if (response.settings) {
        setSettings(response.settings);
      }
    } catch (err) {
      console.error('Load settings error:', err);
      notify.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.update(settings);
      notify.success('Đã lưu cài đặt thành công!');
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'system', label: 'Hệ thống', icon: 'settings.svg' },
    { id: 'limits', label: 'Giới hạn', icon: 'shield.svg' },
    { id: 'features', label: 'Tính năng', icon: 'toggle-right.svg' },
    { id: 'email', label: 'Email', icon: 'mail.svg' },
    { id: 'security', label: 'Bảo mật', icon: 'lock.svg' },
    { id: 'backup', label: 'Backup', icon: 'database.svg' },
  ];

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Đang tải cài đặt...</p>
      </div>
    );
  }

  return (
    <div className="settings-view">
      <div className="settings-header">
        <div className="header-title">
          <img src="/icon/settings.svg" alt="Settings" />
          <div>
            <h1>Cài đặt hệ thống</h1>
            <p>Quản lý cấu hình và tùy chỉnh hệ thống</p>
          </div>
        </div>

        <button 
          className="btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          <img src="/icon/save.svg" alt="Save" />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

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
              <h2>Cài đặt hệ thống</h2>
              
              <div className="setting-group">
                <label>Tên website</label>
                <input
                  type="text"
                  value={settings.system.siteName}
                  onChange={(e) => updateSetting('system', 'siteName', e.target.value)}
                  placeholder="AI Authenticator"
                />
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Chế độ bảo trì
                    <small>Tạm khóa truy cập cho người dùng</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.system.allowRegistration}
                    onChange={(e) => updateSetting('system', 'allowRegistration', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Cho phép đăng ký
                    <small>Người dùng mới có thể tạo tài khoản</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.system.requireEmailVerification}
                    onChange={(e) => updateSetting('system', 'requireEmailVerification', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Yêu cầu xác thực email
                    <small>Người dùng phải xác thực email trước khi sử dụng</small>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Limits Settings */}
          {activeTab === 'limits' && (
            <div className="settings-section">
              <h2>Giới hạn sử dụng</h2>
              
              <div className="setting-group">
                <label>Số profiles tối đa / người dùng</label>
                <input
                  type="number"
                  value={settings.limits.maxProfilesPerUser}
                  onChange={(e) => updateSetting('limits', 'maxProfilesPerUser', parseInt(e.target.value))}
                  min="1"
                  max="100"
                />
                <small>Số lượng hồ sơ văn phong tối đa mỗi người dùng có thể tạo</small>
              </div>

              <div className="setting-group">
                <label>Số phân tích tối đa / ngày</label>
                <input
                  type="number"
                  value={settings.limits.maxAnalysesPerDay}
                  onChange={(e) => updateSetting('limits', 'maxAnalysesPerDay', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                />
                <small>Số lần phân tích văn bản tối đa mỗi ngày</small>
              </div>

              <div className="setting-group">
                <label>Số viết lại tối đa / ngày</label>
                <input
                  type="number"
                  value={settings.limits.maxRewritesPerDay}
                  onChange={(e) => updateSetting('limits', 'maxRewritesPerDay', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                />
                <small>Số lần viết lại văn bản tối đa mỗi ngày</small>
              </div>

              <div className="setting-group">
                <label>Kích thước file tối đa (MB)</label>
                <input
                  type="number"
                  value={settings.limits.maxFileSize}
                  onChange={(e) => updateSetting('limits', 'maxFileSize', parseInt(e.target.value))}
                  min="1"
                  max="50"
                />
                <small>Kích thước file upload tối đa</small>
              </div>
            </div>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="settings-section">
              <h2>Tính năng</h2>
              
              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.features.enableAnalytics}
                    onChange={(e) => updateSetting('features', 'enableAnalytics', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Bật Analytics
                    <small>Thu thập và hiển thị thống kê sử dụng</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.features.enableNotifications}
                    onChange={(e) => updateSetting('features', 'enableNotifications', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Bật Notifications
                    <small>Cho phép gửi thông báo đến người dùng</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.features.enableSupport}
                    onChange={(e) => updateSetting('features', 'enableSupport', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Bật Support
                    <small>Người dùng có thể gửi yêu cầu hỗ trợ</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.features.enableAutoBackup}
                    onChange={(e) => updateSetting('features', 'enableAutoBackup', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Tự động backup
                    <small>Tự động sao lưu dữ liệu hàng ngày</small>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <h2>Cấu hình Email</h2>
              
              <div className="setting-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                  placeholder="587"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Password</label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="setting-group">
                <label>From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  placeholder="noreply@example.com"
                />
              </div>

              <div className="setting-group">
                <label>From Name</label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  placeholder="AI Authenticator"
                />
              </div>

              <button className="btn-test">
                <img src="/icon/send.svg" alt="Test" />
                Gửi email test
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Bảo mật</h2>
              
              <div className="setting-group">
                <label>Thời gian session (giờ)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  min="1"
                  max="168"
                />
                <small>Thời gian tự động đăng xuất khi không hoạt động</small>
              </div>

              <div className="setting-group">
                <label>Số lần đăng nhập sai tối đa</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
                <small>Khóa tài khoản sau số lần đăng nhập sai</small>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.security.requireStrongPassword}
                    onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Yêu cầu mật khẩu mạnh
                    <small>Mật khẩu phải có chữ hoa, số và ký tự đặc biệt</small>
                  </span>
                </label>
              </div>

              <div className="setting-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.security.enableTwoFactor}
                    onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    Xác thực 2 yếu tố
                    <small>Yêu cầu mã OTP khi đăng nhập</small>
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
                  <h3>Backup toàn bộ dữ liệu</h3>
                  <p>Sao lưu tất cả dữ liệu người dùng, profiles và cài đặt</p>
                  <button className="btn-primary">
                    <img src="/icon/download.svg" alt="Backup" />
                    Tạo backup ngay
                  </button>
                </div>

                <div className="backup-card">
                  <img src="/icon/users.svg" alt="Users" />
                  <h3>Export danh sách người dùng</h3>
                  <p>Xuất danh sách người dùng ra file CSV</p>
                  <button className="btn-primary">
                    <img src="/icon/download.svg" alt="Export" />
                    Export Users (CSV)
                  </button>
                </div>

                <div className="backup-card">
                  <img src="/icon/chart-line.svg" alt="Analytics" />
                  <h3>Export báo cáo Analytics</h3>
                  <p>Xuất báo cáo thống kê chi tiết</p>
                  <button className="btn-primary">
                    <img src="/icon/file-text.svg" alt="Report" />
                    Export Report (PDF)
                  </button>
                </div>

                <div className="backup-card">
                  <img src="/icon/upload.svg" alt="Restore" />
                  <h3>Khôi phục từ backup</h3>
                  <p>Khôi phục dữ liệu từ file backup</p>
                  <button className="btn-secondary">
                    <img src="/icon/upload.svg" alt="Restore" />
                    Chọn file backup
                  </button>
                </div>
              </div>

              <div className="backup-history">
                <h3>Lịch sử backup</h3>
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
