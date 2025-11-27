import './TierDistributionChart.css';

export default function TierDistributionChart({ data }) {
  // Support both old tierDistribution and new creditDistribution format
  const isCreditsData = data.noCredits !== undefined || data.low !== undefined;
  
  if (isCreditsData) {
    const total = (data.noCredits || 0) + (data.low || 0) + (data.medium || 0) + (data.high || 0);

    if (total === 0) {
      return (
        <div className="chart-empty">
          <img src="/icon/inbox.svg" alt="Empty" className="chart-empty-icon" />
          <p className="chart-empty-text">No user data available</p>
        </div>
      );
    }

    const segments = [
      { 
        name: 'No Credits', 
        count: data.noCredits || 0, 
        gradient: 'linear-gradient(135deg, #ef9a9a 0%, #e57373 100%)',
        icon: 'alert-circle'
      },
      { 
        name: 'Low (1-50)', 
        count: data.low || 0, 
        gradient: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%)',
        icon: 'trending-down'
      },
      { 
        name: 'Medium (51-200)', 
        count: data.medium || 0, 
        gradient: 'linear-gradient(135deg, #b3e5fc 0%, #81d4fa 100%)',
        icon: 'minus'
      },
      { 
        name: 'High (200+)', 
        count: data.high || 0, 
        gradient: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
        icon: 'trending-up'
      }
    ];

    return (
      <div className="tier-distribution-container">
        <div className="tier-bars-container">
          {segments.map((segment, index) => {
            const percentage = ((segment.count / total) * 100).toFixed(1);
            return (
              <div key={index} className="tier-row">
                <div className="tier-info">
                  <img 
                    src={`/icon/${segment.icon}.svg`} 
                    alt={segment.name}
                    className="tier-icon"
                  />
                  <span className="tier-name">{segment.name}</span>
                  <span className="tier-count">{segment.count.toLocaleString()}</span>
                </div>
                <div className="tier-bar-track">
                  <div 
                    className="tier-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      background: segment.gradient
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

  // Fallback for old tier data format (free/premium/enterprise)
  const total = (data.free || 0) + (data.premium || 0) + (data.enterprise || 0);

  if (total === 0) {
    return (
      <div className="chart-empty">
        <img src="/icon/inbox.svg" alt="Empty" className="chart-empty-icon" />
        <p className="chart-empty-text">No user data available</p>
      </div>
    );
  }

  // Show all users as single category since system only has credits-based users
  return (
    <div className="tier-distribution-container">
      <div className="tier-bars-container">
        <div className="tier-row">
          <div className="tier-info">
            <img src="/icon/users.svg" alt="Users" className="tier-icon" />
            <span className="tier-name">All Users</span>
            <span className="tier-count">{total.toLocaleString()}</span>
          </div>
          <div className="tier-bar-track">
            <div 
              className="tier-bar-fill"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #b3e5fc 0%, #81d4fa 100%)'
              }}
            >
              <span className="tier-percentage">100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tier-summary">
        <span className="tier-summary-label">Total Users</span>
        <span className="tier-summary-value">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
