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
    <div className="p-6">
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
            className="w-36"
          />
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/icon/trending-up.svg" alt="Growth" className="w-5 h-5 icon-dark" />
              <h3 className="text-lg font-semibold text-primary">User Growth</h3>
            </div>
            <span className="text-xs text-muted">{timeRange} days trend</span>
          </div>
          <UserGrowthChart data={safeUserAnalytics.userGrowth || []} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/icon/pie-chart.svg" alt="Distribution" className="w-5 h-5 icon-dark" />
              <h3 className="text-lg font-semibold text-primary">Credit Distribution</h3>
            </div>
            <span className="text-xs text-muted">{(safeOverview.totalUsers || 0).toLocaleString()} total users</span>
          </div>
          <TierDistributionChart data={safeUserAnalytics.creditDistribution || safeUserAnalytics.tierDistribution || {}} />
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/icon/bar-chart.svg" alt="Usage" className="w-5 h-5 icon-dark" />
              <h3 className="text-lg font-semibold text-primary">Usage Statistics</h3>
            </div>
            <span className="text-xs text-muted">Profiles, Analyses & Rewrites</span>
          </div>
          <UsageStatsChart 
            profiles={safeUsageAnalytics.totalProfiles || 0}
            analyses={safeUsageAnalytics.totalAnalyses || 0}
            rewrites={safeUsageAnalytics.totalRewrites || 0}
          />
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <div className="flex gap-3">
          <Button
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
            Export CSV
          </Button>
          <Button
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
            Generate PDF
          </Button>
        </div>
        <Button variant="secondary" onClick={() => loadAnalytics(timeRange, true)}>
          <img src="/icon/refresh-cw.svg" alt="Refresh" className="w-4 h-4 icon-dark" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, change, positive }) {
  return (
    <Card className="p-5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
        <img src={`/icon/${icon}`} alt={label} className="w-6 h-6 icon-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold text-primary mt-1">{value}</div>
        {change && (
          <div className={`text-xs mt-1 ${positive ? 'text-success' : 'text-destructive'}`}>
            {change}
          </div>
        )}
        {subtitle && <div className="text-xs text-muted mt-0.5">{subtitle}</div>}
      </div>
    </Card>
  );
}
