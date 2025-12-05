import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { cn } from '@/lib/utils';

const SUPPORTED_LANGUAGES = [
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
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
    expiresAt: '',
    ctaAction: null
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
          title: notif.translations?.en?.title || '',
          message: notif.translations?.en?.message || '',
          cta: notif.translations?.en?.cta || ''
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
            } catch {
              translations[lang] = translations.en;
            }
          }
        } catch {
          notify.warning('Translation failed, using English');
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

      if (isEditMode) {
        await notificationsApi.update(id, notificationData);
        if (sendNow) await notificationsApi.send(id);
      } else {
        const response = await notificationsApi.create(notificationData);
        if (sendNow && response.notificationId) await notificationsApi.send(response.notificationId);
      }

      notify.success(sendNow ? 'Notification sent!' : 'Notification saved!');
      navigate('/notifications');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSaving(false);
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-surface-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-secondary rounded-xl flex items-center justify-center">
            <img src={`/icon/${isEditMode ? 'edit' : 'bell'}.svg`} alt="" className="w-6 h-6 icon-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              {isEditMode ? 'Edit Notification' : 'New Notification'}
            </h1>
            <p className="text-sm text-muted mt-1">Write in English, auto-translate to selected languages</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/notifications')}>
          <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary mb-4">🇬🇧 Content (English)</h3>
            <div className="space-y-4">
              <Input
                label="Title"
                value={notification.content.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Notification title"
              />
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-primary">Message</label>
                <textarea
                  value={notification.content.message}
                  onChange={(e) => handleContentChange('message', e.target.value)}
                  placeholder="Notification message"
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-primary resize-y"
                />
              </div>
              <Input
                label="CTA Button (Optional)"
                value={notification.content.cta}
                onChange={(e) => handleContentChange('cta', e.target.value)}
                placeholder="E.g.: View Details"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary mb-4">Target Audience</h3>
            <div className="flex gap-3 mb-4">
              {[
                { type: 'all', icon: 'users.svg', label: 'All Users' },
                { type: 'segment', icon: 'target.svg', label: 'Segments' }
              ].map(opt => (
                <button
                  key={opt.type}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                    notification.target.type === opt.type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  )}
                  onClick={() => setNotification({ ...notification, target: { type: opt.type, segments: [] } })}
                >
                  <img src={`/icon/${opt.icon}`} alt="" className="w-5 h-5 icon-dark" />
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            {notification.target.type === 'segment' && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'new', label: 'New users (< 7 days)' },
                  { value: 'active', label: 'Active (7 days)' },
                  { value: 'inactive', label: 'Inactive (30+ days)' },
                  { value: 'low_credits', label: 'Low credits (< 10)' },
                  { value: 'has_profile', label: 'Has voice profile' },
                  { value: 'no_profile', label: 'No voice profile' }
                ].map(seg => (
                  <label key={seg.value} className="flex items-center gap-2 p-3 rounded-lg bg-surface-secondary cursor-pointer hover:bg-border transition-colors">
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
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{seg.label}</span>
                  </label>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary mb-4">Auto-Translate To</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <label 
                  key={lang.code} 
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all",
                    notification.targetLanguages?.includes(lang.code)
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-surface-secondary border-2 border-transparent hover:border-border"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={notification.targetLanguages?.includes(lang.code) || false}
                    onChange={() => toggleLanguage(lang.code)}
                    className="sr-only"
                  />
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary mb-4">Type & Priority</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted mb-2 block">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'info', icon: 'info.svg' },
                    { value: 'success', icon: 'check-circle.svg' },
                    { value: 'warning', icon: 'alert-triangle.svg' },
                    { value: 'error', icon: 'x-circle.svg' },
                    { value: 'announcement', icon: 'megaphone.svg' }
                  ].map(type => (
                    <button
                      key={type.value}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                        notification.type === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      )}
                      onClick={() => setNotification({ ...notification, type: type.value })}
                    >
                      <img src={`/icon/${type.icon}`} alt="" className="w-5 h-5 icon-dark" />
                      <span className="text-xs capitalize">{type.value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted mb-2 block">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button
                      key={p}
                      className={cn(
                        "py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                        notification.priority === p
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      )}
                      onClick={() => setNotification({ ...notification, priority: p })}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary mb-4">CTA Action</h3>
            <Select
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
            {notification.ctaAction?.type === 'url' && (
              <Input
                type="url"
                value={notification.ctaAction.url || ''}
                onChange={(e) => setNotification({
                  ...notification,
                  ctaAction: { ...notification.ctaAction, url: e.target.value }
                })}
                placeholder="https://..."
                containerClassName="mt-3"
              />
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary mb-4">Schedule</h3>
            <div className="space-y-4">
              <Input
                label="Send Time"
                type="datetime-local"
                value={notification.scheduledAt}
                onChange={(e) => setNotification({ ...notification, scheduledAt: e.target.value })}
              />
              <Input
                label="Expires At"
                type="datetime-local"
                value={notification.expiresAt}
                onChange={(e) => setNotification({ ...notification, expiresAt: e.target.value })}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
        <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving} loading={saving}>
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving || translating} loading={saving || translating}>
          {`Send Now${notification.targetLanguages?.length > 0 ? ` (+${notification.targetLanguages.length})` : ''}`}
        </Button>
      </div>
    </div>
  );
}
