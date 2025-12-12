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
      // Exclude error_report type - they have their own page
      const typeParam = filterType === 'all' ? 'feedback,billing_support' : filterType;
      await loadSupport({ status: filterStatus, type: typeParam, limit: 100 });
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
    <div className="p-4 sm:p-6">
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
            <img src="/icon/download.svg" alt="" className="w-4 h-4 icon-dark" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />

      {/* Stats - Responsive */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {[
            { label: 'Total', value: statistics.total, icon: 'inbox.svg' },
            { label: 'Open', value: statistics.open, icon: 'circle-dot.svg' },
            { label: 'Feedback', value: statistics.feedback, icon: 'message-square.svg' },
            { label: 'Billing', value: statistics.billing, icon: 'dollar-sign.svg' }
          ].map((stat, i) => (
            <Card key={i} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
                <img src={`/icon/${stat.icon}`} alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-gray" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs Filter - Responsive */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <TabsList className="overflow-x-auto scrollbar-hide flex-nowrap">
            <TabsTrigger value="all" className="whitespace-nowrap text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="open" className="whitespace-nowrap text-xs sm:text-sm">New</TabsTrigger>
            <TabsTrigger value="in_progress" className="whitespace-nowrap text-xs sm:text-sm">In Progress</TabsTrigger>
            <TabsTrigger value="resolved" className="whitespace-nowrap text-xs sm:text-sm">Resolved</TabsTrigger>
            <TabsTrigger value="closed" className="whitespace-nowrap text-xs sm:text-sm">Closed</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3 sm:gap-4">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'feedback', label: 'Feedback' },
                { value: 'billing_support', label: 'Billing' }
              ]}
              className="w-28 sm:w-36"
            />
            <span className="text-xs sm:text-sm text-muted whitespace-nowrap">{filteredTickets.length} tickets</span>
          </div>
        </div>
      </Tabs>

      {/* Table - Responsive */}
      {isInitialLoading ? (
        <div className="mt-4">
          <SkeletonTable rows={8} columns={7} />
        </div>
      ) : (
        <Card className={cn("mt-4 overflow-hidden transition-opacity duration-200", loading && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden sm:table-cell">ID</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Type</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Title</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden md:table-cell">Sender</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden lg:table-cell">Priority</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Status</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden md:table-cell">Created</th>
                  <th className="p-2 sm:p-3 w-12 sm:w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 sm:p-8 text-center text-muted text-sm">No tickets</td>
                  </tr>
                ) : (
                  filteredTickets.map(ticket => (
                    <tr key={ticket.id} className={cn("border-b border-border hover:bg-surface-secondary transition-colors cursor-pointer", ticket.status === 'open' && "bg-surface-tertiary")} onClick={() => navigate(`/support/${ticket.id}`)}>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm font-mono text-muted hidden sm:table-cell">#{ticket.id.substring(0, 6)}</td>
                      <td className="p-2 sm:p-3"><Badge variant="default">{getTypeLabel(ticket.type)}</Badge></td>
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-[120px] sm:max-w-[200px]">{ticket.title}</span>
                          {ticket.replies?.length > 0 && (
                            <span className="text-[10px] sm:text-xs text-muted flex items-center gap-0.5">
                              <img src="/icon/message-circle.svg" alt="" className="w-3 h-3" /> {ticket.replies.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell">
                        <div className="text-xs sm:text-sm text-primary truncate max-w-[120px]">{ticket.userName}</div>
                        <div className="text-[10px] sm:text-xs text-muted truncate max-w-[120px]">{ticket.userEmail}</div>
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="p-2 sm:p-3"><Badge variant={getStatusVariant(ticket.status)}>{getStatusLabel(ticket.status)}</Badge></td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted hidden md:table-cell whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString('en-US')}</td>
                      <td className="p-2 sm:p-3" onClick={(e) => e.stopPropagation()}>
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
