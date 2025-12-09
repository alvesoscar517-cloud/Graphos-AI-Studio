import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isDevMode, DEV_CONFIG, resetDevEnvironment, devLog } from '../../utils/devConfig'
import { cn } from '../../lib/utils'

const DevModeToggle = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState(DEV_CONFIG)

  if (!import.meta.env.DEV) return null

  const handleToggleDevMode = () => {
    DEV_CONFIG.ENABLE_DEV_MODE = !DEV_CONFIG.ENABLE_DEV_MODE
    setConfig({ ...DEV_CONFIG })
    devLog('Dev mode:', DEV_CONFIG.ENABLE_DEV_MODE ? 'enabled' : 'disabled')
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
    <div className="fixed bottom-5 right-5 z-modal-backdrop">
      <button 
        className={cn(
          "w-12 h-12 rounded-full border-none text-white cursor-pointer",
          "flex items-center justify-center relative",
          "bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end",
          "shadow-glow-purple",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-glow-purple-lg"
        )}
        onClick={() => setIsOpen(!isOpen)}
        data-tooltip={t('devMode.devModeSettings')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        {isDevMode() && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute bottom-[60px] right-0 w-80",
          "bg-bg-primary rounded-xl overflow-hidden",
          "shadow-float",
          "animate-slide-up"
        )}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gradient-purple-start to-gradient-purple-end text-white">
            <h3 className="m-0 text-base font-semibold">🧪 {t('devMode.devMode')}</h3>
            <button 
              className="bg-transparent border-none text-white text-2xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto">
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={config.ENABLE_DEV_MODE}
                  onChange={handleToggleDevMode}
                />
                <span>{t('devMode.enableDevMode')}</span>
              </label>
              <p className="mt-1 ml-6 text-xs text-text-muted">{t('devMode.useTestProfile')}</p>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={config.AUTO_SELECT_TEST_PROFILE}
                  onChange={handleToggleAutoSelect}
                  disabled={!config.ENABLE_DEV_MODE}
                />
                <span>{t('devMode.autoSelectTestProfile')}</span>
              </label>
              <p className="mt-1 ml-6 text-xs text-text-muted">{t('devMode.autoSelectOnStartup')}</p>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={config.VERBOSE_LOGGING}
                  onChange={handleToggleVerbose}
                  disabled={!config.ENABLE_DEV_MODE}
                />
                <span>{t('devMode.verboseLogging')}</span>
              </label>
              <p className="mt-1 ml-6 text-xs text-text-muted">{t('devMode.showDetailedLogs')}</p>
            </div>

            <div className="mt-5 p-3 bg-bg-secondary rounded-lg">
              <h4 className="m-0 mb-2 text-sm font-semibold text-text-secondary">
                {t('devMode.testProfile')}
              </h4>
              <div className="flex items-center gap-2 mb-1.5 text-xs">
                <span className="text-text-muted min-w-label-sm">{t('devMode.id')}:</span>
                <code className="flex-1 py-1 px-2 bg-bg-primary border border-border rounded text-2xs font-mono text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                  {config.DEFAULT_TEST_PROFILE.profile_id}
                </code>
              </div>
              <div className="flex items-center gap-2 mb-1.5 text-xs">
                <span className="text-text-muted min-w-label-sm">{t('devMode.name')}:</span>
                <code className="flex-1 py-1 px-2 bg-bg-primary border border-border rounded text-2xs font-mono text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                  {config.DEFAULT_TEST_PROFILE.profile_name}
                </code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted min-w-label-sm">{t('devMode.user')}:</span>
                <code className="flex-1 py-1 px-2 bg-bg-primary border border-border rounded text-2xs font-mono text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                  {config.DEFAULT_TEST_USER.email}
                </code>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <button 
                className={cn(
                  "w-full py-2.5 border-none rounded-md text-sm font-medium cursor-pointer",
                  "bg-red-100 text-red-600 transition-colors duration-200",
                  "hover:bg-red-200"
                )}
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
