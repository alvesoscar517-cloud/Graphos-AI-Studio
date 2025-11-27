import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './ConfirmDialog.css';

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
  
  const icons = {
    warning: '/icon/alert-triangle.svg',
    danger: '/icon/alert-octagon.svg',
    info: '/icon/info.svg'
  };

  return createPortal(
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon confirm-icon-${type}`}>
          <img src={icons[type]} alt={type} />
        </div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary btn-confirm-cancel" onClick={onCancel}>
            {cancelText || t('common.cancel')}
          </button>
          <button 
            className={`btn-confirm-ok ${type === 'danger' ? 'btn-danger' : type === 'warning' ? 'btn-confirm-warning' : 'btn-primary'}`} 
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
