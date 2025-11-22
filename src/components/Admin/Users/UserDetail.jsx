import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../../services/adminApi';
import { useNotify } from '../../Common/NotificationProvider';
import Spinner from '../../Common/Spinner';
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
      notify.error('Lỗi: ' + err.message);
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
      notify.error('Lỗi tải logs: ' + err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLockUser = async () => {
    const confirmed = await notify.confirm({
      title: user.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      message: `Bạn có chắc muốn ${user.locked ? 'mở khóa' : 'khóa'} tài khoản này?`,
      confirmText: user.locked ? 'Mở khóa' : 'Khóa',
      type: 'warning'
    });

    if (!confirmed) return;

    let reason = null;
    if (!user.locked) {
      reason = await notify.prompt({
        title: 'Lý do khóa tài khoản',
        message: 'Vui lòng nhập lý do khóa tài khoản:',
        placeholder: 'Ví dụ: Vi phạm điều khoản sử dụng',
        confirmText: 'Khóa'
      });
      if (!reason) return;
    }

    try {
      await usersApi.toggleLock(id, !user.locked, reason);
      notify.success(`${user.locked ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`);
      loadUser();
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = await notify.confirm({
      title: 'Xóa người dùng',
      message: '⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA NGƯỜI DÙNG NÀY?\n\nHành động này không thể hoàn tác!',
      confirmText: 'Tiếp tục',
      type: 'danger'
    });

    if (!confirmed) return;

    const confirmation = await notify.prompt({
      title: 'Xác nhận xóa',
      message: 'Nhập "XOA" để xác nhận xóa người dùng:',
      placeholder: 'XOA',
      confirmText: 'Xóa'
    });

    if (confirmation !== 'XOA') {
      notify.warning('Xác nhận không đúng. Hủy thao tác.');
      return;
    }

    try {
      await usersApi.delete(id);
      notify.success('Xóa người dùng thành công!');
      navigate('/users');
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationData.translations.vi || !notificationData.translations.en) {
      notify.warning('Vui lòng nhập nội dung thông báo bằng cả tiếng Việt và tiếng Anh!');
      return;
    }

    try {
      await usersApi.sendNotification(id, notificationData);
      notify.success('Gửi thông báo thành công!');
      setShowNotificationModal(false);
      setNotificationData({
        type: 'info',
        priority: 'medium',
        translations: { vi: '', en: '' }
      });
    } catch (err) {
      alert('Lỗi: ' + err.message);
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
    return (
      <div className="loading">
        <Spinner size="large" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="error">Không tìm thấy người dùng</div>;
  }

  return (
    <div className="user-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/users')}>
          <img src="/icon/arrow-left.svg" alt="Back" />
          Quay lại
        </button>
        <div className="header-title">
          <img src="/icon/user.svg" alt="User" />
          <h1>Chi tiết người dùng</h1>
        </div>
      </div>

      <div className="detail-grid">
        {/* User Info Card */}
        <div className="detail-card">
          <h2>Thông tin cơ bản</h2>
          <div className="user-avatar-large">
            {user.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Tên:</span>
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
              <span className="info-label">Gói:</span>
              <span className={`tier-badge ${user.tier}`}>
                <img src={`/icon/${user.tier === 'premium' ? 'star' : 'circle'}.svg`} alt={user.tier} />
                {user.tier === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày tạo:</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Usage Stats Card */}
        <div className="detail-card">
          <h2>
            <img src="/icon/chart-bar.svg" alt="Stats" />
            Thống kê sử dụng
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
                <div className="stat-label">Phân tích</div>
              </div>
            </div>
            <div className="stat-box">
              <img src="/icon/edit.svg" alt="Rewrites" className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{user.usage?.rewritesCount || 0}</div>
                <div className="stat-label">Viết lại</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Card */}
        <div className="detail-card full-width">
          <h2>
            <img src="/icon/folder.svg" alt="Profiles" />
            Hồ sơ văn phong ({user.profiles?.length || 0})
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
                        {profile.status === 'ready' ? 'Sẵn sàng' : 'Đang xử lý'}
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
              <p>Người dùng chưa tạo profile nào</p>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="detail-card full-width">
          <h2>
            <img src="/icon/zap.svg" alt="Actions" />
            Hành động
          </h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setShowNotificationModal(true)}>
              <img src="/icon/bell.svg" alt="Notification" className="action-icon" />
              <span className="action-label">Gửi thông báo</span>
            </button>
            <button className="action-btn" onClick={loadLogs}>
              <img src="/icon/activity.svg" alt="Logs" className="action-icon" />
              <span className="action-label">Xem logs</span>
            </button>
            <button className="action-btn" onClick={handleLockUser}>
              <img src={`/icon/${user.locked ? 'unlock' : 'lock'}.svg`} alt="Lock" className="action-icon" />
              <span className="action-label">{user.locked ? 'Mở khóa' : 'Khóa'} tài khoản</span>
            </button>
            <button className="action-btn danger" onClick={handleDeleteUser}>
              <img src="/icon/trash-2.svg" alt="Delete" className="action-icon" />
              <span className="action-label">Xóa người dùng</span>
            </button>
          </div>
        </div>

        {/* Logs Card */}
        {showLogs && (
          <div className="detail-card full-width">
            <div className="card-header-with-action">
              <h2>
                <img src="/icon/activity.svg" alt="Logs" />
                Nhật ký hoạt động ({logs.length})
              </h2>
              <button className="btn-close" onClick={() => setShowLogs(false)}>
                <img src="/icon/x.svg" alt="Close" />
              </button>
            </div>
            {logsLoading ? (
              <div className="loading-small">Đang tải logs...</div>
            ) : logs.length > 0 ? (
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log.id} className="log-item">
                    <div className="log-icon" style={{ background: getLogColor(log.type) }}>
                      <img src={`/icon/${getLogIcon(log.type)}`} alt={log.type} />
                    </div>
                    <div className="log-content">
                      <div className="log-header">
                        <span className="log-type">{log.type}</span>
                        <span className="log-action">{log.action}</span>
                      </div>
                      {log.reason && <div className="log-reason">Lý do: {log.reason}</div>}
                      <div className="log-time">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <img src="/icon/inbox.svg" alt="Empty" />
                <p>Chưa có hoạt động nào</p>
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
              <h2>Gửi thông báo cho người dùng</h2>
              <button className="btn-close" onClick={() => setShowNotificationModal(false)}>
                <img src="/icon/x.svg" alt="Close" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Loại thông báo</label>
                <select 
                  value={notificationData.type}
                  onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
                >
                  <option value="info">Thông tin</option>
                  <option value="warning">Cảnh báo</option>
                  <option value="success">Thành công</option>
                  <option value="error">Lỗi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Độ ưu tiên</label>
                <select 
                  value={notificationData.priority}
                  onChange={(e) => setNotificationData({...notificationData, priority: e.target.value})}
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội dung (Tiếng Việt)</label>
                <textarea
                  value={notificationData.translations.vi}
                  onChange={(e) => setNotificationData({
                    ...notificationData,
                    translations: {...notificationData.translations, vi: e.target.value}
                  })}
                  placeholder="Nhập nội dung thông báo bằng tiếng Việt..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Nội dung (English)</label>
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
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSendNotification}>
                <img src="/icon/send.svg" alt="Send" />
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
