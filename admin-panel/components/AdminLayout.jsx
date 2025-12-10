import { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
// CSS migrated to Tailwind

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { logoutAdmin } = useAdminAuth();

  // Handle responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
      // Auto-open sidebar on desktop
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking overlay on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <div 
        className={`admin-sidebar-overlay ${isMobile && sidebarOpen ? 'visible' : ''}`}
        onClick={handleOverlayClick}
      />
      
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />
      
      <div className={`admin-main ${sidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <AdminHeader 
          onLogout={logoutAdmin} 
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
        />
        
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
