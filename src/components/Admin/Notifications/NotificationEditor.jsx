import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationsApi } from '../../../services/adminApi';
import { useNotify } from '../../Common/NotificationProvider';
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
      alert('Lỗi: ' + err.message);
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
      alert('Vui lòng nhập nội dung tiếng Việt trước');
      return;
    }

    try {
      setSaving(true);
      
      // Import translation API
      const { translationApi } = await import('../../../services/adminApi');
      
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
      
      alert('Đã dịch tự động thành công!');
    } catch (err) {
      console.error('Translation error:', err);
      alert('Lỗi dịch: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (sendNow = false) => {
    // Validate
    if (!notification.translations.vi.title || !notification.translations.vi.message) {
      alert('Vui lòng nhập tiêu đề và nội dung tiếng Việt');
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        await notificationsApi.update(id, notification);
        if (sendNow) {
          await notificationsApi.send(id);
        }
      } else {
        const response = await notificationsApi.create(notification);
        if (sendNow && response.notificationId) {
          await notificationsApi.send(response.notificationId);
        }
      }

      alert(sendNow ? 'Đã gửi thông báo!' : 'Đã lưu thông báo!');
      navigate('/notifications');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="editor-loading">Đang tải...</div>;
  }

  return (
    <div className="notification-editor">
      <div className="editor-header">
        <div className="header-title">
          <img src={`/icon/${isEditMode ? 'edit' : 'plus'}.svg`} alt={isEditMode ? 'Edit' : 'Create'} />
          <div>
            <h1>{isEditMode ? 'Sửa thông báo' : 'Tạo thông báo mới'}</h1>
            <p>Tạo thông báo đa ngôn ngữ gửi đến người dùng</p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn-preview"
            onClick={() => setShowPreview(!showPreview)}
          >
            <img src="/icon/eye.svg" alt="Preview" />
            {showPreview ? 'Ẩn' : 'Xem'} Preview
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/notifications')}
          >
            <img src="/icon/arrow-left.svg" alt="Back" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-main">
          {/* Type & Priority */}
          <div className="editor-section">
            <h3>Loại thông báo</h3>
            <div className="type-selector">
              {[
                { value: 'info', icon: 'info.svg', label: 'Thông tin', color: '#666' },
                { value: 'success', icon: 'check-circle.svg', label: 'Thành công', color: '#000' },
                { value: 'warning', icon: 'alert-triangle.svg', label: 'Cảnh báo', color: '#999' },
                { value: 'error', icon: 'x-circle.svg', label: 'Lỗi', color: '#000' },
                { value: 'announcement', icon: 'megaphone.svg', label: 'Thông báo', color: '#333' }
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
            <h3>Mức độ ưu tiên</h3>
            <div className="priority-selector">
              {[
                { value: 'low', label: 'Thấp', color: '#ccc' },
                { value: 'medium', label: 'Trung bình', color: '#999' },
                { value: 'high', label: 'Cao', color: '#666' },
                { value: 'urgent', label: 'Khẩn cấp', color: '#000' }
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
              <h3>Nội dung thông báo</h3>
              {activeLanguage !== 'vi' && (
                <button 
                  className="btn-translate"
                  onClick={handleAutoTranslate}
                  disabled={!notification.translations.vi.title || !notification.translations.vi.message}
                  title="Dịch tự động từ tiếng Việt"
                >
                  <img src="/icon/languages.svg" alt="Translate" />
                  Dịch tự động
                </button>
              )}
            </div>
            <div className="language-tabs">
              <button
                className={activeLanguage === 'vi' ? 'active' : ''}
                onClick={() => setActiveLanguage('vi')}
              >
                🇻🇳 Tiếng Việt
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
                <label>Tiêu đề {activeLanguage === 'vi' && <span className="required">*</span>}</label>
                <input
                  type="text"
                  value={notification.translations[activeLanguage].title}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'title', e.target.value)}
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>

              <div className="form-group">
                <label>Nội dung {activeLanguage === 'vi' && <span className="required">*</span>}</label>
                <textarea
                  value={notification.translations[activeLanguage].message}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'message', e.target.value)}
                  placeholder="Nhập nội dung thông báo"
                  rows={6}
                />
              </div>

              <div className="form-group">
                <label>Call-to-Action (Tùy chọn)</label>
                <input
                  type="text"
                  value={notification.translations[activeLanguage].cta}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'cta', e.target.value)}
                  placeholder="Ví dụ: Xem chi tiết, Cập nhật ngay"
                />
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="editor-section">
            <h3>Đối tượng nhận</h3>
            <div className="target-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  checked={notification.target.type === 'all'}
                  onChange={() => setNotification({
                    ...notification,
                    target: { ...notification.target, type: 'all' }
                  })}
                />
                <img src="/icon/users.svg" alt="All users" />
                <span>Tất cả người dùng</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  checked={notification.target.type === 'segment'}
                  onChange={() => setNotification({
                    ...notification,
                    target: { ...notification.target, type: 'segment' }
                  })}
                />
                <img src="/icon/target.svg" alt="Segment" />
                <span>Nhóm người dùng</span>
              </label>

              {notification.target.type === 'segment' && (
                <div className="segment-options">
                  <label>
                    <input type="checkbox" /> Premium users
                  </label>
                  <label>
                    <input type="checkbox" /> Free users
                  </label>
                  <label>
                    <input type="checkbox" /> Inactive users
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div className="editor-section">
            <h3>Lên lịch gửi</h3>
            <div className="form-group">
              <label>Thời gian gửi (Tùy chọn)</label>
              <input
                type="datetime-local"
                value={notification.scheduledAt}
                onChange={(e) => setNotification({ ...notification, scheduledAt: e.target.value })}
              />
              <small>Để trống để gửi ngay khi nhấn "Gửi ngay"</small>
            </div>

            <div className="form-group">
              <label>Thời gian hết hạn (Tùy chọn)</label>
              <input
                type="datetime-local"
                value={notification.expiresAt}
                onChange={(e) => setNotification({ ...notification, expiresAt: e.target.value })}
              />
              <small>Thông báo sẽ tự động ẩn sau thời gian này</small>
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
              {saving ? 'Đang lưu...' : 'Lưu nháp'}
            </button>

            <button
              className="btn-send"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <img src="/icon/send.svg" alt="Send" />
              {saving ? 'Đang gửi...' : 'Gửi ngay'}
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
