import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { notificationsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import './NotificationList.css';

export default function NotificationList() {
  const { 
    notifications, 
    loading: realtimeLoading, 
    loadNotifications,
    invalidateCache,
    setActiveTab 
  } = useRealtime();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const notify = useNotify();
  const loading = realtimeLoading.notifications;

  useEffect(() => {
    setActiveTab('notifications');
    handleLoadNotifications();
  }, [filter]);

  const handleLoadNotifications = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      await loadNotifications(params);
    } catch (err) {
      console.error('Load notifications error:', err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await notify.confirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await notificationsApi.delete(id);
      invalidateCache('notifications');
      await handleLoadNotifications();
      notify.success('Notification deleted!');
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleSend = async (id) => {
    const confirmed = await notify.confirm({
      title: 'Send Notification',
      message: 'Send this notification now?',
      type: 'info'
    });
    
    if (!confirmed) return;

    try {
      await notificationsApi.send(id);
      notify.success('Notification sent successfully!');
      invalidateCache('notifications');
      await handleLoadNotifications();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Draft', color: '#999' },
      scheduled: { label: 'Scheduled', color: '#666' },
      sent: { label: 'Sent', color: '#000' },
      archived: { label: 'Archived', color: '#ccc' }
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
      info: { icon: 'info.svg', label: 'Info' },
      success: { icon: 'check-circle.svg', label: 'Success' },
      warning: { icon: 'alert-triangle.svg', label: 'Warning' },
      error: { icon: 'x-circle.svg', label: 'Error' },
      announcement: { icon: 'megaphone.svg', label: 'Announcement' }
    };
    
    const typeInfo = types[type] || types.info;
    
    return (
      <span className="type-badge">
        <img src={`/icon/${typeInfo.icon}`} alt={typeInfo.label} />
        {typeInfo.label}
      </span>
    );
  };

  if (loading && (!notifications || notifications.length === 0)) {
    return <LoadingScreen />;
  }

  // Filter notifications locally
  const filteredNotifications = (notifications || []).filter(n => {
    if (filter === 'all') return true;
    return n.status === filter;
  });

  return (
    <div className="notification-list">
      <div className="list-header">
        <div className="header-title">
          <img src="/icon/bell.svg" alt="Notifications" />
          <div>
            <h1>Notification Management</h1>
            <p>Create and manage notifications sent to users</p>
          </div>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => navigate('/notifications/new')}
        >
          <img src="/icon/plus.svg" alt="Add" />
          Create New Notification
        </button>
      </div>

      <div className="list-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'draft' ? 'active' : ''}
          onClick={() => setFilter('draft')}
        >
          Draft
        </button>
        <button 
          className={filter === 'scheduled' ? 'active' : ''}
          onClick={() => setFilter('scheduled')}
        >
          Scheduled
        </button>
        <button 
          className={filter === 'sent' ? 'active' : ''}
          onClick={() => setFilter('sent')}
        >
          Sent
        </button>
      </div>

      <div className="notifications-grid">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <img src="/icon/inbox.svg" alt="Empty" />
            <p>No notifications yet</p>
            <button onClick={() => navigate('/notifications/new')}>
              Create First Notification
            </button>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div key={notif.id} className="notification-card">
              <div className="card-header">
                {getTypeBadge(notif.type)}
                {getStatusBadge(notif.status)}
              </div>

              <div className="card-body">
                <h3>{notif.translations?.vi?.title || 'No Title'}</h3>
                <p>{notif.translations?.vi?.message || 'No Content'}</p>
              </div>

              <div className="card-footer">
                <div className="card-stats">
                  <span>
                    <img src="/icon/send.svg" alt="Sent" />
                    {notif.stats?.sent || 0} sent
                  </span>
                  <span>
                    <img src="/icon/eye.svg" alt="Read" />
                    {notif.stats?.read || 0} read
                  </span>
                </div>

                <div className="card-actions">
                  {notif.status === 'draft' && (
                    <button 
                      className="btn-send"
                      onClick={() => handleSend(notif.id)}
                    >
                      <img src="/icon/send.svg" alt="Send" />
                      Send
                    </button>
                  )}
                  
                  <button 
                    className="btn-edit"
                    onClick={() => navigate(`/notifications/${notif.id}`)}
                  >
                    <img src="/icon/edit.svg" alt="Edit" />
                    Edit
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
