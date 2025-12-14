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
import { Skeleton } from '@/components/ui/skeleton'
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
  const isLowCredit = parseFloat(balance) < 10
  const isOutOfCredit = parseFloat(balance) <= 0

  return (
    <div className="px-5 pb-3.5 text-center">
      <div className="mb-3 py-1.5 px-3.5 inline-flex items-center justify-center gap-1.5">
        {isLoading ? (
          <Skeleton className="h-4 w-20 rounded mx-auto" />
        ) : (
          <span className={cn(
            "inline-flex items-center gap-1.5 text-sm tracking-wide text-text-secondary",
            isLowCredit && !isOutOfCredit && "text-warning font-medium",
            isOutOfCredit && "text-error font-semibold"
          )}>
            <img src="/icon/coins.svg" alt="" className="w-3.5 h-3.5 icon-invert opacity-70" />
            {balance} {t('credits.credits')}
          </span>
        )}
      </div>
      <button 
        className={cn(
          "w-full py-2.5 px-4 rounded-3xl text-xs font-medium cursor-pointer",
          "transition-colors duration-200",
          "bg-bg-primary border border-border-light text-text-primary",
          "hover:bg-bg-hover hover:border-border-hover"
        )}
        onClick={onUpgradeClick}
      >
        {t('credits.upgradePlan')}
      </button>
    </div>
  )
}

export default CreditBalance
