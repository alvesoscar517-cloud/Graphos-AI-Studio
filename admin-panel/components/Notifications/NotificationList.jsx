import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { notificationsApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import ActionsDropdown from '../Common/ActionsDropdown';
import { cn } from '@/lib/utils';

export default function NotificationList() {
  const { 
    notifications, 
    loading: realtimeLoading, 
    loadNotifications,
    invalidateCache,
    setActiveTab 
  } = useRealtime();
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  const notify = useNotify();
  const loading = realtimeLoading.notifications;

  useEffect(() => {
    setActiveTab('notifications');
    handleLoadNotifications();
  }, [filter]);

  const handleLoadNotifications = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      await loadNotifications(params);
    } catch (err) {
      console.error('Load notifications error:', err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await notify.confirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      setActionLoading(id);
      await notificationsApi.delete(id);
      invalidateCache('notifications');
      await handleLoadNotifications();
      notify.success('Notification deleted!');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSend = async (id) => {
    const confirmed = await notify.confirm({
      title: 'Send Notification',
      message: 'Send this notification now?',
      type: 'info'
    });
    
    if (!confirmed) return;

    try {
      setActionLoading(id);
      await notificationsApi.send(id);
      notify.success('Notification sent successfully!');
      invalidateCache('notifications');
      await handleLoadNotifications();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status) => {
    const map = { draft: 'default', scheduled: 'warning', sent: 'success', archived: 'default' };
    return map[status] || 'default';
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: 'info.svg', success: 'check-circle.svg', warning: 'alert-triangle.svg',
      error: 'x-circle.svg', announcement: 'megaphone.svg'
    };
    return icons[type] || 'info.svg';
  };

  const getNotificationActions = (notif) => [
    ...(notif.status === 'draft' ? [{
      label: 'Send Now',
      icon: <img src="/icon/send.svg" alt="" className="w-4 h-4 icon-gray" />,
      onClick: () => handleSend(notif.id),
    }] : []),
    {
      label: 'Edit',
      icon: <img src="/icon/edit.svg" alt="" className="w-4 h-4 icon-gray" />,
      onClick: () => navigate(`/notifications/${notif.id}`),
    },
    { separator: true },
    {
      label: 'Delete',
      icon: <img src="/icon/trash-2.svg" alt="" className="w-4 h-4" />,
      onClick: () => handleDelete(notif.id),
      variant: 'destructive',
    },
  ];

  const isInitialLoading = loading && (!notifications || notifications.length === 0);

  const filteredNotifications = (notifications || []).filter(n => {
    if (filter === 'all') return true;
    return n.status === filter;
  });

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="bell.svg"
        title="Notifications"
        subtitle="Manage notifications sent to users"
        actions={
          <Button onClick={() => navigate('/notifications/new')} size="sm">
            <img src="/icon/plus.svg" alt="" className="w-4 h-4 icon-white" />
            <span className="hidden sm:inline">New Notification</span>
            <span className="sm:hidden">New</span>
          </Button>
        }
      />

      {/* Filter Tabs - Responsive */}
      <Tabs value={filter} onValueChange={setFilter} className="mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="overflow-x-auto scrollbar-hide">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs sm:text-sm">Draft</TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs sm:text-sm">Scheduled</TabsTrigger>
            <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent</TabsTrigger>
          </TabsList>
          <span className="text-xs sm:text-sm text-muted">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Tabs>

      {/* Content - Responsive */}
      {isInitialLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-16 mt-4">
          <div className="w-8 h-8 border-2 border-surface-secondary border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-surface rounded-xl border border-border mt-4 px-4">
          <img src="/icon/inbox.svg" alt="" className="w-10 h-10 sm:w-12 sm:h-12 icon-gray mb-3 sm:mb-4" />
          <p className="text-xs sm:text-sm text-muted mb-3 sm:mb-4 text-center">No notifications yet</p>
          <Button size="sm" onClick={() => navigate('/notifications/new')}>
            Create First Notification
          </Button>
        </div>
      ) : (
        <Card className={cn("mt-4 overflow-hidden transition-opacity duration-200", loading && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase w-10 sm:w-12">Type</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase">Content</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase hidden md:table-cell">Languages</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase">Status</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase hidden sm:table-cell">Stats</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase hidden lg:table-cell">Created</th>
                  <th className="p-2 sm:p-3 w-10 sm:w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map(notif => (
                  <tr key={notif.id} className="border-b border-border hover:bg-surface-secondary transition-colors cursor-pointer" onClick={() => navigate(`/notifications/${notif.id}`)}>
                    <td className="p-2 sm:p-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-surface-secondary rounded-lg flex items-center justify-center">
                        <img src={`/icon/${getTypeIcon(notif.type)}`} alt={notif.type} className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-gray" />
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-[150px] sm:max-w-[250px]">
                          {notif.translations?.en?.title || notif.content?.title || 'No Title'}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted max-w-[150px] sm:max-w-[300px] truncate">
                          {notif.translations?.en?.message || notif.content?.message || 'No Content'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-1.5 sm:px-2 py-0.5 bg-primary text-primary-foreground rounded text-[9px] sm:text-xxs font-medium">EN</span>
                        {notif.targetLanguages?.slice(0, 2).map(lang => (
                          <span key={lang} className="px-1.5 sm:px-2 py-0.5 bg-surface-secondary rounded text-[9px] sm:text-xxs font-medium text-muted">
                            {lang.toUpperCase()}
                          </span>
                        ))}
                        {notif.targetLanguages?.length > 2 && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-surface-secondary rounded text-[9px] sm:text-xxs font-medium text-muted">
                            +{notif.targetLanguages.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <Badge variant={getStatusVariant(notif.status)}>
                        {notif.status || 'draft'}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5 text-[10px] sm:text-xs text-muted">
                        <span>{notif.stats?.sent || 0} sent</span>
                        <span>{notif.stats?.read || 0} read</span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted hidden lg:table-cell whitespace-nowrap">
                      {formatDate(notif.createdAt)}
                    </td>
                    <td className="p-2 sm:p-3" onClick={(e) => e.stopPropagation()}>
                      <ActionsDropdown 
                        onRowClick={() => navigate(`/notifications/${notif.id}`)}
                        showMenu={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
