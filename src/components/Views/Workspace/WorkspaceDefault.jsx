import { useAuth } from '../../../contexts/AuthContext'
import './WorkspaceDefault.css'

const WorkspaceDefault = ({ onToggleLeftSidebar, onStartChat, onToggleRightSidebar, rightSidebarHidden }) => {
  const { user } = useAuth()

  return (
    <div className="workspace-default">
      <div className="workspace-default-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Ẩn/hiện sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Sidebar" />
        </button>
        
        <span className="workspace-default-title">AI Workspace</span>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {rightSidebarHidden && (
            <button 
              className="icon-btn"
              onClick={onToggleRightSidebar}
              data-tooltip="Mở sidebar" 
              data-tooltip-position="left"
            >
              <img src="/icon/panel-right.svg" alt="Toggle Right Sidebar" />
            </button>
          )}
          <button 
            className="icon-btn"
            onClick={onStartChat}
            data-tooltip="New chat" 
            data-tooltip-position="left"
          >
            <img src="/icon/plus.svg" alt="New Chat" />
          </button>
        </div>
      </div>

      <div className="workspace-default-content">
        <div className="workspace-welcome">
          <h1 className="workspace-welcome-text">
            Xin chào, {user?.name || user?.email?.split('@')[0] || 'bạn'}
          </h1>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceDefault
