import { createPortal } from 'react-dom';
import './ConfirmDialog.css';

export default function ConfirmDialog({ 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm, 
  onCancel 
}) {
  const icons = {
    warning: '/admin/icon/alert-triangle.svg',
    danger: '/admin/icon/alert-octagon.svg',
    info: '/admin/icon/info.svg'
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
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-ok ${type === 'danger' ? 'btn-danger' : type === 'warning' ? 'btn-confirm-warning' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
