import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProfiles } from '../../../contexts/ProfileContext'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ProfileSelector from '../../Analysis/ProfileSelector'
import RewriteModelSelector from '../../Analysis/RewriteModelSelector'
import './WorkspaceSidebar.css'

const WorkspaceSidebar = ({ hidden, onClose, onNewChat }) => {
  const { currentProfile, selectProfile } = useProfiles()
  const { modelSettings, updateModelSettings } = useWorkspace()

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const handleModelSelect = (modelId) => {
    updateModelSettings({ model: modelId })
  }

  // Sync initial model if not set
  useEffect(() => {
    if (!modelSettings.model) {
      updateModelSettings({ model: 'gemini-2.0-flash-exp' })
    }
  }, [])

  return (
    <motion.aside 
      className="workspace-sidebar right-sidebar"
      initial={false}
      animate={{
        x: hidden ? 300 : 0,
        opacity: hidden ? 0 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      style={{
        pointerEvents: hidden ? 'none' : 'auto'
      }}
    >
      <div className="right-header workspace-header-simple">
        <h3 className="workspace-header-title">Cài đặt AI</h3>
        <button 
          className="icon-btn close-sidebar-btn" 
          onClick={onClose}
          data-tooltip="Đóng sidebar" 
          data-tooltip-position="left"
        >
          <img src="/icon/x.svg" alt="Close" />
        </button>
      </div>

      <div className="settings-panel">
        <ProfileSelector 
          currentProfile={currentProfile}
          onProfileSelect={handleProfileSelect}
        />

        <RewriteModelSelector 
          selectedModel={modelSettings.model || 'gemini-2.0-flash-exp'}
          onModelSelect={handleModelSelect}
        />
      </div>
    </motion.aside>
  )
}

export default WorkspaceSidebar
