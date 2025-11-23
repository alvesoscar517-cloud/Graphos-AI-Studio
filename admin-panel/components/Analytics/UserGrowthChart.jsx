import './UserGrowthChart.css';

// Group data by week to reduce number of bars
function groupByWeek(data) {
  if (!data || data.length === 0) return [];
  
  const weeks = {};
  data.forEach(item => {
    const date = new Date(item.date);
    // Get week number
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        date: weekKey,
        count: 0,
        items: []
      };
    }
    weeks[weekKey].count += item.count;
    weeks[weekKey].items.push(item);
  });
  
  return Object.values(weeks).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
}

export default function UserGrowthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <img src="/icon/inbox.svg" alt="Empty" className="chart-empty-icon" />
        <p className="chart-empty-text">No growth data available</p>
      </div>
    );
  }

  // Group by week if more than 14 data points
  const displayData = data.length > 14 ? groupByWeek(data) : data;
  const maxCount = Math.max(...displayData.map(d => d.count), 1);

  return (
    <div className="user-growth-container">
      <div className="user-growth-chart">
        <div className="user-growth-y-axis" />
        
        {displayData.map((item, index) => {
          const height = (item.count / maxCount) * 100;
          const date = new Date(item.date);
          const isWeekly = item.items && item.items.length > 1;
          
          return (
            <div key={index} className="user-growth-bar-wrapper">
              <div 
                className="user-growth-bar"
                style={{ height: `${height}%` }}
                title={isWeekly 
                  ? `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${item.count} users`
                  : `${item.date}: ${item.count} users`
                }
              >
                <span className="user-growth-bar-label">{item.count}</span>
              </div>
              <div className="user-growth-date">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {isWeekly && <div className="week-indicator">Week</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
