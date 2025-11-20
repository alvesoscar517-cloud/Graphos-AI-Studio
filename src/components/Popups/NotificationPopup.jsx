import { useEffect, useRef } from 'react'
import './Popups.css'

const NotificationPopup = ({ onClose }) => {
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  const notifications = [
    {
      id: 1,
      icon: 'check-circle.svg',
      title: 'Hồ sơ đã được tạo',
      message: 'Hồ sơ "Văn phong Chuyên nghiệp" đã được tạo thành công',
      time: '5 phút trước',
      unread: true
    },
    {
      id: 2,
      icon: 'alert-circle.svg',
      title: 'Phân tích hoàn tất',
      message: 'Văn bản của bạn có độ tương thích 85% với hồ sơ mục tiêu',
      time: '1 giờ trước',
      unread: true
    },
    {
      id: 3,
      icon: 'sparkles.svg',
      title: 'Tính năng mới',
      message: 'Đã thêm tính năng viết lại văn bản theo văn phong',
      time: '2 ngày trước',
      unread: false
    }
  ]

  return (
    <div className="notifications-popup show" ref={popupRef}>
      <div className="notifications-header">
        <h3>Thông báo</h3>
        <button className="notifications-clear-btn">Xóa tất cả</button>
      </div>
      <div className="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
            <div className="notification-icon">
              <img src={`/icon/${notif.icon}`} alt={notif.title} />
            </div>
            <div className="notification-content">
              <div className="notification-title">{notif.title}</div>
              <div className="notification-message">{notif.message}</div>
              <div className="notification-time">{notif.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="notifications-footer">
        <a href="#" className="notifications-view-all">Xem tất cả thông báo</a>
      </div>
    </div>
  )
}

export default NotificationPopup
