import { useTranslation } from 'react-i18next'
import { useUser } from '../../../stores/authStore'
import { cn } from '../../../lib/utils'
import QuickActions from './QuickActions'

import { PanelLeft, PanelRight } from 'lucide-react'
const WorkspaceDefault = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar, 
  rightSidebarHidden, 
  onSendMessage,
  chatInput // Render prop for SharedChatInput
}) => {
  const { t } = useTranslation()
  const user = useUser() // Use Zustand store directly

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-bg-tertiary relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 py-2 px-4 border-b border-border-light h-14 shrink-0">
        <button 
          className={cn("p-1.5 bg-transparent border-none cursor-pointer rounded-full","w-8 h-8 shrink-0 flex items-center justify-center","transition-colors duration-200","hover:bg-bg-hover"
          )}
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')} 
          data-tooltip-position="right"
        >
          <PanelLeft size={20} className="opacity-60" />
        </button>
        
        <span className="text-sm font-medium text-text-primary">
          {t('nav.aiWorkspace')}
        </span>
        
        {rightSidebarHidden && (
          <div className="ml-auto">
            <button 
              className={cn("p-1.5 bg-transparent border-none cursor-pointer rounded-full","w-8 h-8 flex items-center justify-center","transition-colors duration-200","hover:bg-bg-hover"
              )}
              onClick={onToggleRightSidebar}
              data-tooltip={t('nav.sidebar')} 
              data-tooltip-position="left"
            >
              <PanelRight size={20} className="opacity-60" />
            </button>
          </div>
        )}
      </div>

      {/* Content - Flexbox centered layout with equal spacing */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 max-w-3xl mx-auto w-full">
        {/* Title */}
        <h1 className="text-3xl font-normal text-text-primary m-0 text-center">
          {t('workspace.hello', { name: user?.name || user?.email?.split('@')[0] || 'friend' })}
        </h1>
        
        {/* Search Input - rendered via prop */}
        <div className="w-full">
          {chatInput}
        </div>
        
        {/* Quick Actions */}
        <QuickActions onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}

export default WorkspaceDefault
