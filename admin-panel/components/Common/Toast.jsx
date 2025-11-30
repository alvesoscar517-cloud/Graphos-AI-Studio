import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const toastStyles = {
  success: 'border-l-success',
  error: 'border-l-destructive',
  warning: 'border-l-warning',
  info: 'border-l-info',
};

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const portalContainerRef = useRef(null);

  useEffect(() => {
    const shadowContainer = document.querySelector('#admin-root') || document.body;
    portalContainerRef.current = shadowContainer;
  }, []);

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

  const toastContent = (
    <div 
      className={cn(
        "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-surface rounded-lg shadow-lg",
        "min-w-[300px] max-w-[420px] z-[3000] border-l-4 animate-[slideIn_0.3s_ease]",
        toastStyles[type]
      )}
    >
      <img src={icons[type]} alt={type} className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-sm text-primary">{message}</span>
      <button 
        className="bg-transparent border-none p-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
        onClick={onClose}
      >
        <img src="/icon/x.svg" alt="Close" className="w-4 h-4 icon-dark" />
      </button>
    </div>
  );

  if (portalContainerRef.current && portalContainerRef.current.id === 'admin-root') {
    return toastContent;
  }

  return portalContainerRef.current 
    ? createPortal(toastContent, portalContainerRef.current)
    : toastContent;
}
