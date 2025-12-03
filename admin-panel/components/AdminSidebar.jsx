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
      "fixed left-0 top-0 h-screen bg-primary text-primary-foreground z-[1000] flex flex-col",
      "transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
      isOpen ? "w-[260px]" : "w-[72px]"
    )}>
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/10 min-h-[68px] flex items-center">
        <div className="flex items-center gap-3 text-[17px] font-semibold tracking-[-0.015em]">
          <img src="/icon/shield-check.svg" alt="Logo" className="w-7 h-7 icon-white" />
          {isOpen && <span>Admin</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => cn(
              "flex items-center gap-3 py-2.5 text-[14px] font-medium rounded-xl mb-0.5",
              "transition-all duration-[200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
              isOpen ? "px-4" : "px-0 justify-center",
              isActive 
                ? "bg-white/15 text-primary-foreground" 
                : "text-white/60 hover:bg-white/10 hover:text-white/90"
            )}
            title={!isOpen ? item.label : ''}
          >
            <img 
              src={`/icon/${item.icon}`} 
              alt={item.label} 
              className="w-[18px] h-[18px] min-w-[18px] icon-gray group-hover:icon-white" 
            />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button 
          className={cn(
            "w-full p-2.5 bg-transparent border border-white/15 rounded-xl cursor-pointer",
            "transition-all duration-200 flex items-center justify-center",
            "hover:bg-white/10 hover:border-white/25 active:scale-[0.97]"
          )}
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
