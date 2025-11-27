import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isDevMode, DEV_CONFIG, resetDevEnvironment, devLog } from '../../utils/devConfig'
import './DevModeToggle.css'

/**
 * Dev Mode Toggle Component
 * Display at bottom right corner in dev mode
 */
const DevModeToggle = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState(DEV_CONFIG)

  // Only display in dev mode
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
    if (confirm(t('devMode.resetConfirm'))) {
      resetDevEnvironment()
      setTimeout(() => window.location.reload(), 500)
    }
  }

  return (
    <div className={`dev-mode-toggle ${isOpen ? 'open' : ''}`}>
      <button 
        className="dev-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={t('devMode.devModeSettings')}
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
            <h3>🧪 {t('devMode.devMode')}</h3>
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
                <span>{t('devMode.enableDevMode')}</span>
              </label>
              <p className="dev-hint">{t('devMode.useTestProfile')}</p>
            </div>

            <div className="dev-setting">
              <label>
                <input
                  type="checkbox"
                  checked={config.AUTO_SELECT_TEST_PROFILE}
                  onChange={handleToggleAutoSelect}
                  disabled={!config.ENABLE_DEV_MODE}
                />
                <span>{t('devMode.autoSelectTestProfile')}</span>
              </label>
              <p className="dev-hint">{t('devMode.autoSelectOnStartup')}</p>
            </div>

            <div className="dev-setting">
              <label>
                <input
                  type="checkbox"
                  checked={config.VERBOSE_LOGGING}
                  onChange={handleToggleVerbose}
                  disabled={!config.ENABLE_DEV_MODE}
                />
                <span>{t('devMode.verboseLogging')}</span>
              </label>
              <p className="dev-hint">{t('devMode.showDetailedLogs')}</p>
            </div>

            <div className="dev-info">
              <h4>{t('devMode.testProfile')}</h4>
              <div className="dev-info-item">
                <span>{t('devMode.id')}:</span>
                <code>{config.DEFAULT_TEST_PROFILE.profile_id}</code>
              </div>
              <div className="dev-info-item">
                <span>{t('devMode.name')}:</span>
                <code>{config.DEFAULT_TEST_PROFILE.profile_name}</code>
              </div>
              <div className="dev-info-item">
                <span>{t('devMode.user')}:</span>
                <code>{config.DEFAULT_TEST_USER.email}</code>
              </div>
            </div>

            <div className="dev-actions">
              <button 
                className="dev-btn dev-btn-danger"
                onClick={handleReset}
              >
                {t('devMode.resetEnvironment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevModeToggle
