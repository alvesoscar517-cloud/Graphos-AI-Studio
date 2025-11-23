import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { exportUsersToCSV } from '../../utils/exportUtils';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import './UserList.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({ limit: 100 });
      setUsers(response.users);
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.name?.toLowerCase().includes(search) ||
      user.id.toLowerCase().includes(search)
    );
  });

  const getTierBadge = (tier) => {
    const badges = {
      free: { label: 'Free', color: '#e0e0e0' },
      premium: { label: 'Premium', color: '#000' },
      enterprise: { label: 'Enterprise', color: '#666' }
    };
    
    const badge = badges[tier] || badges.free;
    
    return (
      <span 
        className="tier-badge" 
        style={{ 
          background: badge.color,
          color: tier === 'free' ? '#666' : '#fff'
        }}
      >
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="user-list">
      <PageHeader
        icon="users.svg"
        title="User Management"
        subtitle="View and manage all users in the system"
        actions={
          <button 
            className="btn-export"
            onClick={() => {
              try {
                exportUsersToCSV(users);
                notify.success('User list exported successfully!');
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

      <div className="list-controls">
        <div className="search-box">
          <img src="/icon/search.svg" alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search by email, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="list-stats">
          <span className="stat-item">
            <strong>{filteredUsers.length}</strong> / {users.length} users
          </span>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Profiles</th>
              <th>Analyses</th>
              <th>Rewrites</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  {searchTerm ? 'No users found' : 'No users yet'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name || 'Unnamed'}</div>
                        <div className="user-id">{user.id.substring(0, 12)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{getTierBadge(user.tier)}</td>
                  <td className="stat-cell">{user.usage?.profilesCount || 0}</td>
                  <td className="stat-cell">{user.usage?.analysesCount || 0}</td>
                  <td className="stat-cell">{user.usage?.rewritesCount || 0}</td>
                  <td className="date-cell">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <img src="/icon/eye.svg" alt="View" />
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
