import { useAuth } from '../../../contexts/AuthContext'
import './WorkspaceDefault.css'

const WorkspaceDefault = ({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarHidden }) => {
  const { user } = useAuth()

  return (
    <div className="workspace-default">
      <div className="workspace-default-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Toggle sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Sidebar" />
        </button>
        
        <span className="workspace-default-title">AI Workspace</span>
        
        {rightSidebarHidden && (
          <div style={{ marginLeft: 'auto' }}>
            <button 
              className="icon-btn"
              onClick={onToggleRightSidebar}
              data-tooltip="Open sidebar" 
              data-tooltip-position="left"
            >
              <img src="/icon/panel-right.svg" alt="Toggle Right Sidebar" />
            </button>
          </div>
        )}
      </div>

      <div className="workspace-default-content">
        <div className="workspace-welcome">
          <h1 className="workspace-welcome-text">
            Hello, {user?.name || user?.email?.split('@')[0] || 'friend'}
          </h1>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceDefault
