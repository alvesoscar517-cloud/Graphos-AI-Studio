import { useState } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logoutAdmin } = useAdminAuth();

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`admin-main ${sidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <AdminHeader onLogout={logoutAdmin} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
