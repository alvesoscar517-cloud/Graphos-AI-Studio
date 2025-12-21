/**
 * TanStack Query Client Configuration
 * Centralized query client with optimized defaults
 */

import { QueryClient } from '@tanstack/react-query'
import { logger } from '../utils/logger'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (good for stale data)
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Show error in console for debugging
      onError: (error) => {
        console.error('[Mutation Error]', error)
      },
    },
  },
})

// Listen for sign out event to clear all cached data
// This ensures data isolation between users
if (typeof window !== 'undefined') {
  window.addEventListener('auth-signout', () => {
    logger.log('[SECURITY] Clearing React Query cache on sign out')
    queryClient.clear()
  })
}

export default queryClient
