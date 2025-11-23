import { useState, useEffect } from 'react';
import { advancedAnalyticsApi, analyticsApi } from '../../services/adminApi';
import { exportAnalyticsToCSV, generateAnalyticsReport } from '../../utils/exportUtils';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import UserGrowthChart from './UserGrowthChart';
import TierDistributionChart from './TierDistributionChart';
import UsageStatsChart from './UsageStatsChart';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './AnalyticsView.css';

export default function AnalyticsView() {
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [usageAnalytics, setUsageAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const notify = useNotify();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, userRes, usageRes] = await Promise.all([
        analyticsApi.getOverview(),
        advancedAnalyticsApi.getUserAnalytics(timeRange),
        advancedAnalyticsApi.getUsageAnalytics()
      ]);

      console.log('Analytics data loaded:', { overviewRes, userRes, usageRes });

      setOverview(overviewRes.overview || {});
      setUserAnalytics(userRes.analytics || {});
      setUsageAnalytics(usageRes.analytics || {});
    } catch (err) {
      console.error('Load analytics error:', err);
      notify.error('Failed to load analytics data: ' + (err.message || 'Unknown error'));
      // Set empty data to prevent errors
      setOverview({});
      setUserAnalytics({});
      setUsageAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Ensure data objects exist
  const safeOverview = overview || {};
  const safeUserAnalytics = userAnalytics || {};
  const safeUsageAnalytics = usageAnalytics || {};

  return (
    <div className="analytics-container">
      {/* Header */}
      <PageHeader
        icon="bar-chart.svg"
        title="Analytics Dashboard"
        subtitle="Comprehensive insights and performance metrics"
        actions={
          <CustomSelect
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            options={[
              { value: 7, label: 'Last 7 days' },
              { value: 30, label: 'Last 30 days' },
              { value: 90, label: 'Last 90 days' },
              { value: 365, label: 'Last year' }
            ]}
            className="analytics-select"
          />
        }
      />

      {/* Key Metrics */}
      <section className="analytics-metrics-grid">
        <div className="analytics-metric-card">
          <div className="analytics-metric-icon">
            <img src="/icon/users.svg" alt="Users" />
          </div>
          <div className="analytics-metric-content">
            <div className="analytics-metric-label">Total Users</div>
            <div className="analytics-metric-value">{(safeOverview.totalUsers || 0).toLocaleString()}</div>
            <div className="analytics-metric-change positive">+{safeOverview.newUsers || 0} new</div>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon">
            <img src="/icon/folder.svg" alt="Profiles" />
          </div>
          <div className="analytics-metric-content">
            <div className="analytics-metric-label">Profiles</div>
            <div className="analytics-metric-value">{(safeUsageAnalytics.totalProfiles || 0).toLocaleString()}</div>
            <div className="analytics-metric-subtitle">{Number(safeUsageAnalytics.avgProfilesPerUser || 0).toFixed(1)} avg/user</div>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon">
            <img src="/icon/search.svg" alt="Analyses" />
          </div>
          <div className="analytics-metric-content">
            <div className="analytics-metric-label">Analyses</div>
            <div className="analytics-metric-value">{(safeUsageAnalytics.totalAnalyses || 0).toLocaleString()}</div>
            <div className="analytics-metric-subtitle">{Number(safeUsageAnalytics.avgAnalysesPerUser || 0).toFixed(1)} avg/user</div>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon">
            <img src="/icon/edit.svg" alt="Rewrites" />
          </div>
          <div className="analytics-metric-content">
            <div className="analytics-metric-label">Rewrites</div>
            <div className="analytics-metric-value">{(safeUsageAnalytics.totalRewrites || 0).toLocaleString()}</div>
            <div className="analytics-metric-subtitle">Total operations</div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="analytics-charts-grid">
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <div className="analytics-chart-title-group">
              <img src="/icon/trending-up.svg" alt="Growth" className="analytics-chart-icon" />
              <h3 className="analytics-chart-title">User Growth</h3>
            </div>
            <span className="analytics-chart-subtitle">{timeRange} days trend</span>
          </div>
          <UserGrowthChart data={safeUserAnalytics.userGrowth || []} />
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <div className="analytics-chart-title-group">
              <img src="/icon/pie-chart.svg" alt="Distribution" className="analytics-chart-icon" />
              <h3 className="analytics-chart-title">Tier Distribution</h3>
            </div>
            <span className="analytics-chart-subtitle">{(safeOverview.totalUsers || 0).toLocaleString()} total users</span>
          </div>
          <TierDistributionChart data={safeUserAnalytics.tierDistribution || {}} />
        </div>

        <div className="analytics-chart-card analytics-chart-full">
          <div className="analytics-chart-header">
            <div className="analytics-chart-title-group">
              <img src="/icon/bar-chart.svg" alt="Usage" className="analytics-chart-icon" />
              <h3 className="analytics-chart-title">Usage Statistics</h3>
            </div>
            <span className="analytics-chart-subtitle">Profiles, Analyses & Rewrites</span>
          </div>
          <UsageStatsChart 
            profiles={safeUsageAnalytics.totalProfiles || 0}
            analyses={safeUsageAnalytics.totalAnalyses || 0}
            rewrites={safeUsageAnalytics.totalRewrites || 0}
          />
        </div>
      </section>

      {/* Actions */}
      <footer className="analytics-actions">
        <div className="actions-group">
          <button 
            className="analytics-btn analytics-btn-primary"
            onClick={() => {
              try {
                exportAnalyticsToCSV(safeUserAnalytics);
                notify.success('CSV exported successfully');
              } catch (err) {
                notify.error('Export failed: ' + err.message);
              }
            }}
          >
            <img src="/icon/download.svg" alt="Export" />
            Export CSV
          </button>
          <button 
            className="analytics-btn analytics-btn-primary"
            onClick={() => {
              try {
                generateAnalyticsReport(safeOverview, safeUserAnalytics, safeUsageAnalytics);
                notify.success('PDF report generated');
              } catch (err) {
                notify.error('PDF generation failed: ' + err.message);
              }
            }}
          >
            <img src="/icon/file-text.svg" alt="PDF" />
            Generate PDF
          </button>
        </div>
        <button className="analytics-btn analytics-btn-secondary" onClick={loadAnalytics}>
          <img src="/icon/refresh-cw.svg" alt="Refresh" />
          Refresh Data
        </button>
      </footer>
    </div>
  );
}
