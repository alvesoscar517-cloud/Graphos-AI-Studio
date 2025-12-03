/**
 * CreditBalance Component
 * Uses TanStack Query with real-time updates via useCredits hook
 */
import { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useCredits } from '@/hooks/queries'
import { queryKeys } from '@/lib/queryKeys'
import realtimeService from '@/services/realtimeService'
import { useIsAuthenticated } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const CreditBalance = ({ userId, onUpgradeClick }) => {
  const { t } = useTranslation()
  const isAuthenticated = useIsAuthenticated()
  const queryClient = useQueryClient()

  // Use centralized credits hook with real-time updates
  const { data: credits, isLoading } = useCredits({
    enabled: !!userId && isAuthenticated,
  })

  // Update credits in cache
  const updateCreditsCache = useCallback((newCredits) => {
    queryClient.setQueryData(queryKeys.user.credits(), newCredits)
  }, [queryClient])

  // Listen for payment success events (SSE connection handled centrally)
  useEffect(() => {
    if (!userId || !isAuthenticated) return

    // Listen for payment success
    const handlePaymentSuccess = (e) => {
      if (e.detail?.credits) {
        updateCreditsCache(e.detail.credits)
      }
    }
    window.addEventListener('payment-success', handlePaymentSuccess)

    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess)
    }
  }, [userId, isAuthenticated, updateCreditsCache])

  const balance = credits?.balance != null ? credits.balance.toFixed(2) : '0'
  const used = credits?.used != null ? credits.used.toFixed(2) : '0'
  const isLowCredit = parseFloat(balance) < 10
  const isOutOfCredit = parseFloat(balance) <= 0

  return (
    <div className="px-5 pb-3.5 text-center">
      <div className="mb-3 py-1.5 px-3.5 inline-block">
        {isLoading ? (
          <span className="text-sm text-text-secondary animate-pulse">Loading...</span>
        ) : (
          <span className={cn(
            "text-sm tracking-wide text-text-secondary",
            isLowCredit && !isOutOfCredit && "text-warning font-medium",
            isOutOfCredit && "text-error font-semibold"
          )}>
            {balance} {t('credits.credits')} / {used} {t('credits.used')}
          </span>
        )}
      </div>
      <button 
        className={cn(
          "w-full py-2.5 px-4 rounded-3xl text-xs font-medium cursor-pointer",
          "transition-colors duration-200",
          "bg-fill-tertiary border-none text-text-primary",
          "hover:bg-fill-secondary"
        )}
        onClick={onUpgradeClick}
      >
        {t('credits.upgradePlan')}
      </button>
    </div>
  )
}

export default CreditBalance
