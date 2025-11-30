export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-surface-secondary rounded-xl flex items-center justify-center">
          <img src={`/icon/${icon}`} alt={title} className="w-6 h-6 icon-dark" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
