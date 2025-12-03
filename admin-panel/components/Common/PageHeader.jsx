export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-surface-secondary/80 rounded-2xl flex items-center justify-center shadow-xs">
          <img src={`/icon/${icon}`} alt={title} className="w-6 h-6 icon-dark" />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold text-primary tracking-[-0.02em]">{title}</h1>
          {subtitle && <p className="text-[14px] text-muted mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </header>
  );
}
