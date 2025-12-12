/**
 * RealtimeIndicator Component
 * Shows realtime connection status - matching admin panel design
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function RealtimeIndicator({ isConnected, lastUpdate, className }) {
  const { t } = useTranslation()

  const formatTime = (timestamp) => {
    if (!timestamp) return t('common.never', 'Never')
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-3.5 py-2 bg-fill-tertiary rounded-full text-xs text-text-muted",
      className
    )}>
      <div className="flex items-center gap-2">
        <span 
          className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-success" : "bg-warning"
          )}
          style={isConnected ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {}} 
        />
        <span className="font-semibold text-text-primary">
          {isConnected ? t('common.live', 'Live') : t('common.cached', 'Cached')}
        </span>
      </div>
      
      {lastUpdate && (
        <span className="text-text-muted pl-3 border-l border-border-light">
          {t('common.updated', 'Updated')}: {formatTime(lastUpdate)}
        </span>
      )}
    </div>
  )
}

export { RealtimeIndicator }
