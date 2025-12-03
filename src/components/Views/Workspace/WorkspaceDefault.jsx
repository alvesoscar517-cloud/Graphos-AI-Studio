import { useTranslation } from 'react-i18next'
import { useUser } from '../../../stores/authStore'
import { cn } from '../../../lib/utils'

const WorkspaceDefault = ({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarHidden }) => {
  const { t } = useTranslation()
  const user = useUser() // Use Zustand store directly

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-bg-tertiary relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 py-2 px-4 border-b border-border-light h-14 shrink-0">
        <button 
          className={cn(
            "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
            "w-8 h-8 shrink-0 flex items-center justify-center",
            "transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')} 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt={t('common.menu')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
        </button>
        
        <span className="text-sm font-medium text-text-primary">
          {t('nav.aiWorkspace')}
        </span>
        
        {rightSidebarHidden && (
          <div className="ml-auto">
            <button 
              className={cn(
                "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
                "w-8 h-8 flex items-center justify-center",
                "transition-colors duration-200",
                "hover:bg-bg-hover"
              )}
              onClick={onToggleRightSidebar}
              data-tooltip={t('nav.sidebar')} 
              data-tooltip-position="left"
            >
              <img src="/icon/panel-right.svg" alt={t('nav.sidebar')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-40 relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl max-md:text-2xl font-normal text-text-primary m-0">
            {t('workspace.hello', { name: user?.name || user?.email?.split('@')[0] || 'friend' })}
          </h1>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceDefault
