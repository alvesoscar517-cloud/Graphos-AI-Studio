import './StatsCard.css';

export default function StatsCard({ icon, title, value, subtitle, change }) {
  return (
    <div className="stats-card">
      <div className="stats-icon">
        <img src={`/icon/${icon}`} alt={title} />
      </div>
      
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
        {change && <p className="stats-change">{change}</p>}
      </div>
    </div>
  );
}
