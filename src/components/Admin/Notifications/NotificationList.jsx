import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../../services/adminApi';
import { useNotify } from '../../Common/NotificationProvider';
import Spinner from '../../Common/Spinner';
import './NotificationList.css';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await notificationsApi.getAll(params);
      setNotifications(response.notifications);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await notify.confirm({
      title: 'Xóa thông báo',
      message: 'Bạn có chắc muốn xóa thông báo này?',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await notificationsApi.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      notify.success('Đã xóa thông báo!');
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    }
  };

  const handleSend = async (id) => {
    const confirmed = await notify.confirm({
      title: 'Gửi thông báo',
      message: 'Gửi thông báo này ngay bây giờ?',
      type: 'info'
    });
    
    if (!confirmed) return;

    try {
      await notificationsApi.send(id);
      notify.success('Đã gửi thông báo thành công!');
      loadNotifications();
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Nháp', color: '#999' },
      scheduled: { label: 'Đã lên lịch', color: '#666' },
      sent: { label: 'Đã gửi', color: '#000' },
      archived: { label: 'Lưu trữ', color: '#ccc' }
    };
    
    const badge = badges[status] || badges.draft;
    
    return (
      <span 
        className="status-badge" 
        style={{ 
          background: badge.color,
          color: status === 'archived' ? '#666' : '#fff'
        }}
      >
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      info: { icon: 'info.svg', label: 'Thông tin' },
      success: { icon: 'check-circle.svg', label: 'Thành công' },
      warning: { icon: 'alert-triangle.svg', label: 'Cảnh báo' },
      error: { icon: 'x-circle.svg', label: 'Lỗi' },
      announcement: { icon: 'megaphone.svg', label: 'Thông báo' }
    };
    
    const typeInfo = types[type] || types.info;
    
    return (
      <span className="type-badge">
        <img src={`/icon/${typeInfo.icon}`} alt={typeInfo.label} />
        {typeInfo.label}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="notification-list">
      <div className="list-header">
        <div className="header-title">
          <img src="/icon/bell.svg" alt="Notifications" />
          <div>
            <h1>Quản lý thông báo</h1>
            <p>Tạo và quản lý thông báo gửi đến người dùng</p>
          </div>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => navigate('/notifications/new')}
        >
          <img src="/icon/plus.svg" alt="Add" />
          Tạo thông báo mới
        </button>
      </div>

      <div className="list-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={filter === 'draft' ? 'active' : ''}
          onClick={() => setFilter('draft')}
        >
          Nháp
        </button>
        <button 
          className={filter === 'scheduled' ? 'active' : ''}
          onClick={() => setFilter('scheduled')}
        >
          Đã lên lịch
        </button>
        <button 
          className={filter === 'sent' ? 'active' : ''}
          onClick={() => setFilter('sent')}
        >
          Đã gửi
        </button>
      </div>

      <div className="notifications-grid">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <img src="/icon/inbox.svg" alt="Empty" />
            <p>Chưa có thông báo nào</p>
            <button onClick={() => navigate('/notifications/new')}>
              Tạo thông báo đầu tiên
            </button>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className="notification-card">
              <div className="card-header">
                {getTypeBadge(notif.type)}
                {getStatusBadge(notif.status)}
              </div>

              <div className="card-body">
                <h3>{notif.translations?.vi?.title || 'Không có tiêu đề'}</h3>
                <p>{notif.translations?.vi?.message || 'Không có nội dung'}</p>
              </div>

              <div className="card-footer">
                <div className="card-stats">
                  <span>
                    <img src="/icon/send.svg" alt="Sent" />
                    {notif.stats?.sent || 0} đã gửi
                  </span>
                  <span>
                    <img src="/icon/eye.svg" alt="Read" />
                    {notif.stats?.read || 0} đã đọc
                  </span>
                </div>

                <div className="card-actions">
                  {notif.status === 'draft' && (
                    <button 
                      className="btn-send"
                      onClick={() => handleSend(notif.id)}
                    >
                      <img src="/icon/send.svg" alt="Send" />
                      Gửi
                    </button>
                  )}
                  
                  <button 
                    className="btn-edit"
                    onClick={() => navigate(`/notifications/${notif.id}`)}
                  >
                    <img src="/icon/edit.svg" alt="Edit" />
                    Sửa
                  </button>
                  
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(notif.id)}
                  >
                    <img src="/icon/trash-2.svg" alt="Delete" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
