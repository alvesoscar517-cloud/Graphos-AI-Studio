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
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    };
    return labels[priority] || labels.medium;
  };

  return (
    <div className="notification-preview-container">
      <div className="preview-header">
        <h3>
          <img src="/admin/icon/eye.svg" alt="Preview" />
          Preview
        </h3>
        <div className="preview-language">
          {language === 'vi' && 'Vietnamese'}
          {language === 'en' && 'English'}
          {language === 'ja' && 'Japanese'}
        </div>
      </div>

      <div className="preview-info">
        <div className="info-item">
          <span className="info-label">Type:</span>
          <span className="info-value">
            <img src={`/admin/icon/${getTypeIcon(notification.type)}`} alt="Type" />
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Priority:</span>
          <span className="info-value">{getPriorityLabel(notification.priority)}</span>
        </div>
      </div>

      {/* Desktop Preview */}
      <div className="preview-section">
        <h4>
          <img src="/admin/icon/monitor.svg" alt="Desktop" />
          Desktop
        </h4>
        <div 
          className="preview-notification desktop"
          style={{ borderLeftColor: getTypeColor(notification.type) }}
        >
          <div className="notif-icon" style={{ background: `${getTypeColor(notification.type)}20` }}>
            <img src={`/admin/icon/${getTypeIcon(notification.type)}`} alt="Icon" style={{ filter: 'none' }} />
          </div>
          <div className="notif-content">
            <h5>{translation.title || 'Notification Title'}</h5>
            <p>{translation.message || 'Notification content will be displayed here...'}</p>
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
          <img src="/admin/icon/smartphone.svg" alt="Mobile" />
          Mobile
        </h4>
        <div className="mobile-frame">
          <div 
            className="preview-notification mobile"
            style={{ borderTopColor: getTypeColor(notification.type) }}
          >
            <div className="notif-header">
              <img src={`/admin/icon/${getTypeIcon(notification.type)}`} alt="Icon" className="notif-icon-mobile" />
              <span className="notif-time">Just now</span>
            </div>
            <h5>{translation.title || 'Notification Title'}</h5>
            <p>{translation.message || 'Notification content...'}</p>
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
          <img src="/admin/icon/target.svg" alt="Target" />
          Target
        </h4>
        <div className="target-info">
          {notification.target.type === 'all' && (
            <p>
              <img src="/admin/icon/users.svg" alt="All" />
              All Users
            </p>
          )}
          {notification.target.type === 'segment' && (
            <p>
              <img src="/admin/icon/target.svg" alt="Segment" />
              Specific User Group
            </p>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      {(notification.scheduledAt || notification.expiresAt) && (
        <div className="preview-section">
          <h4>
            <img src="/admin/icon/clock.svg" alt="Schedule" />
            Schedule
          </h4>
          <div className="schedule-info">
            {notification.scheduledAt && (
              <p>
                <img src="/admin/icon/calendar.svg" alt="Send" />
                Send: {new Date(notification.scheduledAt).toLocaleString('en-US')}
              </p>
            )}
            {notification.expiresAt && (
              <p>
                <img src="/admin/icon/clock.svg" alt="Expire" />
                Expires: {new Date(notification.expiresAt).toLocaleString('en-US')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
