export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-secondary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs flex-shrink-0">
          <img src={`/icon/${icon}`} alt={title} className="w-5 h-5 sm:w-6 sm:h-6 icon-dark" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-primary tracking-[-0.02em] truncate">{title}</h1>
          {subtitle && <p className="text-[13px] sm:text-[14px] text-muted mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {actions}
        </div>
      )}
    </header>
  );
}
