import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportApi } from '../../services/adminApi';
import { exportSupportToCSV } from '../../utils/exportUtils';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
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
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'New', color: '#2196f3', icon: 'circle-dot.svg' },
      in_progress: { label: 'In Progress', color: '#ff9800', icon: 'clock.svg' },
      resolved: { label: 'Resolved', color: '#4caf50', icon: 'check-circle.svg' },
      closed: { label: 'Closed', color: '#9e9e9e', icon: 'x-circle.svg' }
    };
    
    const badge = badges[status] || badges.open;
    
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        <img src={`/admin/icon/${badge.icon}`} alt={status} />
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
        <img src={`/admin/icon/${badge.icon}`} alt={type} style={{ filter: 'none' }} />
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Low', color: '#4caf50' },
      medium: { label: 'Medium', color: '#ff9800' },
      high: { label: 'High', color: '#f44336' }
    };
    
    const badge = badges[priority] || badges.medium;
    
    return (
      <span className="priority-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="support-list">
      <PageHeader
        icon="headphones.svg"
        title="Support & Feedback Management"
        subtitle="View and handle support requests and feedback from users"
        actions={
          <button 
            className="btn-export"
            onClick={() => {
              try {
                exportSupportToCSV(tickets);
                notify.success('Ticket list exported successfully!');
              } catch (err) {
                notify.error('Export error: ' + err.message);
              }
            }}
          >
            <img src="/admin/icon/download.svg" alt="Export" />
            Export CSV
          </button>
        }
      />

      {statistics && (
        <div className="stats-cards">
          <div className="stat-card">
            <img src="/admin/icon/inbox.svg" alt="Total" />
            <div className="stat-content">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total tickets</div>
            </div>
          </div>
          <div className="stat-card highlight">
            <img src="/admin/icon/circle-dot.svg" alt="Open" />
            <div className="stat-content">
              <div className="stat-value">{statistics.open}</div>
              <div className="stat-label">Open</div>
            </div>
          </div>
          <div className="stat-card">
            <img src="/admin/icon/message-square.svg" alt="Feedback" />
            <div className="stat-content">
              <div className="stat-value">{statistics.feedback}</div>
              <div className="stat-label">Feedback</div>
            </div>
          </div>
          <div className="stat-card">
            <img src="/admin/icon/dollar-sign.svg" alt="Billing" />
            <div className="stat-content">
              <div className="stat-value">{statistics.billing}</div>
              <div className="stat-label">Billing</div>
            </div>
          </div>
        </div>
      )}

      <div className="list-controls">
        <CustomSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'New' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' }
          ]}
          label="Status:"
        />

        <CustomSelect
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'billing_support', label: 'Billing Support' }
          ]}
          label="Type:"
        />

        <div className="list-stats">
          <span className="stat-item">
            <strong>{tickets.length}</strong> tickets
          </span>
        </div>
      </div>

      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Title</th>
              <th>Sender</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  No tickets
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
                        <img src="/admin/icon/message-circle.svg" alt="Replies" />
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
                    {new Date(ticket.createdAt).toLocaleDateString('en-US')}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/support/${ticket.id}`)}
                    >
                      <img src="/admin/icon/eye.svg" alt="View" />
                      View
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
