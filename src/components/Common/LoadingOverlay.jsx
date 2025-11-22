import { createPortal } from 'react-dom';
import Spinner from './Spinner';
import './Spinner.css';

export default function LoadingOverlay({ message = 'Đang tải...' }) {
  return createPortal(
    <div className="loading-overlay">
      <Spinner size="large" color="primary" />
      <div className="loading-text">{message}</div>
    </div>,
    document.body
  );
}
