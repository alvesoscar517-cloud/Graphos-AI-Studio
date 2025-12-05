/**
 * Credits Query Hook
 * TanStack Query hook for user credits management with Firestore Realtime updates
 */

import { useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'

// Minimum time between visibility refetches (30 seconds)
const VISIBILITY_REFETCH_COOLDOWN = 30 * 1000

/**
 * Fetch user credits with Firestore Realtime updates (instant)
 */
export function useCredits(options = {}) {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)
  const lastVisibilityRefetchRef = useRef(0)

  const query = useQuery({
    queryKey: queryKeys.user.credits(),
    queryFn: async () => {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId')
      if (!userId) {
        return { balance: 0, used: 0 }
      }
      const { data } = await apiClient.get(`/api/credits/balance?user_id=${userId}`)
      if (data.success) {
        return data.credits
      }
      return data?.credits || data
    },
    staleTime: 60 * 1000, // 1 minute - Firestore Realtime handles instant updates
    refetchInterval: false, // Firestore Realtime handles updates, no polling needed
    refetchOnWindowFocus: false, // We handle this manually below
    refetchOnReconnect: true, // Refetch when network reconnects
    ...options,
  })

  // Refetch credits - used for visibility change and payment success
  const refetchCredits = useCallback(() => {
    const now = Date.now()
    if (now - lastVisibilityRefetchRef.current > VISIBILITY_REFETCH_COOLDOWN) {
      lastVisibilityRefetchRef.current = now
      console.log('[Credits] Refetching credits...')
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
    }
  }, [queryClient])

  // Subscribe to Firestore Realtime credit updates + visibility change handler
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        // Dynamic import to avoid circular dependency
        const { default: realtimeService } = await import('@/services/realtimeService')
        
        unsubscribeRef.current = realtimeService.subscribe('credits', (data) => {
          console.log('[REALTIME] Credit update received:', data)
          const creditsData = data.credits || data
          queryClient.setQueryData(queryKeys.user.credits(), creditsData)
        })
      } catch (err) {
        console.warn('Could not setup realtime credit updates:', err.message)
      }
    }

    setupRealtime()

    // Handle visibility change - refetch when tab becomes visible
    // Firestore Realtime should handle most updates, this is a fallback
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { default: realtimeService } = await import('@/services/realtimeService')
          // Only refetch if not connected (Firestore handles updates when connected)
          const isStale = query.dataUpdatedAt && (Date.now() - query.dataUpdatedAt > 60000)
          
          if (!realtimeService.isConnected() || isStale) {
            console.log('[Credits] Tab visible, connected:', realtimeService.isConnected(), 'isStale:', isStale)
            refetchCredits()
          }
        } catch (err) {
          refetchCredits()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen for payment success event to immediately refetch
    const handlePaymentSuccess = () => {
      console.log('[Credits] Payment success detected, refetching...')
      lastVisibilityRefetchRef.current = 0 // Reset cooldown
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
    }
    
    window.addEventListener('payment-success', handlePaymentSuccess)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('payment-success', handlePaymentSuccess)
    }
  }, [queryClient, refetchCredits, query.dataUpdatedAt])

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
      // Update cache with new balance
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
