import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';
import { cn } from '@/lib/utils';

async function translateText(text, targetLang) {
  if (!text?.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data?.[0]) return data[0].map(item => item[0]).join('');
    return text;
  } catch {
    throw new Error('Translation failed');
  }
}

export default function SupportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [sending, setSending] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [currentTranslateLang, setCurrentTranslateLang] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { loadTicket(); }, [id]);
  useEffect(() => {
    setTranslatedTitle('');
    setTranslatedContent('');
    setCurrentTranslateLang('');
  }, [ticket?.id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await supportApi.getById(id);
      setTicket(response.ticket);
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await supportApi.updateStatus(id, newStatus);
      notify.success('Status updated!');
      loadTicket();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTranslate = async (targetLang) => {
    if (translating) return;
    if (currentTranslateLang === targetLang) {
      setTranslatedTitle('');
      setTranslatedContent('');
      setCurrentTranslateLang('');
      return;
    }
    try {
      setTranslating(true);
      const [titleResult, contentResult] = await Promise.all([
        translateText(ticket.title, targetLang),
        translateText(ticket.content, targetLang)
      ]);
      setTranslatedTitle(titleResult);
      setTranslatedContent(contentResult);
      setCurrentTranslateLang(targetLang);
      notify.success(`Translated to ${targetLang === 'en' ? 'English' : 'Vietnamese'}`);
    } catch (err) {
      notify.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      notify.warning('Please enter reply content!');
      return;
    }
    try {
      setSending(true);
      const result = await supportApi.reply(id, { message: replyMessage, sendEmail, sendNotification });
      
      // Show success with any warnings
      if (result.warnings && result.warnings.length > 0) {
        notify.warning(`Reply sent with warnings: ${result.warnings.join('; ')}`);
      } else {
        let successMsg = 'Reply sent!';
        if (sendEmail && result.emailSent) successMsg += ' Email delivered.';
        if (sendNotification && result.notificationSent) successMsg += ' Notification sent.';
        notify.success(successMsg);
      }
      
      setReplyMessage('');
      loadTicket();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await notify.confirm({
      title: 'Delete ticket',
      message: 'Are you sure? This cannot be undone.',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      setDeleting(true);
      await supportApi.delete(id);
      notify.success('Deleted!');
      navigate('/support');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!ticket) return <div className="p-6 text-center text-muted">Ticket not found</div>;

  const displayTitle = translatedTitle || ticket.title;
  const displayContent = translatedContent || ticket.content;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/support')}>
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-secondary rounded-lg flex items-center justify-center">
              <img src="/icon/headphones.svg" alt="" className="w-5 h-5 icon-dark" />
            </div>
            <h1 className="text-xl font-semibold text-primary">Ticket #{ticket.id.substring(0, 8)}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-border">
              <Badge variant={ticket.type === 'billing_support' ? 'warning' : 'info'}>
                {ticket.type === 'billing_support' ? 'Billing' : 'Feedback'}
              </Badge>
              <Badge variant={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'default'}>
                {ticket.priority}
              </Badge>
              <span className="text-xs text-muted flex items-center gap-1">
                <img src="/icon/user.svg" alt="" className="w-3 h-3" />
                {ticket.userName || 'Anonymous'}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <img src="/icon/mail.svg" alt="" className="w-3 h-3" />
                {ticket.userEmail}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <img src="/icon/calendar.svg" alt="" className="w-3 h-3" />
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-primary mb-4">
              {displayTitle}
              {currentTranslateLang && (
                <span className="ml-2 text-xs font-normal text-info">
                  {currentTranslateLang === 'en' ? '🇬🇧' : '🇻🇳'} Translated
                </span>
              )}
            </h2>

            {/* Content */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted uppercase">Message</span>
                <div className="flex gap-2">
                  {currentTranslateLang && (
                    <button className="text-xs text-muted hover:text-primary" onClick={() => { setTranslatedTitle(''); setTranslatedContent(''); setCurrentTranslateLang(''); }}>
                      ↩ Original
                    </button>
                  )}
                  <button className={cn("text-xs px-2 py-1 rounded", currentTranslateLang === 'en' ? "bg-primary text-white" : "bg-surface-secondary hover:bg-border")} onClick={() => handleTranslate('en')} disabled={translating}>
                    🇬🇧 EN
                  </button>
                  <button className={cn("text-xs px-2 py-1 rounded", currentTranslateLang === 'vi' ? "bg-primary text-white" : "bg-surface-secondary hover:bg-border")} onClick={() => handleTranslate('vi')} disabled={translating}>
                    🇻🇳 VI
                  </button>
                </div>
              </div>
              <div className="p-4 bg-surface-secondary rounded-lg text-sm text-primary leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </div>
            </div>

            {/* Images */}
            {ticket.images?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary mb-2">Attachments ({ticket.images.length})</h4>
                <div className="flex gap-2 flex-wrap">
                  {ticket.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer relative group" onClick={() => setLightboxImage(img)}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <img src="/icon/zoom-in.svg" alt="" className="w-6 h-6 icon-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Replies */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <img src="/icon/message-circle.svg" alt="" className="w-5 h-5 icon-dark" />
              Replies ({ticket.replies?.length || 0})
            </h3>

            {ticket.replies?.length > 0 && (
              <div className="space-y-4 mb-6">
                {ticket.replies.map((reply) => (
                  <div key={reply.id} className={cn("p-4 rounded-lg", reply.from === 'admin' ? "bg-surface-secondary" : "bg-surface-tertiary")}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <img src={`/icon/${reply.from === 'admin' ? 'shield' : 'user'}.svg`} alt="" className="w-4 h-4" />
                        {reply.from === 'admin' ? 'Admin' : ticket.userName}
                      </div>
                      <span className="text-xs text-muted">{new Date(reply.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-secondary">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleReply}>
              <h4 className="text-sm font-medium text-primary mb-2">Send reply</h4>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Enter reply..."
                rows={4}
                maxLength={2000}
                className="w-full p-3 border border-border/50 bg-surface-secondary rounded-lg text-sm resize-none focus:outline-none focus:bg-surface transition-colors"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="w-4 h-4" />
                    Send email
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} className="w-4 h-4" />
                    In-app notification
                  </label>
                </div>
                <Button type="submit" loading={sending}>
                  <img src="/icon/send.svg" alt="" className="w-4 h-4 icon-white" />
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-primary mb-4">Status</h3>
            <Select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={[
                { value: 'open', label: 'New' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' }
              ]}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-primary mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => handleStatusChange('in_progress')} disabled={ticket.status === 'in_progress' || updatingStatus} loading={updatingStatus}>
                <img src="/icon/clock.svg" alt="" className="w-4 h-4 icon-dark" /> In Progress
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => handleStatusChange('resolved')} disabled={ticket.status === 'resolved' || updatingStatus} loading={updatingStatus}>
                <img src="/icon/check-circle.svg" alt="" className="w-4 h-4 icon-dark" /> Resolved
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => handleStatusChange('closed')} disabled={ticket.status === 'closed' || updatingStatus} loading={updatingStatus}>
                <img src="/icon/x-circle.svg" alt="" className="w-4 h-4 icon-dark" /> Close
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={handleDelete} disabled={deleting} loading={deleting}>
                <img src="/icon/trash-2.svg" alt="" className="w-4 h-4 icon-white" /> Delete
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute -top-10 right-0 text-white text-2xl" onClick={() => setLightboxImage(null)}>✕</button>
            <img src={lightboxImage} alt="" className="max-w-full max-h-[80vh] rounded-lg" />
            <div className="flex gap-3 mt-4 justify-center">
              <a href={lightboxImage} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20">
                Open in new tab
              </a>
              <a href={lightboxImage} download className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20">
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
