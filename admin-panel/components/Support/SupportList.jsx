import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../contexts/RealtimeContext';
import { exportSupportToCSV } from '../../utils/exportUtils';
import { useNotify } from '../Common/NotificationProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Badge, StatusBadge, PriorityBadge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { SkeletonTable } from '../ui/skeleton';
import { SimpleTooltip } from '../ui/tooltip';
import PageHeader from '../Common/PageHeader';
import ActionsDropdown from '../Common/ActionsDropdown';
import { cn } from '@/lib/utils';

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
    } catch (err) {}
  };

  const getStatusVariant = (status) => {
    const map = { open: 'primary', in_progress: 'warning', resolved: 'success', closed: 'default' };
    return map[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const map = { open: 'New', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
    return map[status] || status;
  };

  const getTypeLabel = (type) => {
    const map = { feedback: 'Feedback', billing_support: 'Billing' };
    return map[type] || type;
  };

  // Build actions for each ticket
  const getTicketActions = (ticket) => [
    {
      label: 'Xem chi tiết',
      icon: <img src="/icon/eye.svg" alt="" className="w-4 h-4 icon-gray" />,
      onClick: () => navigate(`/support/${ticket.id}`),
    },
    {
      label: 'Trả lời',
      icon: <img src="/icon/message-circle.svg" alt="" className="w-4 h-4 icon-gray" />,
      onClick: () => navigate(`/support/${ticket.id}?reply=true`),
    },
    { separator: true },
    {
      label: 'Đánh dấu đã xử lý',
      icon: <img src="/icon/check-circle.svg" alt="" className="w-4 h-4 icon-gray" />,
      onClick: () => {},
      disabled: ticket.status === 'resolved',
    },
  ];

  const isInitialLoading = loading && (!tickets || tickets.length === 0);

  const filteredTickets = (tickets || []).filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterType !== 'all' && ticket.type !== filterType) return false;
    return true;
  });

  return (
    <div className="p-6">
      <PageHeader
        icon="headphones.svg"
        title="Support & Feedback"
        subtitle="Handle support requests and feedback"
        actions={
          <Button variant="secondary" size="sm" onClick={() => {
            try {
              exportSupportToCSV(filteredTickets);
              notify.success('Exported!');
            } catch (err) {
              notify.error('Export error');
            }
          }}>
            <img src="/icon/download.svg" alt="" className="w-4 h-4 icon-dark" /> Export
          </Button>
        }
      />

      {/* Stats */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total', value: statistics.total, icon: 'inbox.svg' },
            { label: 'Open', value: statistics.open, icon: 'circle-dot.svg' },
            { label: 'Feedback', value: statistics.feedback, icon: 'message-square.svg' },
            { label: 'Billing', value: statistics.billing, icon: 'dollar-sign.svg' }
          ].map((stat, i) => (
            <Card key={i} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                <img src={`/icon/${stat.icon}`} alt="" className="w-5 h-5 icon-gray" />
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs Filter */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="open">Mới</TabsTrigger>
            <TabsTrigger value="in_progress">Đang xử lý</TabsTrigger>
            <TabsTrigger value="resolved">Đã xử lý</TabsTrigger>
            <TabsTrigger value="closed">Đã đóng</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'feedback', label: 'Feedback' },
                { value: 'billing_support', label: 'Billing' }
              ]}
              className="w-36"
            />
            <span className="text-sm text-muted">{filteredTickets.length} tickets</span>
          </div>
        </div>
      </Tabs>

      {/* Table */}
      {isInitialLoading ? (
        <div className="mt-4">
          <SkeletonTable rows={8} columns={7} />
        </div>
      ) : (
        <Card className={cn("mt-4 overflow-hidden transition-opacity duration-200", loading && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Type</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Title</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Sender</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Priority</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Created</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-muted">No tickets</td>
                  </tr>
                ) : (
                  filteredTickets.map(ticket => (
                    <tr key={ticket.id} className={cn("border-b border-border hover:bg-surface-secondary transition-colors", ticket.status === 'open' && "bg-surface-tertiary")}>
                      <td className="p-3 text-sm font-mono text-muted">#{ticket.id.substring(0, 8)}</td>
                      <td className="p-3"><Badge variant="default">{getTypeLabel(ticket.type)}</Badge></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary truncate max-w-[200px]">{ticket.title}</span>
                          {ticket.replies?.length > 0 && (
                            <span className="text-xs text-muted flex items-center gap-1">
                              <img src="/icon/message-circle.svg" alt="" className="w-3 h-3" /> {ticket.replies.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-primary">{ticket.userName}</div>
                        <div className="text-xs text-muted">{ticket.userEmail}</div>
                      </td>
                      <td className="p-3"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="p-3"><Badge variant={getStatusVariant(ticket.status)}>{getStatusLabel(ticket.status)}</Badge></td>
                      <td className="p-3 text-sm text-muted">{new Date(ticket.createdAt).toLocaleDateString('en-US')}</td>
                      <td className="p-3">
                        <ActionsDropdown 
                          onRowClick={() => navigate(`/support/${ticket.id}`)}
                          showMenu={false}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
