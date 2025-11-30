import { useRealtime } from '../contexts/RealtimeContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import RealtimeIndicator from './Common/RealtimeIndicator';
import { Button } from './ui/button';
import { getInitials } from '@/lib/utils';

export default function AdminHeader({ onLogout, onToggleSidebar }) {
  const { overview } = useRealtime();
  const { admin } = useAdminAuth();
  
  return (
    <header className="bg-surface px-6 flex justify-between items-center border-b border-border-light sticky top-0 z-[100] h-16">
      <div className="flex items-center gap-4">
        <button 
          className="hidden md:hidden p-2 rounded-md hover:bg-surface-secondary transition-colors"
          onClick={onToggleSidebar}
        >
          <img src="/icon/menu.svg" alt="Menu" className="w-5 h-5 icon-dark" />
        </button>
        <h2 className="text-lg font-semibold text-primary tracking-tight">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-3">
        <RealtimeIndicator 
          isConnected={true} 
          lastUpdate={overview?.timestamp}
        />
        
        <div className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3.5 bg-surface-secondary rounded-pill">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {getInitials(admin?.name) || 'A'}
          </div>
          <div className="hidden sm:flex flex-col gap-px">
            <span className="font-semibold text-primary text-sm leading-tight">{admin?.name || 'Admin'}</span>
            <span className="text-xxs text-muted leading-tight">{admin?.email || ''}</span>
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
