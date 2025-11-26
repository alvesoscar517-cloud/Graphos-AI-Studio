import './StatsCard.css';

export default function StatsCard({ icon, title, value, subtitle, change, onClick }) {
  return (
    <div className={`stats-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stats-icon">
        <img src={`/icon/${icon}`} alt={title} />
      </div>
      
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
        {change && <p className="stats-change">{change}</p>}
      </div>
      
      {onClick && (
        <div className="stats-arrow">
          <img src="/icon/chevron-right.svg" alt="View" />
        </div>
      )}
    </div>
  );
}
