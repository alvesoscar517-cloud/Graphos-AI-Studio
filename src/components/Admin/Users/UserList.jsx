import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../../services/adminApi';
import './UserList.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({ limit: 100 });
      setUsers(response.users);
    } catch (err) {
      console.error('Load users error:', err);
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
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="user-list">
      <div className="list-header">
        <div className="header-title">
          <img src="/icon/users.svg" alt="Users" />
          <div>
            <h1>Quản lý người dùng</h1>
            <p>Xem và quản lý tất cả người dùng trong hệ thống</p>
          </div>
        </div>
      </div>

      <div className="list-controls">
        <div className="search-box">
          <img src="/icon/search.svg" alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo email, tên, hoặc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="list-stats">
          <span className="stat-item">
            <strong>{filteredUsers.length}</strong> / {users.length} người dùng
          </span>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Gói</th>
              <th>Profiles</th>
              <th>Phân tích</th>
              <th>Viết lại</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  {searchTerm ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
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
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/users/${user.id}`)}
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
