/**
 * Credit History Query Hook
 * TanStack Query hook for fetching user credit transaction history
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'

/**
 * Fetch credit history with pagination and filters
 */
export function useCreditHistory(filters = {}, options = {}) {
  const { type = 'all', feature = 'all', startDate, endDate, limit = 20 } = filters

  return useInfiniteQuery({
    queryKey: queryKeys.user.creditHistory(filters),
    queryFn: async ({ pageParam = null }) => {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        return { transactions: [], hasMore: false, nextCursor: null }
      }

      const params = new URLSearchParams({
        user_id: userId,
        limit: limit.toString(),
      })

      if (type && type !== 'all') params.append('type', type)
      if (feature && feature !== 'all') params.append('feature', feature)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (pageParam) params.append('cursor', pageParam)

      const { data } = await apiClient.get(`/api/credits/history?${params.toString()}`)
      
      return {
        transactions: data.transactions || [],
        hasMore: data.hasMore || false,
        nextCursor: data.nextCursor || null,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  })
}

/**
 * Fetch credit history summary/stats
 */
export function useCreditHistorySummary(days = 30, options = {}) {
  return useQuery({
    queryKey: queryKeys.user.creditHistorySummary(days),
    queryFn: async () => {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        return null
      }

      const { data } = await apiClient.get(`/api/credits/history/summary?user_id=${userId}&days=${days}`)
      
      return data.success ? { summary: data.summary, period: data.period } : null
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  })
}

export default useCreditHistory
