import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { exportSupportToCSV } from '../../utils/exportUtils';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './SupportList.css';

export default function SupportList() {
  const { 
    supportTickets: tickets, 
    supportStats: statistics, 
    loading: realtimeLoading, 
    loadSupport,
    setActiveTab 
  } = useRealtime();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();
  const notify = useNotify();
  const loading = realtimeLoading.support;

  useEffect(() => {
    setActiveTab('support');
    loadData();
  }, [filterStatus, filterType]);

  const loadData = async () => {
    try {
      await loadSupport({ status: filterStatus, type: filterType, limit: 100 });
    } catch (err) {
      // Error handled silently
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'New', bg: '#000', color: '#fff', icon: 'circle-dot.svg' },
      in_progress: { label: 'In Progress', bg: '#666', color: '#fff', icon: 'clock.svg' },
      resolved: { label: 'Resolved', bg: '#e8e8e8', color: '#333', icon: 'check-circle.svg' },
      closed: { label: 'Closed', bg: '#f5f5f5', color: '#888', icon: 'x-circle.svg' }
    };
    
    const badge = badges[status] || badges.open;
    
    return (
      <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
        <img src={`/icon/${badge.icon}`} alt={status} />
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      feedback: { label: 'Feedback', icon: 'message-square.svg' },
      billing_support: { label: 'Billing', icon: 'dollar-sign.svg' }
    };
    
    const badge = badges[type] || badges.feedback;
    
    return (
      <span className="type-badge">
        <img src={`/icon/${badge.icon}`} alt={type} />
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Low', bg: '#f5f5f5', color: '#666' },
      medium: { label: 'Medium', bg: '#e8e8e8', color: '#333' },
      high: { label: 'High', bg: '#000', color: '#fff' }
    };
    
    const badge = badges[priority] || badges.medium;
    
    return (
      <span className="priority-badge" style={{ background: badge.bg, color: badge.color }}>
        {badge.label}
      </span>
    );
  };

  if (loading && (!tickets || tickets.length === 0)) {
    return <LoadingScreen />;
  }

  // Filter tickets locally based on current filters
  const filteredTickets = (tickets || []).filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterType !== 'all' && ticket.type !== filterType) return false;
    return true;
  });

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
                exportSupportToCSV(filteredTickets);
                notify.success('Ticket list exported successfully!');
              } catch (err) {
                notify.error('Export error: ' + err.message);
              }
            }}
          >
            <img src="/icon/download.svg" alt="Export" />
            Export CSV
          </button>
        }
      />

      {statistics && (
        <div className="stats-cards">
          <div className="stat-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <div className="stat-content">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total tickets</div>
            </div>
          </div>
          <div className="stat-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
            <div className="stat-content">
              <div className="stat-value">{statistics.open}</div>
              <div className="stat-label">Open</div>
            </div>
          </div>
          <div className="stat-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div className="stat-content">
              <div className="stat-value">{statistics.feedback}</div>
              <div className="stat-label">Feedback</div>
            </div>
          </div>
          <div className="stat-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" x2="12" y1="2" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
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
            <strong>{filteredTickets.length}</strong> tickets
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
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  No tickets
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
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
                    {new Date(ticket.createdAt).toLocaleDateString('en-US')}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/support/${ticket.id}`)}
                      title="View details"
                    >
                      <img src="/icon/eye.svg" alt="View" />
                      <span>View</span>
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
