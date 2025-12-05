import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import { useRealtime } from '../../contexts/RealtimeContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge, StatusBadge } from '../ui/badge';
import { SimpleTooltip } from '../ui/tooltip';
import { SkeletonTable } from '../ui/skeleton';
import PageHeader from '../Common/PageHeader';
import { cn } from '@/lib/utils';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });
  const [sortConfig, setSortConfig] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [hasNewUsers, setHasNewUsers] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();
  
  // Get realtime events from context
  const { realtimeEvents, setActiveTab } = useRealtime();
  const lastNewUserRef = useRef(null);

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
      setPagination(prev => ({ ...prev, ...response.pagination, offset }));
    } catch (err) {
      notify.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, pagination.limit, pagination.offset, sortConfig]);

  // Set active tab for realtime context
  useEffect(() => {
    setActiveTab('users');
  }, [setActiveTab]);

  useEffect(() => {
    const debounce = setTimeout(() => loadUsers(true), 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, filters, sortConfig]);
  
  // Listen for realtime new user events
  useEffect(() => {
    if (realtimeEvents?.lastNewUser && 
        realtimeEvents.lastNewUser.timestamp !== lastNewUserRef.current) {
      lastNewUserRef.current = realtimeEvents.lastNewUser.timestamp;
      
      // Show indicator that new users are available
      setHasNewUsers(true);
      
      // Auto-refresh if on first page with default sort
      if (pagination.offset === 0 && sortConfig.sortBy === 'createdAt' && sortConfig.sortOrder === 'desc') {
        loadUsers(true);
        setHasNewUsers(false);
      }
    }
  }, [realtimeEvents?.lastNewUser, pagination.offset, sortConfig]);

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
    loadUsers();
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        const response = await usersApi.export('csv');
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

  const getCreditsBadgeVariant = (balance) => {
    if (balance === 0) return 'error';
    if (balance <= 50) return 'warning';
    if (balance <= 200) return 'info';
    return 'success';
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <PageHeader
          icon="users.svg"
          title="User Management"
          subtitle="Loading..."
        />
        <div className="mt-6">
          <SkeletonTable rows={10} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        icon="users.svg"
        title="User Management"
        subtitle={`${pagination.total} total users`}
        actions={
          <div className="flex items-center gap-2">
            {hasNewUsers && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  loadUsers(true);
                  setHasNewUsers(false);
                }}
                className="animate-pulse"
              >
                <img src="/icon/refresh-cw.svg" alt="Refresh" className="w-4 h-4" />
                New users available
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
              <img src="/icon/download.svg" alt="Export" className="w-4 h-4 icon-dark" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <div className="relative flex-1">
          <img src="/icon/search.svg" alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-gray" />
          <input
            type="text"
            placeholder="Search by email, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border/50 bg-surface-secondary text-primary placeholder:text-muted focus:outline-none focus:bg-surface transition-colors"
          />
        </div>
        {/* Status Filter Tabs */}
        <div className="flex items-center bg-surface-secondary rounded-lg p-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'locked', label: 'Locked' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilters(prev => ({ ...prev, status: option.value }))}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                filters.status === option.value
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-muted hover:text-primary'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="p-3 text-left text-xs font-medium text-muted uppercase cursor-pointer" onClick={() => handleSort('name')}>
                  User {sortConfig.sortBy === 'name' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted uppercase">Email</th>
                <th className="p-3 text-left text-xs font-medium text-muted uppercase">Credits</th>
                <th className="p-3 text-center text-xs font-medium text-muted uppercase">Profiles</th>
                <th className="p-3 text-center text-xs font-medium text-muted uppercase">Analyses</th>
                <th className="p-3 text-left text-xs font-medium text-muted uppercase cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Created {sortConfig.sortBy === 'createdAt' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    {searchTerm || filters.status !== 'all' ? 'No users found matching filters' : 'No users yet'}
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr 
                    key={user.id} 
                    className={cn("border-b border-border hover:bg-surface-secondary transition-colors cursor-pointer", user.locked && "opacity-60")} 
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-primary">{user.name || 'Unnamed'}</div>
                          <div className="text-xs text-muted">{user.id.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-primary">{user.email || 'N/A'}</td>
                    <td className="p-3">
                      <SimpleTooltip content={`Balance: ${user.credits?.balance || 0} credits`}>
                        <span>
                          <Badge variant={getCreditsBadgeVariant(user.credits?.balance || 0)}>
                            {user.credits?.balance || 0}
                          </Badge>
                        </span>
                      </SimpleTooltip>
                    </td>
                    <td className="p-3 text-center text-sm text-muted">
                      <SimpleTooltip content={`${user.usage?.profilesCount || 0} profiles created`}>
                        <span>{user.usage?.profilesCount || 0}</span>
                      </SimpleTooltip>
                    </td>
                    <td className="p-3 text-center text-sm text-muted">
                      <SimpleTooltip content={`${user.usage?.analysesCount || 0} analyses`}>
                        <span>{user.usage?.analysesCount || 0}</span>
                      </SimpleTooltip>
                    </td>
                    <td className="p-3 text-sm text-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={user.locked ? 'suspended' : 'active'}>
                        {user.locked ? 'Locked' : 'Active'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(0)}>
            First
          </Button>
          <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(pagination.offset - pagination.limit)}>
            Previous
          </Button>
          <span className="px-4 text-sm text-muted">Page {currentPage} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(pagination.offset + pagination.limit)}>
            Next
          </Button>
          <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange((totalPages - 1) * pagination.limit)}>
            Last
          </Button>
        </div>
      )}
    </div>
  );
}
