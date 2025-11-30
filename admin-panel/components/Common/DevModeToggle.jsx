import { useState, useEffect } from 'react'
import { isDevMode, DEV_CONFIG, resetDevEnvironment, devLog } from '../../utils/devConfig'
// CSS migrated to Tailwind

/**
 * Dev Mode Toggle Component
 * Displays in bottom right corner when in dev mode
 */
const DevModeToggle = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState(DEV_CONFIG)

  // Only show in dev mode
  if (!import.meta.env.DEV) return null

  const handleToggleDevMode = () => {
    DEV_CONFIG.ENABLE_DEV_MODE = !DEV_CONFIG.ENABLE_DEV_MODE
    setConfig({ ...DEV_CONFIG })
    devLog('Dev mode:', DEV_CONFIG.ENABLE_DEV_MODE ? 'enabled' : 'disabled')
    
    // Reload to apply changes
    setTimeout(() => window.location.reload(), 500)
  }

  const handleToggleAutoSelect = () => {
    DEV_CONFIG.AUTO_SELECT_TEST_PROFILE = !DEV_CONFIG.AUTO_SELECT_TEST_PROFILE
    setConfig({ ...DEV_CONFIG })
    devLog('Auto-select test profile:', DEV_CONFIG.AUTO_SELECT_TEST_PROFILE)
  }

  const handleToggleVerbose = () => {
    DEV_CONFIG.VERBOSE_LOGGING = !DEV_CONFIG.VERBOSE_LOGGING
    setConfig({ ...DEV_CONFIG })
    devLog('Verbose logging:', DEV_CONFIG.VERBOSE_LOGGING)
  }

  const handleReset = () => {
    if (confirm('Reset dev environment? This will delete test profile and reload the page.')) {
      resetDevEnvironment()
      setTimeout(() => window.location.reload(), 500)
    }
  }

  return (
    <div className={`dev-mode-toggle ${isOpen ? 'open' : ''}`}>
      <button 
        className="dev-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Dev Mode Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        {isDevMode() && <span className="dev-indicator"></span>}
      </button>

      {isOpen && (
        <div className="dev-panel">
          <div className="dev-panel-header">
            <h3>🧪 Dev Mode</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="dev-panel-content">
            <div className="dev-setting">
              <label>
                <input
                  type="checkbox"
                  checked={config.ENABLE_DEV_MODE}
                  onChange={handleToggleDevMode}
                />
                <span>Enable Dev Mode</span>
              </label>
              <p className="dev-hint">Use test profile instead of creating new</p>
            </div>

            <div className="dev-setting">
              <label>
                <input
                  type="checkbox"
                  checked={config.AUTO_SELECT_TEST_PROFILE}
                  onChange={handleToggleAutoSelect}
                  disabled={!config.ENABLE_DEV_MODE}
                />
                <span>Auto-select Test Profile</span>
              </label>
              <p className="dev-hint">Automatically select test profile on startup</p>
            </div>

            <div className="dev-setting">
              <label>
                <input
                  type="checkbox"
                  checked={config.VERBOSE_LOGGING}
                  onChange={handleToggleVerbose}
                  disabled={!config.ENABLE_DEV_MODE}
                />
                <span>Verbose Logging</span>
              </label>
              <p className="dev-hint">Show detailed logs in console</p>
            </div>

            <div className="dev-info">
              <h4>Test Profile</h4>
              <div className="dev-info-item">
                <span>ID:</span>
                <code>{config.DEFAULT_TEST_PROFILE.profile_id}</code>
              </div>
              <div className="dev-info-item">
                <span>Name:</span>
                <code>{config.DEFAULT_TEST_PROFILE.profile_name}</code>
              </div>
              <div className="dev-info-item">
                <span>User:</span>
                <code>{config.DEFAULT_TEST_USER.email}</code>
              </div>
            </div>

            <div className="dev-actions">
              <button 
                className="dev-btn dev-btn-danger"
                onClick={handleReset}
              >
                Reset Environment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevModeToggle
