import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

export default function StatsCard({ icon, title, value, subtitle, change, onClick }) {
  return (
    <Card 
      className={cn(
        "p-5 flex items-center gap-4 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary"
      )} 
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
        <img src={`/icon/${icon}`} alt={title} className="w-6 h-6 icon-dark" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-primary mt-1">{value}</p>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        {change && <p className="text-xs text-success mt-0.5">{change}</p>}
      </div>
      
      {onClick && (
        <div className="flex-shrink-0">
          <img src="/icon/chevron-right.svg" alt="View" className="w-5 h-5 icon-gray" />
        </div>
      )}
    </Card>
  );
}
