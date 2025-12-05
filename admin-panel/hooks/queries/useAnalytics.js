import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { analyticsApi, advancedAnalyticsApi } from '@/services/adminApi'
import { queryKeys } from '@/lib/queryKeys'
import firestoreRealtimeService from '@/services/firestoreRealtimeService'

/**
 * Hook to fetch dashboard overview analytics with Firestore Realtime updates
 */
export function useDashboardAnalytics() {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)

  // Subscribe to Firestore Realtime stats updates
  useEffect(() => {
    unsubscribeRef.current = firestoreRealtimeService.subscribe('stats', (data) => {
      if (data.type === 'stats_update' && data.stats) {
        // Update cache with realtime stats
        queryClient.setQueryData(queryKeys.analytics.dashboard('overview'), (old) => ({
          ...old,
          overview: {
            ...old?.overview,
            totalUsers: data.stats.totalUsers,
            totalProfiles: data.stats.totalProfiles,
            newUsers: data.stats.newUsers,
          },
        }))
      }
    })

    // Also listen for new orders to update revenue stats
    const unsubOrders = firestoreRealtimeService.subscribe('orders', (data) => {
      if (data.type === 'order_created') {
        // Invalidate analytics to refetch with new order data
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
      }
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      unsubOrders()
    }
  }, [queryClient])

  return useQuery({
    queryKey: queryKeys.analytics.dashboard('overview'),
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes - Firestore handles instant updates
  })
}

/**
 * Hook to fetch user analytics
 * @param {number} days - Number of days to fetch data for
 */
export function useUserAnalytics(days = 30) {
  return useQuery({
    queryKey: queryKeys.analytics.users(days),
    queryFn: () => advancedAnalyticsApi.getUserAnalytics(days),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch usage analytics
 */
export function useUsageAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.all,
    queryFn: () => advancedAnalyticsApi.getUsageAnalytics(),
    staleTime: 5 * 60 * 1000,
  })
}

export default useDashboardAnalytics
