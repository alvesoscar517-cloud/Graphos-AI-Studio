/**
 * Credits Query Hook - SIMPLIFIED
 * TanStack Query hook for user credits management
 * 
 * Strategy:
 * - Fetch from API on mount
 * - Refetch on window focus (with cooldown)
 * - Refetch on payment success event
 * - Realtime updates via Firestore (optional enhancement)
 */

import { logger } from '@/utils/logger'
import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'
import { useAuthStore } from '@/stores/authStore'

/**
 * Get userId from multiple sources
 */
function getUserId() {
  // Try localStorage first
  const storedId = localStorage.getItem('userId')
  if (storedId) return storedId
  
  // Try user object in localStorage
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.userId || user.uid || user.id || null
  } catch {
    return null
  }
}

/**
 * Fetch user credits
 */
export function useCredits(options = {}) {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)
  const hasSetupRealtimeRef = useRef(false)
  
  // Get auth state
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  // Get userId from auth store or localStorage
  const userId = user?.userId || user?.uid || user?.id || getUserId()

  const query = useQuery({
    queryKey: queryKeys.user.credits(),
    queryFn: async () => {
      const id = userId || getUserId()
      if (!id) {
        return { balance: 0, used: 0 }
      }
      const { data } = await apiClient.get(`/api/credits/balance?user_id=${id}`)
      return data?.credits || { balance: 0, used: 0 }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: isAuthenticated && !!userId,
    ...options,
  })

  // Setup realtime subscription (once)
  useEffect(() => {
    if (hasSetupRealtimeRef.current) return
    
    const setupRealtime = async () => {
      try {
        const { default: realtimeService } = await import('@/services/realtimeService')
        
        unsubscribeRef.current = realtimeService.subscribe('credits', (data) => {
          if (data?.credits) {
            logger.log('[Credits] Realtime update:', data.credits.balance)
            queryClient.setQueryData(queryKeys.user.credits(), data.credits)
          }
        })
        
        hasSetupRealtimeRef.current = true
      } catch (err) {
        // Realtime not available, API fetch is fallback
      }
    }

    setupRealtime()

    // Listen for payment success to refetch
    const handlePaymentSuccess = () => {
      logger.log('[Credits] Payment success, refetching...')
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
    }
    window.addEventListener('payment-success', handlePaymentSuccess)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      hasSetupRealtimeRef.current = false
      window.removeEventListener('payment-success', handlePaymentSuccess)
    }
  }, [queryClient])

  return {
    ...query,
    balance: query.data?.balance || 0,
    used: query.data?.used || 0,
    remaining: query.data?.remaining || query.data?.balance || 0,
  }
}

/**
 * Use credits mutation
 */
export function useConsumeCredits() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amount, action }) => {
      const { data } = await apiClient.post('/api/credits/consume', { amount, action })
      return data
    },
    onSuccess: (data) => {
      if (data?.credits) {
        queryClient.setQueryData(queryKeys.user.credits(), data.credits)
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
      }
    },
  })
}

/**
 * Check if user has enough credits
 */
export function useHasCredits(requiredAmount = 1) {
  const { balance, remaining, isLoading } = useCredits()

  return {
    hasCredits: (remaining || balance) >= requiredAmount,
    balance,
    remaining,
    isLoading,
  }
}

export default useCredits
