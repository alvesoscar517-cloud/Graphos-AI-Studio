import { cn } from '../../lib/utils';

export default function Spinner({ size = 'medium', color = 'primary' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
    large: 'w-10 h-10 border-3'
  };

  const colorClasses = {
    primary: 'border-fill-secondary border-t-system-blue',
    white: 'border-white/20 border-t-white',
    blue: 'border-system-blue/20 border-t-system-blue'
  };

  return (
    <div className="inline-flex items-center justify-center">
      <div className={cn(
        "rounded-full border-solid",
        "animate-spin",
        sizeClasses[size],
        colorClasses[color]
      )} 
      style={{ animationDuration: '0.8s' }}
      />
    </div>
  );
}
