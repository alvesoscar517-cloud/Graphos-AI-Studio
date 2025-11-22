import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

export default function AdminSidebar({ isOpen, onToggle }) {
  const menuItems = [
    { path: '/', icon: 'layout-dashboard.svg', label: 'Dashboard', exact: true },
    { path: '/notifications', icon: 'bell.svg', label: 'Thông báo' },
    { path: '/users', icon: 'users.svg', label: 'Người dùng' },
    { path: '/analytics', icon: 'chart-line.svg', label: 'Thống kê' },
    { path: '/settings', icon: 'settings.svg', label: 'Cài đặt' },
  ];

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/icon/shield-check.svg" alt="Logo" className="logo-icon" />
          {isOpen && <span className="logo-text">Admin</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={!isOpen ? item.label : ''}
          >
            <img src={`/icon/${item.icon}`} alt={item.label} className="nav-icon" />
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="toggle-btn" onClick={onToggle} title={isOpen ? 'Thu gọn' : 'Mở rộng'}>
          <img 
            src={isOpen ? '/icon/chevron-left.svg' : '/icon/chevron-right.svg'} 
            alt="Toggle" 
          />
        </button>
      </div>
    </div>
  );
}
