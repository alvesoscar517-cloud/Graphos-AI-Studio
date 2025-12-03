import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '/icon/check-circle.svg',
    error: '/icon/x-circle.svg',
    warning: '/icon/alert-triangle.svg',
    info: '/icon/info.svg'
  };

  return createPortal(
    <div className={cn(
      "fixed top-6 right-6 min-w-toast max-w-toast-max py-4 px-5",
      "bg-bg-secondary rounded-md shadow-elevated",
      "flex items-center gap-3 z-toast",
      "animate-slide-in backdrop-blur-xl",
      "dark:bg-gray-900",
      "max-md:top-4 max-md:right-4 max-md:left-4 max-md:min-w-0"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        type === 'success' && "bg-system-green/15",
        type === 'error' && "bg-system-red/15",
        type === 'warning' && "bg-system-orange/15",
        type === 'info' && "bg-system-blue/15"
      )}>
        <img 
          src={icons[type]} 
          alt={type} 
          className={cn(
            "w-5 h-5",
            type === 'success' && "filter-icon-success",
            type === 'error' && "filter-icon-error",
            type === 'warning' && "filter-icon-warning",
            type === 'info' && "filter-icon-primary"
          )} 
        />
      </div>
      <span className="flex-1 text-text-primary font-medium text-body leading-relaxed">
        {message}
      </span>
      <button 
        className={cn(
          "p-1.5 bg-transparent border-none cursor-pointer rounded-sm shrink-0",
          "transition-all duration-200",
          "hover:bg-fill-tertiary"
        )}
        onClick={onClose}
      >
        <img src="/icon/x.svg" alt="Close" className="w-4 h-4 block icon-invert" />
      </button>
    </div>,
    document.body
  );
}
