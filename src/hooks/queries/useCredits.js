/**
 * Credits Query Hook
 * TanStack Query hook for user credits management with real-time updates
 */

import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'

/**
 * Fetch user credits with real-time updates via SSE
 */
export function useCredits(options = {}) {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)

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
    staleTime: 2 * 60 * 1000, // 2 minutes - realtime handles updates
    // Disable polling when realtime is connected - only fetch on demand
    refetchInterval: false, // Realtime SSE handles updates, no need for polling
    refetchOnWindowFocus: false, // Avoid unnecessary refetch, realtime handles this
    refetchOnReconnect: true, // Refetch when network reconnects
    ...options,
  })

  // Subscribe to real-time credit updates
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

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
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
