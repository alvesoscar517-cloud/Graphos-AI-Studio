import './NotificationPreview.css';

export default function NotificationPreview({ notification, language = 'vi' }) {
  const translation = notification.translations[language];
  
  const getTypeIcon = (type) => {
    const icons = {
      info: 'info.svg',
      success: 'check-circle.svg',
      warning: 'alert-triangle.svg',
      error: 'x-circle.svg',
      announcement: 'megaphone.svg'
    };
    return icons[type] || icons.info;
  };

  const getTypeColor = (type) => {
    const colors = {
      info: '#666',
      success: '#000',
      warning: '#999',
      error: '#000',
      announcement: '#333'
    };
    return colors[type] || colors.info;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao',
      urgent: 'Khẩn cấp'
    };
    return labels[priority] || labels.medium;
  };

  return (
    <div className="notification-preview-container">
      <div className="preview-header">
        <h3>
          <img src="/icon/eye.svg" alt="Preview" />
          Preview
        </h3>
        <div className="preview-language">
          {language === 'vi' && 'Tiếng Việt'}
          {language === 'en' && 'English'}
          {language === 'ja' && '日本語'}
        </div>
      </div>

      <div className="preview-info">
        <div className="info-item">
          <span className="info-label">Loại:</span>
          <span className="info-value">
            <img src={`/icon/${getTypeIcon(notification.type)}`} alt="Type" />
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Ưu tiên:</span>
          <span className="info-value">{getPriorityLabel(notification.priority)}</span>
        </div>
      </div>

      {/* Desktop Preview */}
      <div className="preview-section">
        <h4>
          <img src="/icon/monitor.svg" alt="Desktop" />
          Desktop
        </h4>
        <div 
          className="preview-notification desktop"
          style={{ borderLeftColor: getTypeColor(notification.type) }}
        >
          <div className="notif-icon" style={{ background: `${getTypeColor(notification.type)}20` }}>
            <img src={`/icon/${getTypeIcon(notification.type)}`} alt="Icon" style={{ filter: 'none' }} />
          </div>
          <div className="notif-content">
            <h5>{translation.title || 'Tiêu đề thông báo'}</h5>
            <p>{translation.message || 'Nội dung thông báo sẽ hiển thị ở đây...'}</p>
            {translation.cta && (
              <button className="notif-cta" style={{ background: getTypeColor(notification.type) }}>
                {translation.cta}
              </button>
            )}
          </div>
          <button className="notif-close">×</button>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="preview-section">
        <h4>
          <img src="/icon/smartphone.svg" alt="Mobile" />
          Mobile
        </h4>
        <div className="mobile-frame">
          <div 
            className="preview-notification mobile"
            style={{ borderTopColor: getTypeColor(notification.type) }}
          >
            <div className="notif-header">
              <img src={`/icon/${getTypeIcon(notification.type)}`} alt="Icon" className="notif-icon-mobile" />
              <span className="notif-time">Vừa xong</span>
            </div>
            <h5>{translation.title || 'Tiêu đề thông báo'}</h5>
            <p>{translation.message || 'Nội dung thông báo...'}</p>
            {translation.cta && (
              <button className="notif-cta-mobile" style={{ color: getTypeColor(notification.type) }}>
                {translation.cta} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Info */}
      <div className="preview-section">
        <h4>
          <img src="/icon/target.svg" alt="Target" />
          Đối tượng
        </h4>
        <div className="target-info">
          {notification.target.type === 'all' && (
            <p>
              <img src="/icon/users.svg" alt="All" />
              Tất cả người dùng
            </p>
          )}
          {notification.target.type === 'segment' && (
            <p>
              <img src="/icon/target.svg" alt="Segment" />
              Nhóm người dùng cụ thể
            </p>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      {(notification.scheduledAt || notification.expiresAt) && (
        <div className="preview-section">
          <h4>
            <img src="/icon/clock.svg" alt="Schedule" />
            Lịch trình
          </h4>
          <div className="schedule-info">
            {notification.scheduledAt && (
              <p>
                <img src="/icon/calendar.svg" alt="Send" />
                Gửi: {new Date(notification.scheduledAt).toLocaleString('vi-VN')}
              </p>
            )}
            {notification.expiresAt && (
              <p>
                <img src="/icon/clock.svg" alt="Expire" />
                Hết hạn: {new Date(notification.expiresAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
