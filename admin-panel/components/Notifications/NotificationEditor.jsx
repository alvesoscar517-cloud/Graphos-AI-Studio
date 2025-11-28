import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import CustomSelect from '../Common/CustomSelect';
import './NotificationEditor.css';

// Supported languages for translation
const SUPPORTED_LANGUAGES = [
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
];

export default function NotificationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const isEditMode = !!id;

  const [notification, setNotification] = useState({
    type: 'info',
    priority: 'medium',
    content: { title: '', message: '', cta: '' },
    targetLanguages: ['vi'],
    translations: {},
    target: { type: 'all', userIds: [], segments: [] },
    scheduledAt: '',
    expiresAt: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (isEditMode) loadNotification();
  }, [id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll({ limit: 100 });
      const notif = response.notifications.find(n => n.id === id);
      if (notif) {
        const content = notif.content || notif.translations?.en || {
          title: notif.translations?.en?.title || notif.translations?.vi?.title || '',
          message: notif.translations?.en?.message || notif.translations?.vi?.message || '',
          cta: notif.translations?.en?.cta || notif.translations?.vi?.cta || ''
        };
        const existingLangs = Object.keys(notif.translations || {}).filter(l => l !== 'en');
        setNotification({
          ...notif,
          content,
          targetLanguages: existingLangs.length > 0 ? existingLangs : ['vi'],
          scheduledAt: notif.scheduledAt || '',
          expiresAt: notif.expiresAt || ''
        });
      }
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (field, value) => {
    setNotification(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  const toggleLanguage = (langCode) => {
    setNotification(prev => {
      const current = prev.targetLanguages || [];
      return {
        ...prev,
        targetLanguages: current.includes(langCode)
          ? current.filter(l => l !== langCode)
          : [...current, langCode]
      };
    });
  };

  const handleSave = async (sendNow = false) => {
    if (!notification.content.title || !notification.content.message) {
      notify.error('Please enter title and content');
      return;
    }
    if (notification.target.type === 'segment' && (!notification.target.segments || notification.target.segments.length === 0)) {
      notify.error('Please select at least one user group');
      return;
    }

    try {
      setSaving(true);
      const translations = {
        en: {
          title: notification.content.title,
          message: notification.content.message,
          cta: notification.content.cta || ''
        }
      };

      if (sendNow && notification.targetLanguages.length > 0) {
        setTranslating(true);
        try {
          const { translationApi } = await import('../../services/adminApi');
          for (const lang of notification.targetLanguages) {
            try {
              const titleRes = await translationApi.translate(notification.content.title, 'en', lang);
              const messageRes = await translationApi.translate(notification.content.message, 'en', lang);
              let ctaTranslation = '';
              if (notification.content.cta) {
                const ctaRes = await translationApi.translate(notification.content.cta, 'en', lang);
                ctaTranslation = ctaRes.translations?.[lang] || notification.content.cta;
              }
              translations[lang] = {
                title: titleRes.translations?.[lang] || notification.content.title,
                message: messageRes.translations?.[lang] || notification.content.message,
                cta: ctaTranslation
              };
            } catch (langErr) {
              translations[lang] = translations.en;
            }
          }
        } catch (err) {
          notify.warning('Translation failed, using English for all languages');
        } finally {
          setTranslating(false);
        }
      }

      const notificationData = {
        type: notification.type,
        priority: notification.priority,
        translations,
        targetLanguages: notification.targetLanguages,
        target: notification.target,
        scheduledAt: notification.scheduledAt || null,
        expiresAt: notification.expiresAt || null,
        ctaAction: notification.ctaAction || null
      };

      const isScheduled = notification.scheduledAt && new Date(notification.scheduledAt) > new Date();

      if (isEditMode) {
        await notificationsApi.update(id, notificationData);
        if (sendNow) await notificationsApi.send(id);
        else if (isScheduled) await notificationsApi.schedule(id, notification.scheduledAt);
      } else {
        const response = await notificationsApi.create(notificationData);
        if (sendNow && response.notificationId) await notificationsApi.send(response.notificationId);
      }

      notify.success(sendNow ? 'Notification sent!' : isScheduled ? 'Notification scheduled!' : 'Notification saved!');
      navigate('/notifications');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSaving(false);
      setTranslating(false);
    }
  };

  if (loading) return <div className="editor-loading">Loading...</div>;

  return (
    <div className="notification-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <img src={`/icon/${isEditMode ? 'edit' : 'bell'}.svg`} alt="" />
          </div>
          <div>
            <h1>{isEditMode ? 'Edit Notification' : 'New Notification'}</h1>
            <p>Write in English, auto-translate to selected languages</p>
          </div>
        </div>
        <button className="btn-back" onClick={() => navigate('/notifications')}>
          <img src="/icon/arrow-left.svg" alt="Back" /> Back
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="editor-grid">
        {/* Left Column - Content */}
        <div className="editor-col-left">
          <div className="editor-card">
            <h3>🇬🇧 Content (English)</h3>
            <div className="form-group">
              <label>Title <span className="required">*</span></label>
              <input
                type="text"
                value={notification.content.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Notification title"
              />
            </div>
            <div className="form-group">
              <label>Message <span className="required">*</span></label>
              <textarea
                value={notification.content.message}
                onChange={(e) => handleContentChange('message', e.target.value)}
                placeholder="Notification message"
                rows={10}
              />
            </div>
            <div className="form-group">
              <label>CTA Button (Optional)</label>
              <input
                type="text"
                value={notification.content.cta}
                onChange={(e) => handleContentChange('cta', e.target.value)}
                placeholder="E.g.: View Details"
              />
            </div>
          </div>

          <div className="editor-card">
            <h3>Target Audience</h3>
            <div className="target-options-horizontal">
              <label className={`target-option-h ${notification.target.type === 'all' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="target-type"
                  checked={notification.target.type === 'all'}
                  onChange={() => setNotification({ ...notification, target: { type: 'all', segments: [] } })}
                />
                <div className="option-content">
                  <img src="/icon/users.svg" alt="" />
                  <span>All Users</span>
                </div>
              </label>
              <label className={`target-option-h ${notification.target.type === 'segment' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="target-type"
                  checked={notification.target.type === 'segment'}
                  onChange={() => setNotification({ ...notification, target: { type: 'segment', segments: [] } })}
                />
                <div className="option-content">
                  <img src="/icon/target.svg" alt="" />
                  <span>Segments</span>
                </div>
              </label>
            </div>
            {notification.target.type === 'segment' && (
              <div className="segment-list">
                {[
                  { value: 'new', label: 'New users (< 7 days)' },
                  { value: 'active', label: 'Active (7 days)' },
                  { value: 'inactive', label: 'Inactive (30+ days)' },
                  { value: 'low_credits', label: 'Low credits (< 10)' },
                  { value: 'has_profile', label: 'Has voice profile' },
                  { value: 'no_profile', label: 'No voice profile' }
                ].map(seg => (
                  <label key={seg.value} className="segment-item">
                    <input
                      type="checkbox"
                      checked={notification.target.segments?.includes(seg.value) || false}
                      onChange={(e) => {
                        const segs = notification.target.segments || [];
                        setNotification({
                          ...notification,
                          target: {
                            ...notification.target,
                            segments: e.target.checked ? [...segs, seg.value] : segs.filter(s => s !== seg.value)
                          }
                        });
                      }}
                    />
                    <span>{seg.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="editor-card">
            <h3>Auto-Translate To</h3>
            <div className="language-grid">
              {SUPPORTED_LANGUAGES.map(lang => (
                <label 
                  key={lang.code} 
                  className={`lang-item ${notification.targetLanguages?.includes(lang.code) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={notification.targetLanguages?.includes(lang.code) || false}
                    onChange={() => toggleLanguage(lang.code)}
                  />
                  <span className="lang-flag">{lang.flag}</span>
                  <span>{lang.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="editor-col-right">
          <div className="editor-card">
            <h3>Type & Priority</h3>
            <div className="form-group">
              <label>Type</label>
              <div className="type-grid">
                {[
                  { value: 'info', icon: 'info.svg', label: 'Info' },
                  { value: 'success', icon: 'check-circle.svg', label: 'Success' },
                  { value: 'warning', icon: 'alert-triangle.svg', label: 'Warning' },
                  { value: 'error', icon: 'x-circle.svg', label: 'Error' },
                  { value: 'announcement', icon: 'megaphone.svg', label: 'Announce' }
                ].map(type => (
                  <button
                    key={type.value}
                    className={`type-btn ${notification.type === type.value ? 'active' : ''}`}
                    onClick={() => setNotification({ ...notification, type: type.value })}
                  >
                    <img src={`/icon/${type.icon}`} alt="" />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <div className="priority-grid">
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <button
                    key={p}
                    className={`priority-btn ${notification.priority === p ? 'active' : ''}`}
                    onClick={() => setNotification({ ...notification, priority: p })}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="editor-card">
            <h3>CTA Action</h3>
            <div className="form-group">
              <CustomSelect
                value={notification.ctaAction?.type || 'none'}
                onChange={(e) => setNotification({
                  ...notification,
                  ctaAction: e.target.value === 'none' ? null : { type: e.target.value, url: '', action: '' }
                })}
                options={[
                  { value: 'none', label: 'No action' },
                  { value: 'url', label: 'Open URL' },
                  { value: 'view', label: 'Navigate to view' }
                ]}
              />
            </div>
            {notification.ctaAction?.type === 'url' && (
              <div className="form-group">
                <input
                  type="url"
                  value={notification.ctaAction.url || ''}
                  onChange={(e) => setNotification({
                    ...notification,
                    ctaAction: { ...notification.ctaAction, url: e.target.value }
                  })}
                  placeholder="https://..."
                />
              </div>
            )}
            {notification.ctaAction?.type === 'view' && (
              <div className="form-group">
                <CustomSelect
                  value={notification.ctaAction.action || ''}
                  onChange={(e) => setNotification({
                    ...notification,
                    ctaAction: { ...notification.ctaAction, action: e.target.value }
                  })}
                  options={[
                    { value: '', label: 'Select view...' },
                    { value: 'home', label: 'Home' },
                    { value: 'workspace', label: 'AI Workspace' },
                    { value: 'settings', label: 'Settings' },
                    { value: 'upgrade', label: 'Upgrade' }
                  ]}
                />
              </div>
            )}
          </div>

          <div className="editor-card">
            <h3>Schedule (Optional)</h3>
            <div className="form-group">
              <label>Send Time</label>
              <input
                type="datetime-local"
                value={notification.scheduledAt}
                onChange={(e) => setNotification({ ...notification, scheduledAt: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Expires At</label>
              <input
                type="datetime-local"
                value={notification.expiresAt}
                onChange={(e) => setNotification({ ...notification, expiresAt: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="editor-footer">
        <button className="btn-draft" onClick={() => handleSave(false)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button className="btn-send" onClick={() => handleSave(true)} disabled={saving || translating}>
          {translating ? 'Translating...' : saving ? 'Sending...' : `Send Now${notification.targetLanguages?.length > 0 ? ` (+${notification.targetLanguages.length})` : ''}`}
        </button>
      </div>
    </div>
  );
}
