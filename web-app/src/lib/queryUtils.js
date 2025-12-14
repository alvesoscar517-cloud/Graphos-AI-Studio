/**
 * Query Utilities
 * Helper functions for TanStack Query
 */

import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'

/**
 * Prefetch user data
 */
export async function prefetchUserData() {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.current(),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.credits(),
      staleTime: 30 * 1000,
    }),
  ])
}

/**
 * Invalidate all user-related queries
 */
export function invalidateUserQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
}

/**
 * Invalidate all profile-related queries
 */
export function invalidateProfileQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all })
}

/**
 * Clear all cached data (on logout)
 */
export function clearAllQueries() {
  queryClient.clear()
}

/**
 * Reset specific query to initial state
 */
export function resetQuery(queryKey) {
  queryClient.resetQueries({ queryKey })
}

/**
 * Set query data directly
 */
export function setQueryData(queryKey, data) {
  queryClient.setQueryData(queryKey, data)
}

/**
 * Get cached query data
 */
export function getQueryData(queryKey) {
  return queryClient.getQueryData(queryKey)
}

/**
 * Optimistic update helper
 * @param {Array} queryKey - Query key to update
 * @param {Function} updater - Function to update the data
 * @returns {Function} Rollback function
 */
export function optimisticUpdate(queryKey, updater) {
  const previousData = queryClient.getQueryData(queryKey)
  queryClient.setQueryData(queryKey, updater)
  
  return () => {
    queryClient.setQueryData(queryKey, previousData)
  }
}

/**
 * Create mutation options with optimistic update
 */
export function createOptimisticMutation(queryKey, options = {}) {
  const { updateFn, rollbackOnError = true } = options
  
  return {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      
      if (updateFn) {
        queryClient.setQueryData(queryKey, (old) => updateFn(old, variables))
      }
      
      return { previousData }
    },
    onError: (err, variables, context) => {
      if (rollbackOnError && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  }
}

/**
 * Batch invalidate multiple queries
 */
export function batchInvalidate(queryKeys) {
  queryKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key })
  })
}

/**
 * Check if query is loading
 */
export function isQueryLoading(queryKey) {
  const state = queryClient.getQueryState(queryKey)
  return state?.status === 'pending'
}

/**
 * Check if query has data
 */
export function hasQueryData(queryKey) {
  return queryClient.getQueryData(queryKey) !== undefined
}

export default {
  prefetchUserData,
  invalidateUserQueries,
  invalidateProfileQueries,
  clearAllQueries,
  resetQuery,
  setQueryData,
  getQueryData,
  optimisticUpdate,
  createOptimisticMutation,
  batchInvalidate,
  isQueryLoading,
  hasQueryData,
}
