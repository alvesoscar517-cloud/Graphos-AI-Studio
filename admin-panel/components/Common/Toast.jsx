import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import './Toast.css';

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
    <div className={`toast toast-${type}`}>
      <img src={icons[type]} alt={type} className="toast-icon" />
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <img src="/icon/x.svg" alt="Close" />
      </button>
    </div>,
    document.body
  );
}
