import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const portalContainerRef = useRef(null);

  useEffect(() => {
    // Find the shadow root container or use document.body as fallback
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
    <div className={`toast toast-${type}`}>
      <img src={icons[type]} alt={type} className="toast-icon" />
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <img src="/icon/x.svg" alt="Close" />
      </button>
    </div>
  );

  // If we're in Shadow DOM, render directly instead of using portal
  if (portalContainerRef.current && portalContainerRef.current.id === 'admin-root') {
    return toastContent;
  }

  // Fallback to portal for non-shadow DOM
  return portalContainerRef.current 
    ? createPortal(toastContent, portalContainerRef.current)
    : toastContent;
}
