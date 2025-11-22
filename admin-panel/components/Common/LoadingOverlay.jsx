import { createPortal } from 'react-dom';
import './LoadingOverlay.css';

export default function LoadingOverlay({ message = 'Loading...' }) {
  return createPortal(
    <div className="loading-overlay">
      <div className="loading-overlay-spinner"></div>
      {message && <div className="loading-text">{message}</div>}
    </div>,
    document.body
  );
}
