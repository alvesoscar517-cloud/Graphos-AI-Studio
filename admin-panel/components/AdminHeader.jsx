import './AdminHeader.css';

export default function AdminHeader({ onLogout, onToggleSidebar }) {
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <img src="/admin/icon/menu.svg" alt="Menu" />
        </button>
        <h2 className="page-title">Admin Panel</h2>
      </div>

      <div className="header-right">
        <div className="admin-user">
          <img src="/admin/icon/user-circle.svg" alt="User" className="user-icon" />
          <span className="user-name">Admin</span>
        </div>
        
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <img src="/admin/icon/log-out.svg" alt="Logout" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
