import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './SupportDetail.css';

// Free Google Translate API (unofficial)
async function translateText(text, targetLang) {
  if (!text || !text.trim()) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract translated text from response
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error);
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
  
  // Translation state
  const [translating, setTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [currentTranslateLang, setCurrentTranslateLang] = useState('');
  
  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    loadTicket();
  }, [id]);

  // Reset translation when ticket changes
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
      await supportApi.updateStatus(id, newStatus);
      notify.success('Status updated successfully!');
      loadTicket();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleTranslate = async (targetLang) => {
    if (translating) return;
    
    // If already translated to this language, clear translation
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
      notify.error('Translation failed: ' + err.message);
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
      await supportApi.reply(id, {
        message: replyMessage,
        sendEmail,
        sendNotification
      });
      notify.success('Reply sent successfully!');
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
      message: 'Are you sure you want to delete this ticket?\n\nThis action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await supportApi.delete(id);
      notify.success('Ticket deleted successfully!');
      navigate('/support');
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!ticket) {
    return <div className="error">Ticket not found</div>;
  }

  const getPriorityStyle = (priority) => {
    const styles = {
      low: { bg: '#f5f5f5', color: '#666' },
      medium: { bg: '#e8e8e8', color: '#333' },
      high: { bg: '#000', color: '#fff' }
    };
    return styles[priority] || styles.medium;
  };

  const displayTitle = translatedTitle || ticket.title;
  const displayContent = translatedContent || ticket.content;

  return (
    <div className="support-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/support')}>
          <img src="/icon/arrow-left.svg" alt="Back" />
          Back
        </button>
        <div className="header-title">
          <img src="/icon/headphones.svg" alt="Support" />
          <h1>Ticket Details #{ticket.id.substring(0, 8)}</h1>
        </div>
      </div>

      <div className="detail-grid">
        {/* Main Content Card - Redesigned */}
        <div className="detail-card main-card">
          {/* Compact Header with Meta */}
          <div className="card-header-compact">
            <div className="meta-row">
              <span className={`type-badge ${ticket.type}`}>
                <img src={`/icon/${ticket.type === 'billing_support' ? 'dollar-sign' : 'message-square'}.svg`} alt={ticket.type} />
                {ticket.type === 'billing_support' ? 'Billing' : 'Feedback'}
              </span>
              <span className="priority-badge" style={{ background: getPriorityStyle(ticket.priority).bg, color: getPriorityStyle(ticket.priority).color }}>
                {ticket.priority}
              </span>
              <span className="meta-divider">•</span>
              <span className="meta-info">
                <img src="/icon/user.svg" alt="User" />
                {ticket.userName || 'Anonymous'}
              </span>
              <span className="meta-info">
                <img src="/icon/mail.svg" alt="Email" />
                {ticket.userEmail}
              </span>
              <span className="meta-info">
                <img src="/icon/calendar.svg" alt="Date" />
                {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {ticket.category && (
                <span className="meta-info">
                  <img src="/icon/tag.svg" alt="Category" />
                  {ticket.category}
                </span>
              )}
            </div>
            <div className="status-selector">
              <CustomSelect
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: 'open', label: 'New' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' }
                ]}
                label="Status:"
              />
            </div>
          </div>

          {/* Large Title */}
          <div className="ticket-title-section">
            <h2 className="ticket-title-large">
              {displayTitle}
              {currentTranslateLang && (
                <span className="translated-badge">
                  {currentTranslateLang === 'en' ? '🇬🇧' : '🇻🇳'} Translated
                </span>
              )}
            </h2>
          </div>

          {/* Large Content */}
          <div className="ticket-content-large">
            <div className="content-header">
              <span className="content-label">Message</span>
              <div className="translate-buttons">
                {currentTranslateLang && (
                  <button 
                    className="translate-btn original-btn"
                    onClick={() => {
                      setTranslatedTitle('');
                      setTranslatedContent('');
                      setCurrentTranslateLang('');
                    }}
                    disabled={translating}
                    title="Show original"
                  >
                    ↩ Original
                  </button>
                )}
                <button 
                  className={`translate-btn ${currentTranslateLang === 'en' ? 'active' : ''}`}
                  onClick={() => handleTranslate('en')}
                  disabled={translating || currentTranslateLang === 'en'}
                  title="Translate to English"
                >
                  🇬🇧 English
                </button>
                <button 
                  className={`translate-btn ${currentTranslateLang === 'vi' ? 'active' : ''}`}
                  onClick={() => handleTranslate('vi')}
                  disabled={translating || currentTranslateLang === 'vi'}
                  title="Translate to Vietnamese"
                >
                  🇻🇳 Tiếng Việt
                </button>
                {translating && <span className="translating-indicator">Translating...</span>}
              </div>
            </div>
            <div className="content-body">
              <p>{displayContent}</p>
            </div>
          </div>

          {/* Attached Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div className="ticket-images">
              <h4>Attachments ({ticket.images.length})</h4>
              <div className="images-grid">
                {ticket.images.map((img, index) => (
                  <div 
                    key={index} 
                    className="image-thumbnail"
                    onClick={() => setLightboxImage(img)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setLightboxImage(img)}
                  >
                    <img src={img} alt={`Attachment ${index + 1}`} />
                    <div className="image-overlay">
                      <img src="/icon/zoom-in.svg" alt="View" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="detail-card actions-card">
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('in_progress')}
              disabled={ticket.status === 'in_progress'}
            >
              <img src="/icon/clock.svg" alt="In Progress" />
              In Progress
            </button>
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('resolved')}
              disabled={ticket.status === 'resolved'}
            >
              <img src="/icon/check-circle.svg" alt="Resolved" />
              Resolved
            </button>
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('closed')}
              disabled={ticket.status === 'closed'}
            >
              <img src="/icon/x-circle.svg" alt="Closed" />
              Close ticket
            </button>
            <button 
              className="action-btn danger"
              onClick={handleDelete}
            >
              <img src="/icon/trash-2.svg" alt="Delete" />
              Delete ticket
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="detail-card full-width">
          <h3>
            <img src="/icon/message-circle.svg" alt="Replies" />
            Replies ({ticket.replies?.length || 0})
          </h3>

          {ticket.replies && ticket.replies.length > 0 && (
            <div className="replies-list">
              {ticket.replies.map((reply) => (
                <div key={reply.id} className={`reply-item ${reply.from}`}>
                  <div className="reply-header">
                    <div className="reply-author">
                      <img src={`/icon/${reply.from === 'admin' ? 'shield' : 'user'}.svg`} alt={reply.from} />
                      <span>{reply.from === 'admin' ? 'Admin' : ticket.userName}</span>
                    </div>
                    <div className="reply-time">
                      {new Date(reply.timestamp).toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="reply-content">
                    {reply.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleReply} className="reply-form">
            <h4>Send reply</h4>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Enter reply content..."
              rows="6"
              maxLength="2000"
            />
            <div className="char-count">{replyMessage.length}/2000</div>

            <div className="send-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                <span>Send email to user</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                />
                <span>Send in-app notification</span>
              </label>
            </div>

            <button type="submit" className="btn-send" disabled={sending}>
              <img src="/icon/send.svg" alt="Send" />
              {sending ? 'Sending...' : 'Send reply'}
            </button>
          </form>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="image-lightbox"
          onClick={() => setLightboxImage(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <img src={lightboxImage} alt="Full size attachment" />
            <div className="lightbox-actions">
              <a 
                href={lightboxImage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="lightbox-btn"
              >
                <img src="/icon/external-link.svg" alt="Open" />
                Open in new tab
              </a>
              <a 
                href={lightboxImage} 
                download
                className="lightbox-btn"
              >
                <img src="/icon/download.svg" alt="Download" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
