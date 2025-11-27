import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../contexts/AuthContext'
import './WorkspaceDefault.css'

const WorkspaceDefault = ({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarHidden }) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="workspace-default">
      <div className="workspace-default-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')} 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt={t('common.menu')} />
        </button>
        
        <span className="workspace-default-title">{t('nav.aiWorkspace')}</span>
        
        {rightSidebarHidden && (
          <div style={{ marginLeft: 'auto' }}>
            <button 
              className="icon-btn"
              onClick={onToggleRightSidebar}
              data-tooltip={t('nav.sidebar')} 
              data-tooltip-position="left"
            >
              <img src="/icon/panel-right.svg" alt={t('nav.sidebar')} />
            </button>
          </div>
        )}
      </div>

      <div className="workspace-default-content">
        <div className="workspace-welcome">
          <h1 className="workspace-welcome-text">
            {t('workspace.hello', { name: user?.name || user?.email?.split('@')[0] || 'friend' })}
          </h1>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceDefault
