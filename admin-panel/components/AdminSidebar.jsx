import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function AdminSidebar({ isOpen, onToggle }) {
  const menuItems = [
    { path: '/', icon: 'layout-dashboard.svg', label: 'Dashboard', exact: true },
    { path: '/notifications', icon: 'bell.svg', label: 'Notifications' },
    { path: '/users', icon: 'users.svg', label: 'Users' },
    { path: '/orders', icon: 'dollar-sign.svg', label: 'Orders & Revenue' },
    { path: '/support', icon: 'headphones.svg', label: 'Support' },
    { path: '/analytics', icon: 'chart-line.svg', label: 'Analytics' },
    { path: '/activity-logs', icon: 'activity.svg', label: 'Activity Logs' },
    { path: '/logs', icon: 'file-text.svg', label: 'System Logs' },
    { path: '/settings', icon: 'settings.svg', label: 'Settings' },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-primary text-primary-foreground transition-all duration-200 z-[1000] flex flex-col",
      isOpen ? "w-[240px]" : "w-[64px]"
    )}>
      {/* Header */}
      <div className="p-5 border-b border-border-dark min-h-16 flex items-center">
        <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <img src="/icon/shield-check.svg" alt="Logo" className="w-6 h-6 icon-white" />
          {isOpen && <span>Admin</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => cn(
              "flex items-center gap-3 py-3 text-sm font-medium transition-all duration-150 border-l-2 border-transparent",
              isOpen ? "px-5" : "px-0 justify-center",
              isActive 
                ? "bg-surface-dark text-primary-foreground border-l-primary-foreground" 
                : "text-muted hover:bg-surface-dark hover:text-primary-foreground"
            )}
            title={!isOpen ? item.label : ''}
          >
            <img 
              src={`/icon/${item.icon}`} 
              alt={item.label} 
              className="w-5 h-5 min-w-5 icon-gray group-hover:icon-white" 
            />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-dark">
        <button 
          className="w-full p-2.5 bg-transparent border border-border-dark rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-surface-dark hover:border-secondary"
          onClick={onToggle} 
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          <img 
            src={isOpen ? '/icon/chevron-left.svg' : '/icon/chevron-right.svg'} 
            alt="Toggle" 
            className="w-4 h-4 icon-gray hover:icon-white"
          />
        </button>
      </div>
    </div>
  );
}
