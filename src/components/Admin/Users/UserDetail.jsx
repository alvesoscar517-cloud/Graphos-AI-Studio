import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../../services/adminApi';
import './UserDetail.css';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(id);
      setUser(response.user);
    } catch (err) {
      alert('Lỗi: ' + err.message);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
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
            <button className="action-btn">
              <img src="/icon/bell.svg" alt="Notification" className="action-icon" />
              <span className="action-label">Gửi thông báo</span>
            </button>
            <button className="action-btn">
              <img src="/icon/mail.svg" alt="Email" className="action-icon" />
              <span className="action-label">Gửi email</span>
            </button>
            <button className="action-btn">
              <img src="/icon/lock.svg" alt="Lock" className="action-icon" />
              <span className="action-label">Khóa tài khoản</span>
            </button>
            <button className="action-btn danger">
              <img src="/icon/trash-2.svg" alt="Delete" className="action-icon" />
              <span className="action-label">Xóa người dùng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
