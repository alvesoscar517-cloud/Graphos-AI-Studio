import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

export default function StatsCard({ icon, title, value, subtitle, change, onClick }) {
  return (
    <Card 
      className={cn(
        "p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
        "transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        onClick && "cursor-pointer hover:shadow-lg hover:border-border/60 active:scale-[0.98]"
      )} 
      onClick={onClick}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-surface-secondary/80 flex items-center justify-center flex-shrink-0">
        <img src={`/icon/${icon}`} alt={title} className="w-5 h-5 sm:w-6 sm:h-6 icon-dark" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-[0.02em] truncate">{title}</h3>
        <p className="text-[20px] sm:text-[24px] font-bold text-primary mt-0.5 sm:mt-1 tracking-[-0.02em]">{value}</p>
        {subtitle && <p className="text-[11px] sm:text-[12px] text-muted mt-0.5 truncate">{subtitle}</p>}
        {change && <p className="text-[11px] sm:text-[12px] text-success mt-0.5 font-medium truncate">{change}</p>}
      </div>
      
      {onClick && (
        <div className="flex-shrink-0 hidden sm:block">
          <img src="/icon/chevron-right.svg" alt="View" className="w-5 h-5 icon-gray" />
        </div>
      )}
    </Card>
  );
}
