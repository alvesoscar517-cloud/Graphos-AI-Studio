import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './SupportDetail.css';

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

  useEffect(() => {
    loadTicket();
  }, [id]);

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

  const getStatusColor = (status) => {
    const colors = {
      open: '#2196f3',
      in_progress: '#ff9800',
      resolved: '#4caf50',
      closed: '#9e9e9e'
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="support-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/support')}>
          <img src="/admin/icon/arrow-left.svg" alt="Back" />
          Back
        </button>
        <div className="header-title">
          <img src="/admin/icon/headphones.svg" alt="Support" />
          <h1>Ticket Details #{ticket.id.substring(0, 8)}</h1>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card main-card">
          <div className="card-header">
            <div className="ticket-meta">
              <span className={`type-badge ${ticket.type}`}>
                <img src={`/admin/icon/${ticket.type === 'billing_support' ? 'dollar-sign' : 'message-square'}.svg`} alt={ticket.type} />
                {ticket.type === 'billing_support' ? 'Billing Support' : 'Feedback'}
              </span>
              <span className="priority-badge" style={{ background: ticket.priority === 'high' ? '#f44336' : '#ff9800' }}>
                {ticket.priority === 'high' ? 'High' : ticket.priority === 'medium' ? 'Medium' : 'Low'}
              </span>
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

          <h2 className="ticket-title">{ticket.title}</h2>

          <div className="ticket-info">
            <div className="info-row">
              <img src="/admin/icon/user.svg" alt="User" />
              <div>
                <div className="info-label">Sender</div>
                <div className="info-value">{ticket.userName}</div>
                <div className="info-sub">{ticket.userEmail}</div>
              </div>
            </div>
            <div className="info-row">
              <img src="/admin/icon/calendar.svg" alt="Date" />
              <div>
                <div className="info-label">Created</div>
                <div className="info-value">{new Date(ticket.createdAt).toLocaleString('en-US')}</div>
              </div>
            </div>
            {ticket.category && (
              <div className="info-row">
                <img src="/admin/icon/tag.svg" alt="Category" />
                <div>
                  <div className="info-label">Category</div>
                  <div className="info-value">{ticket.category}</div>
                </div>
              </div>
            )}
          </div>

          <div className="ticket-content">
            <h3>Content</h3>
            <p>{ticket.content}</p>
          </div>

          {ticket.images && ticket.images.length > 0 && (
            <div className="ticket-images">
              <h3>Attached images</h3>
              <div className="images-grid">
                {ticket.images.map((img, index) => (
                  <a key={index} href={img} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt={`Attachment ${index + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-card actions-card">
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('in_progress')}
              disabled={ticket.status === 'in_progress'}
            >
              <img src="/admin/icon/clock.svg" alt="In Progress" />
              In Progress
            </button>
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('resolved')}
              disabled={ticket.status === 'resolved'}
            >
              <img src="/admin/icon/check-circle.svg" alt="Resolved" />
              Resolved
            </button>
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('closed')}
              disabled={ticket.status === 'closed'}
            >
              <img src="/admin/icon/x-circle.svg" alt="Closed" />
              Close ticket
            </button>
            <button 
              className="action-btn danger"
              onClick={handleDelete}
            >
              <img src="/admin/icon/trash-2.svg" alt="Delete" />
              Delete ticket
            </button>
          </div>
        </div>

        <div className="detail-card full-width">
          <h3>
            <img src="/admin/icon/message-circle.svg" alt="Replies" />
            Replies ({ticket.replies?.length || 0})
          </h3>

          {ticket.replies && ticket.replies.length > 0 && (
            <div className="replies-list">
              {ticket.replies.map((reply) => (
                <div key={reply.id} className={`reply-item ${reply.from}`}>
                  <div className="reply-header">
                    <div className="reply-author">
                      <img src={`/admin/icon/${reply.from === 'admin' ? 'shield' : 'user'}.svg`} alt={reply.from} />
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
              <img src="/admin/icon/send.svg" alt="Send" />
              {sending ? 'Sending...' : 'Send reply'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
