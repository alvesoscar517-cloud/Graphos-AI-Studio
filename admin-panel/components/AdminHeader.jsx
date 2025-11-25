import { useRealtime } from '../contexts/RealtimeContext';
import RealtimeIndicator from './Common/RealtimeIndicator';
import './AdminHeader.css';

export default function AdminHeader({ onLogout, onToggleSidebar }) {
  const { overview } = useRealtime();
  
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <img src="/icon/menu.svg" alt="Menu" />
        </button>
        <h2 className="page-title">Admin Panel</h2>
      </div>

      <div className="header-right">
        <RealtimeIndicator 
          isConnected={true} 
          lastUpdate={overview?.timestamp}
        />
        
        <div className="admin-user">
          <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
          </svg>
          <span className="user-name">Admin</span>
        </div>
        
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <img src="/icon/log-out.svg" alt="Logout" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
