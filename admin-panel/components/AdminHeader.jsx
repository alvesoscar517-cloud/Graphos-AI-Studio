import { useRealtime } from '../contexts/RealtimeContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import RealtimeIndicator from './Common/RealtimeIndicator';
import { Button } from './ui/button';
import { getInitials } from '@/lib/utils';

export default function AdminHeader({ onLogout, onToggleSidebar }) {
  const { overview } = useRealtime();
  const { admin } = useAdminAuth();
  
  return (
    <header className="bg-surface/80 backdrop-blur-xl px-6 flex justify-between items-center border-b border-border/40 sticky top-0 z-[100] h-[68px]">
      <div className="flex items-center gap-4">
        <button 
          className="hidden md:hidden p-2 rounded-xl hover:bg-surface-secondary/80 transition-all duration-200 active:scale-[0.97]"
          onClick={onToggleSidebar}
        >
          <img src="/icon/menu.svg" alt="Menu" className="w-5 h-5 icon-dark" />
        </button>
        <h2 className="text-[17px] font-semibold text-primary tracking-[-0.015em]">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-3">
        <RealtimeIndicator 
          isConnected={true} 
          lastUpdate={overview?.timestamp}
        />
        
        <div className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-4 bg-surface-secondary/80 rounded-full transition-all duration-200 hover:bg-surface-secondary">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
            {getInitials(admin?.name) || 'A'}
          </div>
          <div className="hidden sm:flex flex-col gap-0.5">
            <span className="font-semibold text-primary text-[13px] leading-tight tracking-[-0.01em]">{admin?.name || 'Admin'}</span>
            <span className="text-[11px] text-muted leading-tight">{admin?.email || ''}</span>
          </div>
        </div>
        
        <Button 
          variant="primary"
          size="sm"
          onClick={onLogout} 
          title="Logout"
          className="gap-1.5"
        >
          <img src="/icon/log-out.svg" alt="" className="w-4 h-4 icon-white" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
