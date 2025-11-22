import './UsageStatsChart.css';

export default function UsageStatsChart({ profiles, analyses, rewrites }) {
  const stats = [
    { 
      label: 'Profiles', 
      value: profiles, 
      icon: 'folder',
      color: '#e3f2fd',
      borderColor: '#90caf9',
      iconBg: '#bbdefb',
      percentage: 0
    },
    { 
      label: 'Analyses', 
      value: analyses, 
      icon: 'search',
      color: '#f3e5f5',
      borderColor: '#ce93d8',
      iconBg: '#e1bee7',
      percentage: 0
    },
    { 
      label: 'Rewrites', 
      value: rewrites, 
      icon: 'edit',
      color: '#fff3e0',
      borderColor: '#ffb74d',
      iconBg: '#ffe0b2',
      percentage: 0
    }
  ];

  const total = profiles + analyses + rewrites;
  
  // Calculate percentages
  if (total > 0) {
    stats[0].percentage = ((profiles / total) * 100).toFixed(1);
    stats[1].percentage = ((analyses / total) * 100).toFixed(1);
    stats[2].percentage = ((rewrites / total) * 100).toFixed(1);
  }

  return (
    <div className="usage-stats-container">
      {/* Stats Grid */}
      <div className="usage-stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="usage-stat-card"
            style={{
              background: stat.color,
              borderColor: stat.borderColor
            }}
          >
            <div 
              className="usage-stat-icon"
              style={{ background: stat.iconBg }}
            >
              <img src={`/admin/icon/${stat.icon}.svg`} alt={stat.label} />
            </div>
            <div className="usage-stat-content">
              <div className="usage-stat-label">{stat.label}</div>
              <div className="usage-stat-value">{stat.value.toLocaleString()}</div>
              <div className="usage-stat-percentage">{stat.percentage}% of total</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="usage-stats-summary">
        <div className="summary-main">
          <div className="summary-icon">
            <img src="/admin/icon/activity.svg" alt="Total" />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Operations</div>
            <div className="summary-value">{total.toLocaleString()}</div>
          </div>
        </div>
        <div className="summary-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Profiles</span>
            <span className="breakdown-value">{profiles.toLocaleString()}</span>
          </div>
          <div className="breakdown-divider">+</div>
          <div className="breakdown-item">
            <span className="breakdown-label">Analyses</span>
            <span className="breakdown-value">{analyses.toLocaleString()}</span>
          </div>
          <div className="breakdown-divider">+</div>
          <div className="breakdown-item">
            <span className="breakdown-label">Rewrites</span>
            <span className="breakdown-value">{rewrites.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
