import { useRealtime } from '../contexts/RealtimeContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import RealtimeIndicator from './Common/RealtimeIndicator';
import { Button } from './ui/button';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminHeader({ onLogout, onToggleSidebar, isMobile, sidebarOpen }) {
  const { overview } = useRealtime();
  const { admin } = useAdminAuth();
  
  return (
    <header className={cn(
      "bg-surface/80 backdrop-blur-xl flex justify-between items-center border-b border-border/40 sticky top-0 z-[100] h-[60px] sm:h-[68px]",
      "px-4 sm:px-6"
    )}>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button - always visible on mobile/tablet */}
        <button 
          className={cn(
            "p-2 rounded-xl hover:bg-surface-secondary/80 transition-all duration-200 active:scale-[0.97]",
            "lg:hidden" // Hide on desktop (lg and above)
          )}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <img 
            src={sidebarOpen && isMobile ? "/icon/x.svg" : "/icon/menu.svg"} 
            alt="Menu" 
            className="w-5 h-5 icon-dark" 
          />
        </button>
        <h2 className="text-[15px] sm:text-[17px] font-semibold text-primary tracking-[-0.015em]">
          <span className="hidden sm:inline">Admin Panel</span>
          <span className="sm:hidden">Admin</span>
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Realtime indicator - hide on very small screens */}
        <div className="hidden xs:block">
          <RealtimeIndicator 
            isConnected={true} 
            lastUpdate={overview?.timestamp}
          />
        </div>
        
        {/* User info - responsive */}
        <div className="flex items-center gap-2 sm:gap-2.5 py-1 sm:py-1.5 pl-1 sm:pl-1.5 pr-2 sm:pr-4 bg-surface-secondary/80 rounded-full transition-all duration-200 hover:bg-surface-secondary">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[12px] sm:text-[13px] font-semibold flex-shrink-0">
            {getInitials(admin?.name) || 'A'}
          </div>
          <div className="hidden md:flex flex-col gap-0.5">
            <span className="font-semibold text-primary text-[13px] leading-tight tracking-[-0.01em]">{admin?.name || 'Admin'}</span>
            <span className="text-[11px] text-muted leading-tight">{admin?.email || ''}</span>
          </div>
        </div>
        
        {/* Logout button - icon only on mobile */}
        <Button 
          variant="primary"
          size="sm"
          onClick={onLogout} 
          title="Logout"
          className="gap-1.5 px-2 sm:px-3"
        >
          <img src="/icon/log-out.svg" alt="" className="w-4 h-4 icon-white" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
