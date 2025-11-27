import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './UserList.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const navigate = useNavigate();
  const notify = useNotify();

  const loadUsers = useCallback(async (resetOffset = false) => {
    try {
      setLoading(true);
      const offset = resetOffset ? 0 : pagination.offset;
      
      const response = await usersApi.getAllAdvanced({
        limit: pagination.limit,
        offset,
        search: searchTerm,
        status: filters.status,
        ...sortConfig
      });
      
      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        ...response.pagination,
        offset
      }));
    } catch (err) {
      notify.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, pagination.limit, pagination.offset, sortConfig]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadUsers(true);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, filters, sortConfig]);

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
    loadUsers();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkLock = async (locked) => {
    if (selectedUsers.length === 0) {
      notify.warning('Please select users first');
      return;
    }

    const confirmed = await notify.confirm({
      title: locked ? 'Lock Users' : 'Unlock Users',
      message: `Are you sure you want to ${locked ? 'lock' : 'unlock'} ${selectedUsers.length} users?`,
      confirmText: locked ? 'Lock' : 'Unlock',
      type: 'warning'
    });

    if (!confirmed) return;

    try {
      await usersApi.bulkLock(selectedUsers, locked, 'Bulk action by admin');
      notify.success(`Successfully ${locked ? 'locked' : 'unlocked'} ${selectedUsers.length} users`);
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      notify.warning('Please select users first');
      return;
    }

    const confirmed = await notify.confirm({
      title: 'Delete Users',
      message: `Are you sure you want to DELETE ${selectedUsers.length} users?\n\nThis action cannot be undone!`,
      confirmText: 'Delete',
      type: 'danger'
    });

    if (!confirmed) return;

    const confirmation = await notify.prompt({
      title: 'Confirm Deletion',
      message: 'Type "DELETE" to confirm:',
      placeholder: 'DELETE',
      confirmText: 'Delete'
    });

    if (confirmation !== 'DELETE') {
      notify.warning('Incorrect confirmation');
      return;
    }

    try {
      await usersApi.bulkDelete(selectedUsers);
      notify.success(`Successfully deleted ${selectedUsers.length} users`);
      setSelectedUsers([]);
      loadUsers(true);
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        const response = await usersApi.export('csv');
        // Download CSV
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const response = await usersApi.export('json');
        const blob = new Blob([JSON.stringify(response.users, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      notify.success('Export successful!');
    } catch (err) {
      notify.error('Export failed: ' + err.message);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getCreditsBadge = (credits) => {
    const balance = credits?.balance || 0;
    let color, bgColor;
    if (balance === 0) {
      color = '#dc2626';
      bgColor = '#fef2f2';
    } else if (balance <= 50) {
      color = '#d97706';
      bgColor = '#fffbeb';
    } else if (balance <= 200) {
      color = '#2563eb';
      bgColor = '#eff6ff';
    } else {
      color = '#16a34a';
      bgColor = '#f0fdf4';
    }
    return (
      <span className="credits-badge" style={{ background: bgColor, color }}>
        {balance}
      </span>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  if (loading && users.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="user-list">
      <PageHeader
        icon="users.svg"
        title="User Management"
        subtitle={`${pagination.total} total users`}
        actions={
          <div className="header-actions">
            <button className="btn-export" onClick={() => handleExport('csv')}>
              <img src="/icon/download.svg" alt="Export" />
              Export CSV
            </button>
          </div>
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

        <div className="filters">
          <CustomSelect
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'locked', label: 'Locked' }
            ]}
          />
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedUsers.length} selected</span>
          <button className="btn-bulk" onClick={() => handleBulkLock(true)}>
            <img src="/icon/lock.svg" alt="Lock" /> Lock
          </button>
          <button className="btn-bulk" onClick={() => handleBulkLock(false)}>
            <img src="/icon/unlock.svg" alt="Unlock" /> Unlock
          </button>
          <button className="btn-bulk danger" onClick={handleBulkDelete}>
            <img src="/icon/trash-2.svg" alt="Delete" /> Delete
          </button>
          <button className="btn-bulk-clear" onClick={() => setSelectedUsers([])}>
            Clear
          </button>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                User {sortConfig.sortBy === 'name' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Email</th>
              <th>Credits</th>
              <th className="stat-col">Profiles</th>
              <th className="stat-col">Analyses</th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {sortConfig.sortBy === 'createdAt' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  {searchTerm || filters.status !== 'all' 
                    ? 'No users found matching filters' 
                    : 'No users yet'}
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className={user.locked ? 'locked-row' : ''}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
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
                  <td className="email-cell">{user.email || 'N/A'}</td>
                  <td className="credits-cell">
                    {getCreditsBadge(user.credits)}
                  </td>
                  <td className="stat-cell">{user.usage?.profilesCount || 0}</td>
                  <td className="stat-cell">{user.usage?.analysesCount || 0}</td>
                  <td className="date-cell">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                  </td>
                  <td>
                    {user.locked ? (
                      <span className="status-badge locked">
                        <img src="/icon/lock.svg" alt="Locked" /> Locked
                      </span>
                    ) : (
                      <span className="status-badge active">Active</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <img src="/icon/eye.svg" alt="View" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(0)}
          >
            First
          </button>
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(pagination.offset - pagination.limit)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(pagination.offset + pagination.limit)}
          >
            Next
          </button>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange((totalPages - 1) * pagination.limit)}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
