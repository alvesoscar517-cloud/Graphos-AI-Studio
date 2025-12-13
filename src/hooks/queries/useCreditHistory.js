/**
 * Credit History Query Hook
 * TanStack Query hook for fetching user credit transaction history
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'
import { useAuthStore } from '@/stores/authStore'

/**
 * Get userId from multiple sources
 */
function getUserId() {
  const storedId = localStorage.getItem('userId')
  if (storedId) return storedId
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.userId || user.uid || user.id || null
  } catch {
    return null
  }
}

/**
 * Fetch credit history with pagination and filters
 */
export function useCreditHistory(filters = {}, options = {}) {
  const { type = 'all', feature = 'all', startDate, endDate, limit = 20 } = filters
  
  // Get auth state
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userId = user?.userId || user?.uid || user?.id || getUserId()

  return useInfiniteQuery({
    queryKey: queryKeys.user.creditHistory({ type, feature, startDate, endDate, limit }),
    queryFn: async ({ pageParam = null }) => {
      const id = userId || getUserId()
      if (!id) {
        return { transactions: [], hasMore: false, nextCursor: null }
      }

      const params = new URLSearchParams({
        user_id: id,
        limit: limit.toString(),
      })

      if (type && type !== 'all') params.append('type', type)
      if (feature && feature !== 'all') params.append('feature', feature)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (pageParam) params.append('cursor', pageParam)

      try {
        const { data } = await apiClient.get(`/api/credits/history?${params.toString()}`)
        
        return {
          transactions: data.transactions || [],
          hasMore: data.hasMore || false,
          nextCursor: data.nextCursor || null,
        }
      } catch (error) {
        // Return empty result on error instead of throwing
        console.error('Failed to fetch credit history:', error)
        return { transactions: [], hasMore: false, nextCursor: null }
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 30 * 1000, // 30 seconds
    enabled: isAuthenticated && !!userId,
    retry: 1, // Only retry once
    ...options,
  })
}

/**
 * Fetch credit history summary/stats
 */
export function useCreditHistorySummary(days = 30, options = {}) {
  // Get auth state
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userId = user?.userId || user?.uid || user?.id || getUserId()

  return useQuery({
    queryKey: queryKeys.user.creditHistorySummary(days),
    queryFn: async () => {
      const id = userId || getUserId()
      if (!id) {
        return null
      }

      try {
        const { data } = await apiClient.get(`/api/credits/history/summary?user_id=${id}&days=${days}`, {
          retry: false // Don't retry on error
        })
        return data.success ? { summary: data.summary, period: data.period } : null
      } catch {
        // API might not be implemented yet, return null
        return null
      }
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: isAuthenticated && !!userId,
    retry: false, // Don't retry failed requests
    ...options,
  })
}

export default useCreditHistory
