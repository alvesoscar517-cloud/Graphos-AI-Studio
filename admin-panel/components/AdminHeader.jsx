import { useRealtime } from '../contexts/RealtimeContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import RealtimeIndicator from './Common/RealtimeIndicator';
import './AdminHeader.css';

export default function AdminHeader({ onLogout, onToggleSidebar }) {
  const { overview } = useRealtime();
  const { admin } = useAdminAuth();
  
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
          <div className="user-avatar">
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="user-info">
            <span className="user-name">{admin?.name || 'Admin'}</span>
            <span className="user-email">{admin?.email || ''}</span>
          </div>
        </div>
        
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <img src="/icon/log-out.svg" alt="Logout" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
