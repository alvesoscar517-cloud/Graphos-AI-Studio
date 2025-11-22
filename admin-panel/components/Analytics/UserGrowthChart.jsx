import './UserGrowthChart.css';

export default function UserGrowthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <img src="/admin/icon/inbox.svg" alt="Empty" className="chart-empty-icon" />
        <p className="chart-empty-text">No growth data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="user-growth-container">
      <div className="user-growth-chart">
        <div className="user-growth-y-axis" />
        
        {data.map((item, index) => {
          const height = (item.count / maxCount) * 100;
          return (
            <div key={index} className="user-growth-bar-wrapper">
              <div 
                className="user-growth-bar"
                style={{ height: `${height}%` }}
                title={`${item.date}: ${item.count} users`}
              >
                <span className="user-growth-bar-label">{item.count}</span>
              </div>
              <div className="user-growth-date">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
