import { useQuery } from '@tanstack/react-query'
import { analyticsApi, advancedAnalyticsApi } from '@/services/adminApi'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Hook to fetch dashboard overview analytics
 */
export function useDashboardAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard('overview'),
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
