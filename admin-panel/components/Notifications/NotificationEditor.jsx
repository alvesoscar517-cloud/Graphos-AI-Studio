import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import NotificationPreview from './NotificationPreview';
import './NotificationEditor.css';

export default function NotificationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [notification, setNotification] = useState({
    type: 'info',
    priority: 'medium',
    translations: {
      vi: { title: '', message: '', cta: '' },
      en: { title: '', message: '', cta: '' },
      ja: { title: '', message: '', cta: '' }
    },
    target: {
      type: 'all',
      userIds: [],
      segments: []
    },
    scheduledAt: '',
    expiresAt: ''
  });

  const [activeLanguage, setActiveLanguage] = useState('vi');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadNotification();
    }
  }, [id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll({ limit: 1 });
      const notif = response.notifications.find(n => n.id === id);
      if (notif) {
        setNotification({
          ...notif,
          scheduledAt: notif.scheduledAt || '',
          expiresAt: notif.expiresAt || ''
        });
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (lang, field, value) => {
    setNotification(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  const handleAutoTranslate = async () => {
    if (!notification.translations.vi.title || !notification.translations.vi.message) {
      alert('Please enter Vietnamese content first');
      return;
    }

    try {
      setSaving(true);
      
      // Import translation API
      const { translationApi } = await import('../../services/adminApi');
      
      // Translate title
      const titleRes = await translationApi.translate(
        notification.translations.vi.title,
        'vi',
        activeLanguage
      );
      
      // Translate message
      const messageRes = await translationApi.translate(
        notification.translations.vi.message,
        'vi',
        activeLanguage
      );
      
      // Translate CTA if exists
      let ctaTranslation = '';
      if (notification.translations.vi.cta) {
        const ctaRes = await translationApi.translate(
          notification.translations.vi.cta,
          'vi',
          activeLanguage
        );
        ctaTranslation = ctaRes.translations[activeLanguage];
      }
      
      // Update notification
      setNotification(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [activeLanguage]: {
            title: titleRes.translations[activeLanguage],
            message: messageRes.translations[activeLanguage],
            cta: ctaTranslation
          }
        }
      }));
      
      alert('Auto-translation successful!');
    } catch (err) {
      console.error('Translation error:', err);
      alert('Translation error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (sendNow = false) => {
    // Validate
    if (!notification.translations.vi.title || !notification.translations.vi.message) {
      alert('Please enter Vietnamese title and content');
      return;
    }

    // Validate segment selection
    if (notification.target.type === 'segment' && (!notification.target.segments || notification.target.segments.length === 0)) {
      alert('Please select at least one user group');
      return;
    }

    // Validate CTA action
    if (notification.ctaAction?.type === 'url' && !notification.ctaAction.url) {
      alert('Please enter a URL for the CTA action');
      return;
    }
    if (notification.ctaAction?.type === 'view' && !notification.ctaAction.action) {
      alert('Please select a target view for the CTA action');
      return;
    }

    try {
      setSaving(true);

      // Check if scheduling
      const isScheduled = notification.scheduledAt && new Date(notification.scheduledAt) > new Date();

      if (isEditMode) {
        await notificationsApi.update(id, notification);
        if (sendNow) {
          await notificationsApi.send(id);
        } else if (isScheduled) {
          await notificationsApi.schedule(id, notification.scheduledAt);
        }
      } else {
        const response = await notificationsApi.create(notification);
        if (sendNow && response.notificationId) {
          await notificationsApi.send(response.notificationId);
        }
        // If scheduled, the status is already set by create
      }

      let message = 'Notification saved!';
      if (sendNow) message = 'Notification sent!';
      else if (isScheduled) message = `Notification scheduled for ${new Date(notification.scheduledAt).toLocaleString()}`;

      alert(message);
      navigate('/notifications');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="editor-loading">Loading...</div>;
  }

  return (
    <div className="notification-editor">
      <div className="editor-header">
        <div className="header-title">
          <img src={`/icon/${isEditMode ? 'edit' : 'plus'}.svg`} alt={isEditMode ? 'Edit' : 'Create'} />
          <div>
            <h1>{isEditMode ? 'Edit Notification' : 'Create New Notification'}</h1>
            <p>Create multilingual notifications to send to users</p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn-preview"
            onClick={() => setShowPreview(!showPreview)}
          >
            <img src="/icon/eye.svg" alt="Preview" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/notifications')}
          >
            <img src="/icon/arrow-left.svg" alt="Back" />
            Back
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-main">
          {/* Type & Priority */}
          <div className="editor-section">
            <h3>Notification Type</h3>
            <div className="type-selector">
              {[
                { value: 'info', icon: 'info.svg', label: 'Info', color: '#666' },
                { value: 'success', icon: 'check-circle.svg', label: 'Success', color: '#000' },
                { value: 'warning', icon: 'alert-triangle.svg', label: 'Warning', color: '#999' },
                { value: 'error', icon: 'x-circle.svg', label: 'Error', color: '#000' },
                { value: 'announcement', icon: 'megaphone.svg', label: 'Announcement', color: '#333' }
              ].map(type => (
                <button
                  key={type.value}
                  className={`type-btn ${notification.type === type.value ? 'active' : ''}`}
                  style={{ 
                    borderColor: notification.type === type.value ? type.color : '#e0e0e0',
                    background: notification.type === type.value ? `${type.color}20` : 'white'
                  }}
                  onClick={() => setNotification({ ...notification, type: type.value })}
                >
                  <img src={`/icon/${type.icon}`} alt={type.label} className="type-icon" />
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="editor-section">
            <h3>Priority Level</h3>
            <div className="priority-selector">
              {[
                { value: 'low', label: 'Low', color: '#ccc' },
                { value: 'medium', label: 'Medium', color: '#999' },
                { value: 'high', label: 'High', color: '#666' },
                { value: 'urgent', label: 'Urgent', color: '#000' }
              ].map(priority => (
                <button
                  key={priority.value}
                  className={`priority-btn ${notification.priority === priority.value ? 'active' : ''}`}
                  style={{
                    borderColor: notification.priority === priority.value ? priority.color : '#e0e0e0',
                    background: notification.priority === priority.value ? `${priority.color}20` : 'white'
                  }}
                  onClick={() => setNotification({ ...notification, priority: priority.value })}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Tabs */}
          <div className="editor-section">
            <div className="section-header-with-action">
              <h3>Notification Content</h3>
              {activeLanguage !== 'vi' && (
                <button 
                  className="btn-translate"
                  onClick={handleAutoTranslate}
                  disabled={!notification.translations.vi.title || !notification.translations.vi.message}
                  title="Auto-translate from Vietnamese"
                >
                  <img src="/icon/languages.svg" alt="Translate" />
                  Auto Translate
                </button>
              )}
            </div>
            <div className="language-tabs">
              <button
                className={activeLanguage === 'vi' ? 'active' : ''}
                onClick={() => setActiveLanguage('vi')}
              >
                🇻🇳 Vietnamese
              </button>
              <button
                className={activeLanguage === 'en' ? 'active' : ''}
                onClick={() => setActiveLanguage('en')}
              >
                🇬🇧 English
              </button>
              <button
                className={activeLanguage === 'ja' ? 'active' : ''}
                onClick={() => setActiveLanguage('ja')}
              >
                🇯🇵 日本語
              </button>
            </div>

            <div className="translation-form">
              <div className="form-group">
                <label>Title {activeLanguage === 'vi' && <span className="required">*</span>}</label>
                <input
                  type="text"
                  value={notification.translations[activeLanguage].title}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'title', e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div className="form-group">
                <label>Content {activeLanguage === 'vi' && <span className="required">*</span>}</label>
                <textarea
                  value={notification.translations[activeLanguage].message}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'message', e.target.value)}
                  placeholder="Enter notification content"
                  rows={6}
                />
              </div>

              <div className="form-group">
                <label>Call-to-Action (Optional)</label>
                <input
                  type="text"
                  value={notification.translations[activeLanguage].cta}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'cta', e.target.value)}
                  placeholder="E.g.: View Details, Update Now"
                />
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="editor-section">
            <h3>Target Audience</h3>
            <div className="target-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  checked={notification.target.type === 'all'}
                  onChange={() => setNotification({
                    ...notification,
                    target: { type: 'all', segments: [] }
                  })}
                />
                <img src="/icon/users.svg" alt="All users" />
                <span>All Users</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  checked={notification.target.type === 'segment'}
                  onChange={() => setNotification({
                    ...notification,
                    target: { type: 'segment', segments: notification.target.segments || [] }
                  })}
                />
                <img src="/icon/target.svg" alt="Segment" />
                <span>User Groups</span>
              </label>

              {notification.target.type === 'segment' && (
                <div className="segment-options">
                  {[
                    { value: 'inactive', label: 'Inactive users (30+ days)', icon: '😴', desc: 'Users who haven\'t logged in for 30+ days' },
                    { value: 'new', label: 'New users (< 7 days)', icon: '🆕', desc: 'Users who registered in the last 7 days' },
                    { value: 'has_profile', label: 'Has voice profile', icon: '🎤', desc: 'Users who have created at least one voice profile' },
                    { value: 'no_profile', label: 'No voice profile', icon: '❌', desc: 'Users who haven\'t created any voice profile' },
                    { value: 'low_credits', label: 'Low credits (< 10)', icon: '⚠️', desc: 'Users with less than 10 credits remaining' },
                    { value: 'active', label: 'Active users (7 days)', icon: '✅', desc: 'Users who have been active in the last 7 days' }
                  ].map(segment => (
                    <label key={segment.value} className="segment-checkbox" title={segment.desc}>
                      <input 
                        type="checkbox"
                        checked={notification.target.segments?.includes(segment.value) || false}
                        onChange={(e) => {
                          const currentSegments = notification.target.segments || [];
                          const newSegments = e.target.checked
                            ? [...currentSegments, segment.value]
                            : currentSegments.filter(s => s !== segment.value);
                          setNotification({
                            ...notification,
                            target: { ...notification.target, segments: newSegments }
                          });
                        }}
                      />
                      <span className="segment-icon">{segment.icon}</span>
                      <span>{segment.label}</span>
                    </label>
                  ))}
                  {notification.target.segments?.length === 0 && (
                    <p className="segment-warning">⚠️ Please select at least one user group</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA Action */}
          <div className="editor-section">
            <h3>Call-to-Action Settings</h3>
            <div className="form-group">
              <label>Action Type</label>
              <select
                value={notification.ctaAction?.type || 'none'}
                onChange={(e) => setNotification({
                  ...notification,
                  ctaAction: e.target.value === 'none' ? null : { type: e.target.value, url: '', action: '' }
                })}
              >
                <option value="none">No action</option>
                <option value="url">Open URL</option>
                <option value="view">Navigate to view</option>
              </select>
            </div>

            {notification.ctaAction?.type === 'url' && (
              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={notification.ctaAction.url || ''}
                  onChange={(e) => setNotification({
                    ...notification,
                    ctaAction: { ...notification.ctaAction, url: e.target.value }
                  })}
                  placeholder="https://example.com/page"
                />
              </div>
            )}

            {notification.ctaAction?.type === 'view' && (
              <div className="form-group">
                <label>Target View</label>
                <select
                  value={notification.ctaAction.action || ''}
                  onChange={(e) => setNotification({
                    ...notification,
                    ctaAction: { ...notification.ctaAction, action: e.target.value }
                  })}
                >
                  <option value="">Select view...</option>
                  <option value="home">Home</option>
                  <option value="aistudio-editor">AI Studio</option>
                  <option value="workspace">AI Workspace</option>
                  <option value="settings">Settings</option>
                  <option value="upgrade">Upgrade Plan</option>
                </select>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="editor-section">
            <h3>Schedule Sending</h3>
            <div className="form-group">
              <label>Send Time (Optional)</label>
              <input
                type="datetime-local"
                value={notification.scheduledAt}
                onChange={(e) => setNotification({ ...notification, scheduledAt: e.target.value })}
              />
              <small>Leave empty to send immediately when clicking "Send Now"</small>
            </div>

            <div className="form-group">
              <label>Expiration Time (Optional)</label>
              <input
                type="datetime-local"
                value={notification.expiresAt}
                onChange={(e) => setNotification({ ...notification, expiresAt: e.target.value })}
              />
              <small>Notification will auto-hide after this time</small>
            </div>
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button
              className="btn-save"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <img src="/icon/save.svg" alt="Save" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            {notification.scheduledAt && new Date(notification.scheduledAt) > new Date() && (
              <button
                className="btn-schedule"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <img src="/icon/clock.svg" alt="Schedule" />
                {saving ? 'Scheduling...' : 'Schedule'}
              </button>
            )}

            <button
              className="btn-send"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <img src="/icon/send.svg" alt="Send" />
              {saving ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="editor-preview">
            <NotificationPreview notification={notification} language={activeLanguage} />
          </div>
        )}
      </div>
    </div>
  );
}
