import { useState, useEffect } from 'react';
import { advancedAnalyticsApi, analyticsApi } from '../../../services/adminApi';
import { exportAnalyticsToCSV, generateAnalyticsReport } from '../../../utils/exportUtils';
import { useNotify } from '../../Common/NotificationProvider';
import UserGrowthChart from './UserGrowthChart';
import TierDistributionChart from './TierDistributionChart';
import UsageStatsChart from './UsageStatsChart';
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

      setOverview(overviewRes.overview);
      setUserAnalytics(userRes.analytics);
      setUsageAnalytics(usageRes.analytics);
    } catch (err) {
      console.error('Load analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu phân tích...</p>
      </div>
    );
  }

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <div className="header-title">
          <img src="/icon/chart-line.svg" alt="Analytics" />
          <div>
            <h1>Thống kê & Phân tích</h1>
            <p>Báo cáo chi tiết về người dùng và sử dụng hệ thống</p>
          </div>
        </div>

        <div className="time-range-selector">
          <label>Khoảng thời gian:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
            <option value={365}>1 năm</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <img src="/icon/users.svg" alt="Users" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{overview?.totalUsers || 0}</div>
            <div className="stat-label">Tổng người dùng</div>
            <div className="stat-change positive">+{overview?.newUsers || 0} mới</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <img src="/icon/folder.svg" alt="Profiles" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{usageAnalytics?.totalProfiles || 0}</div>
            <div className="stat-label">Profiles</div>
            <div className="stat-change">{usageAnalytics?.avgProfilesPerUser || 0} / user</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <img src="/icon/search.svg" alt="Analyses" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{usageAnalytics?.totalAnalyses || 0}</div>
            <div className="stat-label">Phân tích</div>
            <div className="stat-change">{usageAnalytics?.avgAnalysesPerUser || 0} / user</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <img src="/icon/edit.svg" alt="Rewrites" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{usageAnalytics?.totalRewrites || 0}</div>
            <div className="stat-label">Viết lại</div>
            <div className="stat-change">Total rewrites</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* User Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <img src="/icon/chart-bar.svg" alt="Growth" />
              Tăng trưởng người dùng
            </h3>
            <span className="chart-subtitle">{timeRange} ngày gần đây</span>
          </div>
          <UserGrowthChart data={userAnalytics?.userGrowth || []} />
        </div>

        {/* Tier Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <img src="/icon/target.svg" alt="Tiers" />
              Phân bổ gói dịch vụ
            </h3>
            <span className="chart-subtitle">Tổng {overview?.totalUsers || 0} users</span>
          </div>
          <TierDistributionChart data={userAnalytics?.tierDistribution || {}} />
        </div>

        {/* Usage Stats */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>
              <img src="/icon/chart-line.svg" alt="Usage" />
              Thống kê sử dụng
            </h3>
            <span className="chart-subtitle">Profiles, Analyses, Rewrites</span>
          </div>
          <UsageStatsChart 
            profiles={usageAnalytics?.totalProfiles || 0}
            analyses={usageAnalytics?.totalAnalyses || 0}
            rewrites={usageAnalytics?.totalRewrites || 0}
          />
        </div>

        {/* Profile Status */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <img src="/icon/folder.svg" alt="Profiles" />
              Trạng thái Profiles
            </h3>
            <span className="chart-subtitle">Ready vs Pending</span>
          </div>
          <div className="status-stats">
            <div className="status-item">
              <div className="status-bar">
                <div 
                  className="status-fill ready"
                  style={{ 
                    width: `${(usageAnalytics?.profilesByStatus?.ready || 0) / (usageAnalytics?.totalProfiles || 1) * 100}%` 
                  }}
                />
              </div>
              <div className="status-info">
                <span className="status-label">
                  <img src="/icon/check-circle.svg" alt="Ready" />
                  Ready
                </span>
                <span className="status-value">{usageAnalytics?.profilesByStatus?.ready || 0}</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-bar">
                <div 
                  className="status-fill pending"
                  style={{ 
                    width: `${(usageAnalytics?.profilesByStatus?.pending || 0) / (usageAnalytics?.totalProfiles || 1) * 100}%` 
                  }}
                />
              </div>
              <div className="status-info">
                <span className="status-label">
                  <img src="/icon/clock.svg" alt="Pending" />
                  Pending
                </span>
                <span className="status-value">{usageAnalytics?.profilesByStatus?.pending || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <img src="/icon/lightbulb.svg" alt="Insights" />
              Insights
            </h3>
            <span className="chart-subtitle">Key metrics</span>
          </div>
          <div className="insights-list">
            <div className="insight-item">
              <img src="/icon/chart-bar.svg" alt="Profiles" className="insight-icon" />
              <div className="insight-content">
                <div className="insight-label">Avg Profiles/User</div>
                <div className="insight-value">{usageAnalytics?.avgProfilesPerUser || 0}</div>
              </div>
            </div>
            <div className="insight-item">
              <img src="/icon/search.svg" alt="Analyses" className="insight-icon" />
              <div className="insight-content">
                <div className="insight-label">Avg Analyses/User</div>
                <div className="insight-value">{usageAnalytics?.avgAnalysesPerUser || 0}</div>
              </div>
            </div>
            <div className="insight-item">
              <img src="/icon/trending-up.svg" alt="Growth" className="insight-icon" />
              <div className="insight-content">
                <div className="insight-label">Growth Rate</div>
                <div className="insight-value positive">
                  +{((overview?.newUsers || 0) / (overview?.totalUsers || 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="analytics-actions">
        <button 
          className="btn-export" 
          onClick={() => {
            try {
              exportAnalyticsToCSV(userAnalytics);
              notify.success('Đã export CSV thành công!');
            } catch (err) {
              notify.error('Lỗi export: ' + err.message);
            }
          }}
        >
          <img src="/icon/download.svg" alt="Export" />
          Export Report (CSV)
        </button>
        <button 
          className="btn-export" 
          onClick={() => {
            try {
              generateAnalyticsReport(overview, userAnalytics, usageAnalytics);
              notify.success('Đã tạo báo cáo PDF!');
            } catch (err) {
              notify.error('Lỗi tạo PDF: ' + err.message);
            }
          }}
        >
          <img src="/icon/file-text.svg" alt="PDF" />
          Export Report (PDF)
        </button>
        <button className="btn-refresh" onClick={loadAnalytics}>
          <img src="/icon/refresh-cw.svg" alt="Refresh" />
          Refresh Data
        </button>
      </div>
    </div>
  );
}
