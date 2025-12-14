/**
 * LowCreditsToast Component
 * Windows-style notification popup that appears at bottom-right
 * when user credits fall below threshold (10 credits)
 * 
 * Features:
 * - Auto-shows when credits < 10
 * - Dismissible with "Don't show again today" option
 * - Smooth slide-in animation
 * - Buy credits button
 * - System colors only (white, black, gray based on theme)
 */
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useCredits } from '@/hooks/queries'
import { useIsAuthenticated } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const LOW_CREDITS_THRESHOLD = 10
const DISMISS_STORAGE_KEY = 'lowCreditsToast_dismissedAt'
const DISMISS_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const LowCreditsToast = ({ onBuyCredits }) => {
  const { t } = useTranslation()
  const isAuthenticated = useIsAuthenticated()
  const { data: credits, isLoading } = useCredits({ enabled: isAuthenticated })
  
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [isDismissedInSession, setIsDismissedInSession] = useState(false)

  // Check if toast was dismissed recently (24h via localStorage)
  const isDismissedRecently = useCallback(() => {
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY)
    if (!dismissedAt) return false
    
    const dismissedTime = parseInt(dismissedAt, 10)
    return Date.now() - dismissedTime < DISMISS_DURATION
  }, [])

  // Show toast when credits are low
  useEffect(() => {
    if (isLoading || !isAuthenticated || isDismissedInSession) return
    
    const balance = credits?.balance ?? 0
    const shouldShow = balance < LOW_CREDITS_THRESHOLD && balance > 0 && !isDismissedRecently()
    
    if (shouldShow && !isVisible) {
      // Delay showing to avoid flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    } else if (!shouldShow && isVisible) {
      setIsVisible(false)
    }
  }, [credits?.balance, isLoading, isAuthenticated, isDismissedRecently, isVisible, isDismissedInSession])

  // Dismiss toast
  // - saveToStorage: true = don't show for 24h (Later button)
  // - saveToStorage: false = don't show in this session only (X button, Buy button)
  const handleDismiss = useCallback((saveToStorage = false) => {
    setIsAnimatingOut(true)
    setIsDismissedInSession(true)
    
    if (saveToStorage) {
      localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString())
    }
    
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
    }, 300)
  }, [])

  const handleBuyCredits = useCallback(() => {
    handleDismiss(false) // Dismiss in session only
    onBuyCredits?.()
  }, [handleDismiss, onBuyCredits])

  if (!isVisible || isLoading) return null

  const balance = credits?.balance?.toFixed(2) ?? '0'

  return createPortal(
    <div
      className={cn(
        "fixed bottom-5 right-5 z-toast",
        "w-[340px] max-w-[calc(100vw-40px)]",
        "bg-bg-primary border border-border rounded-xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
        "overflow-hidden",
        "transition-all duration-300 ease-out",
        isAnimatingOut 
          ? "opacity-0 translate-x-full" 
          : "opacity-100 translate-x-0 animate-slide-in-right"
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header with icon */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-fill-secondary flex items-center justify-center shrink-0">
          <img 
            src="/icon/coins.svg" 
            alt="" 
            className="w-5 h-5 icon-invert opacity-70"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary m-0 mb-1">
            {t('lowCredits.title')}
          </h4>
          <p className="text-xs text-text-secondary m-0 leading-relaxed">
            {t('lowCredits.message', { credits: balance })}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => handleDismiss(false)}
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
            "bg-transparent border-none cursor-pointer",
            "opacity-50 hover:opacity-100 hover:bg-fill-tertiary",
            "transition-all duration-150"
          )}
          aria-label={t('common.close')}
        >
          <img src="/icon/x.svg" alt="" className="w-3.5 h-3.5 icon-invert" />
        </button>
      </div>

      {/* Credits display */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 py-2 px-3 bg-fill-tertiary rounded-lg border border-border-light">
          <img src="/icon/coins.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
          <span className="text-sm font-semibold text-text-primary">
            {balance} {t('credits.credits')}
          </span>
          <span className="text-xs text-text-muted">
            {t('lowCredits.remaining')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <button
          onClick={handleBuyCredits}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg",
            "bg-text-primary text-bg-primary border-none",
            "text-sm font-medium cursor-pointer",
            "flex items-center justify-center gap-2",
            "hover:opacity-80 transition-opacity"
          )}
        >
          <img 
            src="/icon/shopping-cart.svg" 
            alt="" 
            className="w-4 h-4 icon-invert-reverse" 
          />
          {t('lowCredits.buyNow')}
        </button>
        
        <button
          onClick={() => handleDismiss(true)}
          className={cn(
            "py-2.5 px-3 rounded-lg",
            "bg-fill-tertiary text-text-secondary border border-border-light",
            "text-xs cursor-pointer",
            "hover:bg-fill-secondary transition-colors"
          )}
        >
          {t('lowCredits.remindLater')}
        </button>
      </div>

    </div>,
    document.body
  )
}

export default LowCreditsToast
