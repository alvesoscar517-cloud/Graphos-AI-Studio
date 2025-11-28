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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && (!notifications || notifications.length === 0)) {
    return <LoadingScreen />;
  }

  // Filter notifications locally
  const filteredNotifications = (notifications || []).filter(n => {
    if (filter === 'all') return true;
    return n.status === filter;
  });

  const getStatusClass = (status) => {
    const classes = {
      draft: 'status-draft',
      scheduled: 'status-scheduled',
      sent: 'status-sent',
      archived: 'status-archived'
    };
    return classes[status] || 'status-draft';
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: 'info.svg',
      success: 'check-circle.svg',
      warning: 'alert-triangle.svg',
      error: 'x-circle.svg',
      announcement: 'megaphone.svg'
    };
    return icons[type] || 'info.svg';
  };

  return (
    <div className="notification-list">
      <div className="list-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <img src="/icon/bell.svg" alt="Notifications" />
          </div>
          <div>
            <h1>Notifications</h1>
            <p>Manage notifications sent to users</p>
          </div>
        </div>
        
        <button 
          className="btn-create"
          onClick={() => navigate('/notifications/new')}
        >
          <img src="/icon/plus.svg" alt="Add" />
          New Notification
        </button>
      </div>

      <div className="list-toolbar">
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All' },
            { key: 'draft', label: 'Draft' },
            { key: 'scheduled', label: 'Scheduled' },
            { key: 'sent', label: 'Sent' }
          ].map(tab => (
            <button 
              key={tab.key}
              className={filter === tab.key ? 'active' : ''}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="list-count">
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <img src="/icon/inbox.svg" alt="Empty" />
          <p>No notifications yet</p>
          <button onClick={() => navigate('/notifications/new')}>
            Create First Notification
          </button>
        </div>
      ) : (
        <div className="notifications-table">
          <table>
            <thead>
              <tr>
                <th className="col-type">Type</th>
                <th className="col-content">Content</th>
                <th className="col-languages">Languages</th>
                <th className="col-status">Status</th>
                <th className="col-stats">Stats</th>
                <th className="col-date">Created</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map(notif => (
                <tr key={notif.id}>
                  <td className="col-type">
                    <div className="type-icon">
                      <img src={`/icon/${getTypeIcon(notif.type)}`} alt={notif.type} />
                    </div>
                  </td>
                  <td className="col-content">
                    <div className="content-cell">
                      <span className="content-title">
                        {notif.translations?.en?.title || notif.content?.title || 'No Title'}
                      </span>
                      <span className="content-message">
                        {notif.translations?.en?.message || notif.content?.message || 'No Content'}
                      </span>
                    </div>
                  </td>
                  <td className="col-languages">
                    <div className="lang-tags">
                      <span className="lang-tag primary">EN</span>
                      {notif.targetLanguages?.slice(0, 3).map(lang => (
                        <span key={lang} className="lang-tag">{lang.toUpperCase()}</span>
                      ))}
                      {notif.targetLanguages?.length > 3 && (
                        <span className="lang-tag more">+{notif.targetLanguages.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="col-status">
                    <span className={`status-badge ${getStatusClass(notif.status)}`}>
                      {notif.status || 'draft'}
                    </span>
                  </td>
                  <td className="col-stats">
                    <div className="stats-cell">
                      <span>{notif.stats?.sent || 0} sent</span>
                      <span>{notif.stats?.read || 0} read</span>
                    </div>
                  </td>
                  <td className="col-date">
                    {formatDate(notif.createdAt)}
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      {notif.status === 'draft' && (
                        <button 
                          className="btn-action btn-send"
                          onClick={() => handleSend(notif.id)}
                          title="Send"
                        >
                          <img src="/icon/send.svg" alt="Send" />
                        </button>
                      )}
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/notifications/${notif.id}`)}
                        title="Edit"
                      >
                        <img src="/icon/edit.svg" alt="Edit" />
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(notif.id)}
                        title="Delete"
                      >
                        <img src="/icon/trash-2.svg" alt="Delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
