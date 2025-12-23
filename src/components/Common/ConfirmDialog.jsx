import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function ConfirmDialog({ 
  title, 
  message, 
  confirmText, 
  cancelText,
  type = 'warning',
  onConfirm, 
  onCancel 
}) {
  const { t } = useTranslation();
  
  const IconComponent = {
    warning: AlertTriangle,
    danger: AlertOctagon,
    info: Info
  }[type] || AlertTriangle;

  const iconColorClass = {
    warning: 'text-warning',
    danger: 'text-error',
    info: 'text-primary'
  }[type] || 'text-warning';

  return createPortal(
    <div 
      className={cn(
        "modal-overlay p-5",
        "max-md:p-3 max-md:items-end"
      )}
      onClick={onCancel}
    >
      <div 
        className={cn(
          "modal-content p-6 max-w-modal-sm w-full text-center",
          "max-md:max-w-full max-md:rounded-t-2xl max-md:rounded-b-none max-md:p-5"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5",
          type === 'warning' && "bg-system-orange/15",
          type === 'danger' && "bg-system-red/15",
          type === 'info' && "bg-system-blue/15"
        )}>
          <IconComponent size={28} className={iconColorClass} />
        </div>

        {/* Title */}
        <h2 className="m-0 mb-2 text-title3 font-semibold text-text-primary">
          {title}
        </h2>

        {/* Message */}
        <p className="m-0 mb-6 text-body text-label-secondary leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 max-md:flex-col-reverse">
          <button 
            className="btn btn-secondary flex-1"
            onClick={onCancel}
          >
            {cancelText || t('common.cancel')}
          </button>
          <button 
            className={cn(
              "btn flex-1",
              type === 'danger' ? "btn-danger" : "btn-primary"
            )}
            onClick={onConfirm}
          >
            {confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
