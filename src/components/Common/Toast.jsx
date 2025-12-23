import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }[type] || Info;

  const iconColorClass = {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-primary'
  }[type] || 'text-primary';

  return createPortal(
    <div className={cn(
      "fixed top-6 right-6 min-w-toast max-w-toast-max py-4 px-5",
      "bg-bg-secondary border border-border rounded-md shadow-elevated",
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
        <IconComponent size={20} className={iconColorClass} />
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
        data-tooltip="Close"
        data-tooltip-position="left"
      >
        <X size={16} className="text-current" />
      </button>
    </div>,
    document.body
  );
}
