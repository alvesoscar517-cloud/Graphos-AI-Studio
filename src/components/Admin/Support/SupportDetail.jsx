import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi } from '../../../services/adminApi';
import { useNotify } from '../../Common/NotificationProvider';
import Spinner from '../../Common/Spinner';
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
      notify.error('Lỗi: ' + err.message);
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await supportApi.updateStatus(id, newStatus);
      notify.success('Cập nhật trạng thái thành công!');
      loadTicket();
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      notify.warning('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    try {
      setSending(true);
      await supportApi.reply(id, {
        message: replyMessage,
        sendEmail,
        sendNotification
      });
      notify.success('Gửi phản hồi thành công!');
      setReplyMessage('');
      loadTicket();
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await notify.confirm({
      title: 'Xóa ticket',
      message: 'Bạn có chắc muốn xóa ticket này?\n\nHành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await supportApi.delete(id);
      notify.success('Xóa ticket thành công!');
      navigate('/support');
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Spinner size="large" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!ticket) {
    return <div className="error">Không tìm thấy ticket</div>;
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
          <img src="/icon/arrow-left.svg" alt="Back" />
          Quay lại
        </button>
        <div className="header-title">
          <img src="/icon/headphones.svg" alt="Support" />
          <h1>Chi tiết Ticket #{ticket.id.substring(0, 8)}</h1>
        </div>
      </div>

      <div className="detail-grid">
        {/* Ticket Info Card */}
        <div className="detail-card main-card">
          <div className="card-header">
            <div className="ticket-meta">
              <span className={`type-badge ${ticket.type}`}>
                <img src={`/icon/${ticket.type === 'billing_support' ? 'dollar-sign' : 'message-square'}.svg`} alt={ticket.type} />
                {ticket.type === 'billing_support' ? 'Billing Support' : 'Feedback'}
              </span>
              <span className="priority-badge" style={{ background: ticket.priority === 'high' ? '#f44336' : '#ff9800' }}>
                {ticket.priority === 'high' ? 'Cao' : ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
              </span>
            </div>
            <div className="status-selector">
              <label>Trạng thái:</label>
              <select 
                value={ticket.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ borderColor: getStatusColor(ticket.status) }}
              >
                <option value="open">Mới</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
          </div>

          <h2 className="ticket-title">{ticket.title}</h2>

          <div className="ticket-info">
            <div className="info-row">
              <img src="/icon/user.svg" alt="User" />
              <div>
                <div className="info-label">Người gửi</div>
                <div className="info-value">{ticket.userName}</div>
                <div className="info-sub">{ticket.userEmail}</div>
              </div>
            </div>
            <div className="info-row">
              <img src="/icon/calendar.svg" alt="Date" />
              <div>
                <div className="info-label">Ngày tạo</div>
                <div className="info-value">{new Date(ticket.createdAt).toLocaleString('vi-VN')}</div>
              </div>
            </div>
            {ticket.category && (
              <div className="info-row">
                <img src="/icon/tag.svg" alt="Category" />
                <div>
                  <div className="info-label">Danh mục</div>
                  <div className="info-value">{ticket.category}</div>
                </div>
              </div>
            )}
          </div>

          <div className="ticket-content">
            <h3>Nội dung</h3>
            <p>{ticket.content}</p>
          </div>

          {ticket.images && ticket.images.length > 0 && (
            <div className="ticket-images">
              <h3>Hình ảnh đính kèm</h3>
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

        {/* Actions Card */}
        <div className="detail-card actions-card">
          <h3>Hành động nhanh</h3>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('in_progress')}
              disabled={ticket.status === 'in_progress'}
            >
              <img src="/icon/clock.svg" alt="In Progress" />
              Đang xử lý
            </button>
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('resolved')}
              disabled={ticket.status === 'resolved'}
            >
              <img src="/icon/check-circle.svg" alt="Resolved" />
              Đã giải quyết
            </button>
            <button 
              className="action-btn"
              onClick={() => handleStatusChange('closed')}
              disabled={ticket.status === 'closed'}
            >
              <img src="/icon/x-circle.svg" alt="Closed" />
              Đóng ticket
            </button>
            <button 
              className="action-btn danger"
              onClick={handleDelete}
            >
              <img src="/icon/trash-2.svg" alt="Delete" />
              Xóa ticket
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="detail-card full-width">
          <h3>
            <img src="/icon/message-circle.svg" alt="Replies" />
            Phản hồi ({ticket.replies?.length || 0})
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
                      {new Date(reply.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="reply-content">
                    {reply.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          <form onSubmit={handleReply} className="reply-form">
            <h4>Gửi phản hồi</h4>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Nhập nội dung phản hồi..."
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
                <span>Gửi email cho người dùng</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                />
                <span>Gửi thông báo trong app</span>
              </label>
            </div>

            <button type="submit" className="btn-send" disabled={sending}>
              <img src="/icon/send.svg" alt="Send" />
              {sending ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
