import { createPortal } from 'react-dom';
// CSS migrated to Tailwind

export default function LoadingOverlay({ message = 'Loading...' }) {
  return createPortal(
    <div className="loading-overlay">
      <div className="loading-overlay-spinner"></div>
      {message && <div className="loading-text">{message}</div>}
    </div>,
    document.body
  );
}
