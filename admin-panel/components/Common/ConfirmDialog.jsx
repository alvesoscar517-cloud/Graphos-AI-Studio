import { useEffect, useRef } from 'react';
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
  const portalContainerRef = useRef(null);

  useEffect(() => {
    const shadowContainer = document.querySelector('#admin-root') || document.body;
    portalContainerRef.current = shadowContainer;
  }, []);

  const icons = {
    warning: '/icon/alert-triangle.svg',
    danger: '/icon/alert-octagon.svg',
    info: '/icon/info.svg'
  };

  const dialogContent = (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className={`confirm-dialog confirm-dialog-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">
          <div className={`confirm-icon confirm-icon-${type}`}>
            <img src={icons[type]} alt={type} />
          </div>
        </div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-confirm-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-ok ${type === 'danger' ? 'btn-confirm-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  if (portalContainerRef.current && portalContainerRef.current.id === 'admin-root') {
    return dialogContent;
  }

  return portalContainerRef.current 
    ? createPortal(dialogContent, portalContainerRef.current)
    : dialogContent;
}
