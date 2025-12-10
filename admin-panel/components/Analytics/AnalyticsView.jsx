import { useState, useEffect } from 'react';
import { useRealtime } from '../../contexts/RealtimeContext';
import { exportAnalyticsToCSV, generateAnalyticsReport } from '../../utils/exportUtils';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import UserGrowthChart from './UserGrowthChart';
import TierDistributionChart from './TierDistributionChart';
import UsageStatsChart from './UsageStatsChart';
import LoadingScreen from '../Common/LoadingScreen';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function AnalyticsView() {
  const { 
    overview, 
    userAnalytics, 
    usageAnalytics, 
    loading: realtimeLoading, 
    loadAnalytics,
    setActiveTab 
  } = useRealtime();
  const [timeRange, setTimeRange] = useState(30);
  const notify = useNotify();
  const loading = realtimeLoading.analytics;

  useEffect(() => {
    setActiveTab('analytics');
    handleLoadAnalytics();
  }, [timeRange]);

  const handleLoadAnalytics = async () => {
    try {
      await loadAnalytics(timeRange);
    } catch (err) {
      console.error('Load analytics error:', err);
      notify.error('Failed to load analytics data: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && !overview) {
    return <LoadingScreen />;
  }

  const safeOverview = overview || {};
  const safeUserAnalytics = userAnalytics || {};
  const safeUsageAnalytics = usageAnalytics || {};

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <PageHeader
        icon="bar-chart.svg"
        title="Analytics Dashboard"
        subtitle="Comprehensive insights and performance metrics"
        actions={
          <Select
            value={String(timeRange)}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' }
            ]}
            className="w-32 sm:w-36"
          />
        }
      />

      {/* Key Metrics - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <MetricCard
          icon="users.svg"
          label="Total Users"
          value={(safeOverview.totalUsers || 0).toLocaleString()}
          change={`+${safeOverview.newUsers || 0} new`}
          positive
        />
        <MetricCard
          icon="folder.svg"
          label="Profiles"
          value={(safeUsageAnalytics.totalProfiles || 0).toLocaleString()}
          subtitle={`${Number(safeUsageAnalytics.avgProfilesPerUser || 0).toFixed(1)} avg/user`}
        />
        <MetricCard
          icon="search.svg"
          label="Analyses"
          value={(safeUsageAnalytics.totalAnalyses || 0).toLocaleString()}
          subtitle={`${Number(safeUsageAnalytics.avgAnalysesPerUser || 0).toFixed(1)} avg/user`}
        />
        <MetricCard
          icon="edit.svg"
          label="Rewrites"
          value={(safeUsageAnalytics.totalRewrites || 0).toLocaleString()}
          subtitle="Total operations"
        />
      </div>

      {/* Charts - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <img src="/icon/trending-up.svg" alt="Growth" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
              <h3 className="text-base sm:text-lg font-semibold text-primary">User Growth</h3>
            </div>
            <span className="text-[10px] sm:text-xs text-muted">{timeRange} days</span>
          </div>
          <UserGrowthChart data={safeUserAnalytics.userGrowth || []} />
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <img src="/icon/pie-chart.svg" alt="Distribution" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
              <h3 className="text-base sm:text-lg font-semibold text-primary">Credit Distribution</h3>
            </div>
            <span className="text-[10px] sm:text-xs text-muted hidden sm:inline">{(safeOverview.totalUsers || 0).toLocaleString()} users</span>
          </div>
          <TierDistributionChart data={safeUserAnalytics.creditDistribution || safeUserAnalytics.tierDistribution || {}} />
        </Card>

        <Card className="p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <img src="/icon/bar-chart.svg" alt="Usage" className="w-4 h-4 sm:w-5 sm:h-5 icon-dark" />
              <h3 className="text-base sm:text-lg font-semibold text-primary">Usage Statistics</h3>
            </div>
            <span className="text-[10px] sm:text-xs text-muted hidden sm:inline">Profiles, Analyses & Rewrites</span>
          </div>
          <UsageStatsChart 
            profiles={safeUsageAnalytics.totalProfiles || 0}
            analyses={safeUsageAnalytics.totalAnalyses || 0}
            rewrites={safeUsageAnalytics.totalRewrites || 0}
          />
        </Card>
      </div>

      {/* Actions - Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              try {
                exportAnalyticsToCSV(safeUserAnalytics);
                notify.success('CSV exported successfully');
              } catch (err) {
                notify.error('Export failed: ' + err.message);
              }
            }}
          >
            <img src="/icon/download.svg" alt="Export" className="w-4 h-4 icon-white" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              try {
                generateAnalyticsReport(safeOverview, safeUserAnalytics, safeUsageAnalytics);
                notify.success('PDF report generated');
              } catch (err) {
                notify.error('PDF generation failed: ' + err.message);
              }
            }}
          >
            <img src="/icon/file-text.svg" alt="PDF" className="w-4 h-4 icon-white" />
            <span className="hidden sm:inline">Generate PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => loadAnalytics(timeRange, true)}>
          <img src="/icon/refresh-cw.svg" alt="Refresh" className="w-4 h-4 icon-dark" />
          <span className="hidden sm:inline">Refresh Data</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, change, positive }) {
  return (
    <Card className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
        <img src={`/icon/${icon}`} alt={label} className="w-5 h-5 sm:w-6 sm:h-6 icon-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] sm:text-xs font-medium text-muted uppercase tracking-wide truncate">{label}</div>
        <div className="text-xl sm:text-2xl font-bold text-primary mt-0.5 sm:mt-1">{value}</div>
        {change && (
          <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${positive ? 'text-success' : 'text-destructive'}`}>
            {change}
          </div>
        )}
        {subtitle && <div className="text-[10px] sm:text-xs text-muted mt-0.5 truncate">{subtitle}</div>}
      </div>
    </Card>
  );
}
