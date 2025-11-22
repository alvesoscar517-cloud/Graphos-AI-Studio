import './AdminHeader.css';

export default function AdminHeader({ onLogout, onToggleSidebar }) {
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <img src="/icon/menu.svg" alt="Menu" />
        </button>
        <h2 className="page-title">Admin Panel</h2>
      </div>

      <div className="header-right">
        <div className="admin-user">
          <img src="/icon/user-circle.svg" alt="User" className="user-icon" />
          <span className="user-name">Admin</span>
        </div>
        
        <button className="logout-btn" onClick={onLogout} title="Đăng xuất">
          <img src="/icon/log-out.svg" alt="Logout" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
