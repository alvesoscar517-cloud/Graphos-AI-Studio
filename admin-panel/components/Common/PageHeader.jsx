import './PageHeader.css';

export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div className="page-header-title">
        <div className="page-header-icon">
          <img src={`/admin/icon/${icon}`} alt={title} />
        </div>
        <div className="page-header-content">
          <h1 className="page-header-h1">{title}</h1>
          <p className="page-header-subtitle">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
