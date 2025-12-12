import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { SkeletonTable } from '../ui/skeleton';
import PageHeader from '../Common/PageHeader';
import { cn } from '@/lib/utils';

export default function ErrorReportsList() {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        supportApi.getAll({ type: 'error_report', status: filterStatus !== 'all' ? filterStatus : undefined, limit: 100 }),
        supportApi.getStatistics()
      ]);
      setReports(ticketsRes.tickets || []);
      setStatistics(statsRes.statistics);
    } catch (err) {
      notify.error('Failed to load error reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const map = { open: 'error', in_progress: 'warning', resolved: 'success', closed: 'default' };
    return map[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const map = { open: 'New', in_progress: 'Investigating', resolved: 'Fixed', closed: 'Closed' };
    return map[status] || status;
  };

  // Parse error info from title
  const parseErrorTitle = (title) => {
    const match = title?.match(/^\[Error\]\s*(\w+):\s*(.+)$/);
    if (match) {
      return { errorName: match[1], errorMessage: match[2] };
    }
    return { errorName: 'Error', errorMessage: title || 'Unknown error' };
  };

  // Group errors by error message for easier identification
  const groupedErrors = reports.reduce((acc, report) => {
    const { errorMessage } = parseErrorTitle(report.title);
    const key = errorMessage.slice(0, 50);
    if (!acc[key]) {
      acc[key] = { count: 0, reports: [], latestReport: report };
    }
    acc[key].count++;
    acc[key].reports.push(report);
    if (new Date(report.createdAt) > new Date(acc[key].latestReport.createdAt)) {
      acc[key].latestReport = report;
    }
    return acc;
  }, {});

  const errorStats = {
    total: reports.length,
    new: reports.filter(r => r.status === 'open').length,
    investigating: reports.filter(r => r.status === 'in_progress').length,
    fixed: reports.filter(r => r.status === 'resolved').length,
    uniqueErrors: Object.keys(groupedErrors).length
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="alert-triangle.svg"
        title="Error Reports"
        subtitle="Client-side errors reported by users"
        actions={
          <Button variant="secondary" size="sm" onClick={() => loadData()}>
            <img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4 icon-dark" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {[
          { label: 'Total Reports', value: errorStats.total, icon: 'inbox.svg', color: 'text-primary' },
          { label: 'New', value: errorStats.new, icon: 'alert-circle.svg', color: 'text-error' },
          { label: 'Investigating', value: errorStats.investigating, icon: 'search.svg', color: 'text-warning' },
          { label: 'Fixed', value: errorStats.fixed, icon: 'check-circle.svg', color: 'text-success' },
          { label: 'Unique Errors', value: errorStats.uniqueErrors, icon: 'layers.svg', color: 'text-info' }
        ].map((stat, i) => (
          <Card key={i} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
              <img src={`/icon/${stat.icon}`} alt="" className="w-4 h-4 sm:w-5 sm:h-5 icon-gray" />
            </div>
            <div className="min-w-0">
              <div className={cn("text-lg sm:text-xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs Filter */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <TabsList className="overflow-x-auto scrollbar-hide flex-nowrap">
            <TabsTrigger value="all" className="whitespace-nowrap text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="open" className="whitespace-nowrap text-xs sm:text-sm">New</TabsTrigger>
            <TabsTrigger value="in_progress" className="whitespace-nowrap text-xs sm:text-sm">Investigating</TabsTrigger>
            <TabsTrigger value="resolved" className="whitespace-nowrap text-xs sm:text-sm">Fixed</TabsTrigger>
            <TabsTrigger value="closed" className="whitespace-nowrap text-xs sm:text-sm">Closed</TabsTrigger>
          </TabsList>
          <span className="text-xs sm:text-sm text-muted whitespace-nowrap">{reports.length} reports</span>
        </div>
      </Tabs>

      {/* Error Reports Table */}
      {loading ? (
        <div className="mt-4">
          <SkeletonTable rows={8} columns={6} />
        </div>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Status</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Error</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden md:table-cell">User</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden lg:table-cell">URL</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Reported</th>
                  <th className="p-2 sm:p-3 w-12 sm:w-20"></th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 sm:p-8 text-center text-muted text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <img src="/icon/check-circle.svg" alt="" className="w-12 h-12 opacity-30" />
                        <span>No error reports found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map(report => {
                    const { errorName, errorMessage } = parseErrorTitle(report.title);
                    const metadata = report.metadata || {};
                    
                    return (
                      <tr 
                        key={report.id} 
                        className={cn(
                          "border-b border-border hover:bg-surface-secondary transition-colors cursor-pointer",
                          report.status === 'open' && "bg-error/5"
                        )} 
                        onClick={() => navigate(`/error-reports/${report.id}`)}
                      >
                        <td className="p-2 sm:p-3">
                          <Badge variant={getStatusVariant(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </td>
                        <td className="p-2 sm:p-3">
                          <div className="flex flex-col gap-0.5">
                            <code className="text-xs font-mono text-error bg-error/10 px-1.5 py-0.5 rounded w-fit">
                              {errorName}
                            </code>
                            <span className="text-xs sm:text-sm text-primary truncate max-w-[250px]" title={errorMessage}>
                              {errorMessage}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 hidden md:table-cell">
                          <div className="text-xs sm:text-sm text-primary truncate max-w-[120px]">{report.userName || 'Anonymous'}</div>
                          <div className="text-[10px] sm:text-xs text-muted truncate max-w-[120px]">{report.userEmail}</div>
                        </td>
                        <td className="p-2 sm:p-3 hidden lg:table-cell">
                          <span className="text-xs text-muted truncate max-w-[150px] block" title={metadata.url}>
                            {metadata.url ? new URL(metadata.url).pathname : '-'}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted whitespace-nowrap">
                          {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2 sm:p-3">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/error-reports/${report.id}`); }}>
                            <img src="/icon/eye.svg" alt="" className="w-4 h-4 icon-gray" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
