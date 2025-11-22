import './UserGrowthChart.css';

export default function UserGrowthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <img src="/icon/inbox.svg" alt="Empty" />
        <p>Chưa có dữ liệu</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="user-growth-chart">
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar"
              style={{ 
                height: `${(item.count / maxCount) * 100}%`,
                background: '#000'
              }}
              title={`${item.date}: ${item.count} users`}
            >
              <span className="bar-value">{item.count}</span>
            </div>
            <div className="bar-label">
              {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
