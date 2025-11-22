import './TierDistributionChart.css';

export default function TierDistributionChart({ data }) {
  const total = (data.free || 0) + (data.premium || 0) + (data.enterprise || 0);

  if (total === 0) {
    return (
      <div className="chart-empty">
        <img src="/icon/inbox.svg" alt="Empty" />
        <p>Chưa có dữ liệu</p>
      </div>
    );
  }

  const tiers = [
    { name: 'Free', count: data.free || 0, color: '#e0e0e0', icon: 'circle.svg' },
    { name: 'Premium', count: data.premium || 0, color: '#000', icon: 'star.svg' },
    { name: 'Enterprise', count: data.enterprise || 0, color: '#666', icon: 'building.svg' }
  ];

  return (
    <div className="tier-distribution-chart">
      <div className="tier-bars">
        {tiers.map((tier, index) => {
          const percentage = ((tier.count / total) * 100).toFixed(1);
          return (
            <div key={index} className="tier-item">
              <div className="tier-info">
                <img src={`/icon/${tier.icon}`} alt={tier.name} className="tier-icon" />
                <span className="tier-name">{tier.name}</span>
                <span className="tier-count">{tier.count}</span>
              </div>
              <div className="tier-bar-container">
                <div 
                  className="tier-bar"
                  style={{ 
                    width: `${percentage}%`,
                    background: tier.color
                  }}
                >
                  <span className="tier-percentage">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tier-summary">
        <div className="summary-item">
          <span className="summary-label">Total Users:</span>
          <span className="summary-value">{total}</span>
        </div>
      </div>
    </div>
  );
}
