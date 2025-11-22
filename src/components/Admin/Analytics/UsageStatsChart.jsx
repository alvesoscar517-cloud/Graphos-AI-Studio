import './UsageStatsChart.css';

export default function UsageStatsChart({ profiles, analyses, rewrites }) {
  const stats = [
    { label: 'Profiles', value: profiles, color: '#000', icon: 'folder.svg' },
    { label: 'Analyses', value: analyses, color: '#000', icon: 'search.svg' },
    { label: 'Rewrites', value: rewrites, color: '#000', icon: 'edit.svg' }
  ];

  const maxValue = Math.max(profiles, analyses, rewrites, 1);

  return (
    <div className="usage-stats-chart">
      <div className="stats-bars">
        {stats.map((stat, index) => (
          <div key={index} className="stat-column">
            <div className="stat-bar-container">
              <div 
                className="stat-bar"
                style={{ 
                  height: `${(stat.value / maxValue) * 100}%`,
                  background: stat.color
                }}
              >
                <span className="stat-bar-value">{stat.value}</span>
              </div>
            </div>
            <div className="stat-label">
              <img src={`/icon/${stat.icon}`} alt={stat.label} className="usage-stat-icon" />
              <span className="stat-name">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <img 
            src="/icon/chart-bar.svg" 
            alt="Total" 
            className="summary-icon"
          />
          <div className="summary-content">
            <div className="summary-label">Total Operations</div>
            <div className="summary-value">{profiles + analyses + rewrites}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
