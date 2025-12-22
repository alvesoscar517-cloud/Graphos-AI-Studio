/**
 * Sync Status Indicator
 * Shows offline status and sync state using RxDB
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { forceSyncAll, getReplicationState } from '../../db/database'

const SyncStatusIndicator = () => {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(false)
      // RxDB auto-syncs when back online
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Subscribe to replication states
    const subscriptions = []
    const checkReplicationStates = () => {
      const collections = ['notes', 'conversations', 'messages', 'profiles']
      collections.forEach(name => {
        const state = getReplicationState(name)
        if (state) {
          subscriptions.push(
            state.active$.subscribe(active => {
              setIsSyncing(active)
            }),
            state.error$.subscribe(err => {
              if (err) {
                setHasError(true)
                setShowBanner(true)
              }
            })
          )
        }
      })
    }

    // Delay to allow RxDB to initialize
    const timeout = setTimeout(checkReplicationStates, 2000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(timeout)
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline || isSyncing) return
    
    setIsSyncing(true)
    setHasError(false)
    try {
      await forceSyncAll()
      setShowBanner(false)
    } catch (e) {
      console.error('Sync failed:', e)
      setHasError(true)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  // Don't show anything if online and no issues
  if (isOnline && !showBanner && !hasError) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-4 py-2.5 rounded-full",
        "shadow-lg border backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        !showBanner && "translate-y-20 opacity-0 pointer-events-none",
        isOnline 
          ? hasError
            ? "bg-red-50/95 dark:bg-red-900/90 border-red-200 dark:border-red-700"
            : "bg-green-50/95 dark:bg-green-900/90 border-green-200 dark:border-green-700"
          : "bg-amber-50/95 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700"
      )}
    >
      {/* Status Icon */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isOnline 
          ? hasError
            ? "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300"
            : "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300"
          : "bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300"
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
        ) : isSyncing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : hasError ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-medium",
          isOnline 
            ? hasError
              ? "text-red-800 dark:text-red-200"
              : "text-green-800 dark:text-green-200"
            : "text-amber-800 dark:text-amber-200"
        )}>
          {!isOnline 
            ? t('sync.offline', 'You\'re offline')
            : hasError
              ? t('sync.error', 'Sync error')
              : isSyncing
                ? t('sync.syncing', 'Syncing...')
                : t('sync.synced', 'All synced')
          }
        </span>
        {!isOnline && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {t('sync.offlineDesc', 'Changes will sync when you\'re back online')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-2">
        {isOnline && hasError && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full",
              "bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-100",
              "hover:bg-red-300 dark:hover:bg-red-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          >
            {isSyncing ? t('sync.syncing', 'Syncing...') : t('sync.retry', 'Retry')}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className={cn(
            "p-1 rounded-full",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "transition-colors"
          )}
          aria-label={t('common.dismiss', 'Dismiss')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SyncStatusIndicator
