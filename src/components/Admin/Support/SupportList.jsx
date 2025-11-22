import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportApi } from '../../../services/adminApi';
import { exportSupportToCSV } from '../../../utils/exportUtils';
import { useNotify } from '../../Common/NotificationProvider';
import Spinner from '../../Common/Spinner';
import './SupportList.css';

export default function SupportList() {
  const [tickets, setTickets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        supportApi.getAll({ status: filterStatus, type: filterType, limit: 100 }),
        supportApi.getStatistics()
      ]);
      setTickets(ticketsRes.tickets);
      setStatistics(statsRes.statistics);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'Mới', color: '#2196f3', icon: 'circle-dot.svg' },
      in_progress: { label: 'Đang xử lý', color: '#ff9800', icon: 'clock.svg' },
      resolved: { label: 'Đã giải quyết', color: '#4caf50', icon: 'check-circle.svg' },
      closed: { label: 'Đã đóng', color: '#9e9e9e', icon: 'x-circle.svg' }
    };
    
    const badge = badges[status] || badges.open;
    
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        <img src={`/icon/${badge.icon}`} alt={status} />
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      feedback: { label: 'Feedback', icon: 'message-square.svg', color: '#9c27b0' },
      billing_support: { label: 'Billing', icon: 'dollar-sign.svg', color: '#f44336' }
    };
    
    const badge = badges[type] || badges.feedback;
    
    return (
      <span className="type-badge" style={{ borderColor: badge.color, color: badge.color }}>
        <img src={`/icon/${badge.icon}`} alt={type} style={{ filter: 'none' }} />
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Thấp', color: '#4caf50' },
      medium: { label: 'Trung bình', color: '#ff9800' },
      high: { label: 'Cao', color: '#f44336' }
    };
    
    const badge = badges[priority] || badges.medium;
    
    return (
      <span className="priority-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <Spinner size="large" />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="support-list">
      <div className="list-header">
        <div className="header-title">
          <img src="/icon/headphones.svg" alt="Support" />
          <div>
            <h1>Quản lý Support & Feedback</h1>
            <p>Xem và xử lý các yêu cầu hỗ trợ và feedback từ người dùng</p>
          </div>
        </div>
        
        <button 
          className="btn-export"
          onClick={() => {
            try {
              exportSupportToCSV(tickets);
              notify.success('Đã export danh sách tickets!');
            } catch (err) {
              notify.error('Lỗi export: ' + err.message);
            }
          }}
        >
          <img src="/icon/download.svg" alt="Export" />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="stats-cards">
          <div className="stat-card">
            <img src="/icon/inbox.svg" alt="Total" />
            <div className="stat-content">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Tổng tickets</div>
            </div>
          </div>
          <div className="stat-card highlight">
            <img src="/icon/circle-dot.svg" alt="Open" />
            <div className="stat-content">
              <div className="stat-value">{statistics.open}</div>
              <div className="stat-label">Đang mở</div>
            </div>
          </div>
          <div className="stat-card">
            <img src="/icon/message-square.svg" alt="Feedback" />
            <div className="stat-content">
              <div className="stat-value">{statistics.feedback}</div>
              <div className="stat-label">Feedback</div>
            </div>
          </div>
          <div className="stat-card">
            <img src="/icon/dollar-sign.svg" alt="Billing" />
            <div className="stat-content">
              <div className="stat-value">{statistics.billing}</div>
              <div className="stat-label">Billing</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="list-controls">
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="open">Mới</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Loại:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="feedback">Feedback</option>
            <option value="billing_support">Billing Support</option>
          </select>
        </div>

        <div className="list-stats">
          <span className="stat-item">
            <strong>{tickets.length}</strong> tickets
          </span>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại</th>
              <th>Tiêu đề</th>
              <th>Người gửi</th>
              <th>Độ ưu tiên</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  Không có tickets nào
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} className={ticket.status === 'open' ? 'unread' : ''}>
                  <td className="ticket-id">#{ticket.id.substring(0, 8)}</td>
                  <td>{getTypeBadge(ticket.type)}</td>
                  <td className="ticket-title">
                    <div className="title-content">{ticket.title}</div>
                    {ticket.replies && ticket.replies.length > 0 && (
                      <span className="reply-count">
                        <img src="/icon/message-circle.svg" alt="Replies" />
                        {ticket.replies.length}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="user-info-mini">
                      <div className="user-name">{ticket.userName}</div>
                      <div className="user-email">{ticket.userEmail}</div>
                    </div>
                  </td>
                  <td>{getPriorityBadge(ticket.priority)}</td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td className="date-cell">
                    {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/support/${ticket.id}`)}
                    >
                      <img src="/icon/eye.svg" alt="View" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
