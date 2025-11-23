import './TierDistributionChart.css';

export default function TierDistributionChart({ data }) {
  const total = (data.free || 0) + (data.premium || 0) + (data.enterprise || 0);

  if (total === 0) {
    return (
      <div className="chart-empty">
        <img src="/icon/inbox.svg" alt="Empty" className="chart-empty-icon" />
        <p className="chart-empty-text">No tier data available</p>
      </div>
    );
  }

  const tiers = [
    { 
      name: 'Free', 
      count: data.free || 0, 
      gradient: 'linear-gradient(135deg, #b3e5fc 0%, #81d4fa 100%)',
      icon: 'circle'
    },
    { 
      name: 'Premium', 
      count: data.premium || 0, 
      gradient: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%)',
      icon: 'star'
    },
    { 
      name: 'Enterprise', 
      count: data.enterprise || 0, 
      gradient: 'linear-gradient(135deg, #ce93d8 0%, #ba68c8 100%)',
      icon: 'building'
    }
  ];

  return (
    <div className="tier-distribution-container">
      <div className="tier-bars-container">
        {tiers.map((tier, index) => {
          const percentage = ((tier.count / total) * 100).toFixed(1);
          return (
            <div key={index} className="tier-row">
              <div className="tier-info">
                <img 
                  src={`/icon/${tier.icon}.svg`} 
                  alt={tier.name}
                  className="tier-icon"
                />
                <span className="tier-name">{tier.name}</span>
                <span className="tier-count">{tier.count.toLocaleString()}</span>
              </div>
              <div className="tier-bar-track">
                <div 
                  className="tier-bar-fill"
                  style={{
                    width: `${percentage}%`,
                    background: tier.gradient
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
        <span className="tier-summary-label">Total Users</span>
        <span className="tier-summary-value">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
