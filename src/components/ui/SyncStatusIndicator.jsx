/**
 * Sync Status Indicator
 * Shows offline status - Firestore handles sync automatically
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

const SyncStatusIndicator = () => {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Show briefly then hide
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 2000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleDismiss = () => {
    setShowBanner(false)
  }

  // Don't show anything if online and no banner
  if (isOnline && !showBanner) {
    return null
  }

  return (
    <div
      className={cn("fixed bottom-4 left-1/2 -translate-x-1/2 z-50","flex items-center gap-3 px-4 py-2.5 rounded-full","shadow-lg border backdrop-blur-sm","transition-all duration-300 ease-out",
        !showBanner &&"translate-y-20 opacity-0 pointer-events-none",
        isOnline 
          ?"bg-green-50/95 dark:bg-green-900/90 border-green-200 dark:border-green-700"
          :"bg-amber-50/95 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700"
      )}
    >
      {/* Status Icon */}
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isOnline 
          ?"bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300"
          :"bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300"
      )}>
        {!isOnline ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col">
        <span className={cn("text-sm font-medium",
          isOnline 
            ?"text-green-800 dark:text-green-200"
            :"text-amber-800 dark:text-amber-200"
        )}>
          {!isOnline 
            ? t('sync.offline', 'You\'re offline')
            : t('sync.online', 'Back online')
          }
        </span>
        {!isOnline && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {t('sync.offlineDesc', 'Changes will sync when you\'re back online')}
          </span>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={cn("p-1 rounded-full ml-2","hover:bg-black/10 dark:hover:bg-white/10","transition-colors"
        )}
        aria-label={t('common.dismiss', 'Dismiss')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

export default SyncStatusIndicator
