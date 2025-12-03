/**
 * useOptimisticMutation Hook
 * TanStack Query mutation with built-in optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

/**
 * Hook for mutations with optimistic updates
 * @param {object} options
 * @param {Function} options.mutationFn - Mutation function
 * @param {Array} options.queryKey - Query key to update optimistically
 * @param {Function} options.updateFn - Function to update cached data (old, variables) => new
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.invalidateOnSuccess - Whether to invalidate query on success
 */
export function useOptimisticMutation({
  mutationFn,
  queryKey,
  updateFn,
  onSuccess,
  onError,
  invalidateOnSuccess = true,
  ...options
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)
      
      // Optimistically update
      if (updateFn) {
        queryClient.setQueryData(queryKey, (old) => updateFn(old, variables))
      }
      
      return { previousData }
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error, variables, context)
    },
    
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context)
    },
    
    onSettled: () => {
      // Invalidate to refetch
      if (invalidateOnSuccess) {
        queryClient.invalidateQueries({ queryKey })
      }
    },
    
    ...options,
  })
}

/**
 * Hook for list mutations (add, update, delete)
 */
export function useListMutation({
  queryKey,
  addFn,
  updateFn,
  deleteFn,
  idField = 'id',
}) {
  const queryClient = useQueryClient()

  const addMutation = useOptimisticMutation({
    mutationFn: addFn,
    queryKey,
    updateFn: (old = [], newItem) => [newItem, ...old],
  })

  const updateMutation = useOptimisticMutation({
    mutationFn: updateFn,
    queryKey,
    updateFn: (old = [], { id, data }) =>
      old.map((item) => (item[idField] === id ? { ...item, ...data } : item)),
  })

  const deleteMutation = useOptimisticMutation({
    mutationFn: deleteFn,
    queryKey,
    updateFn: (old = [], id) => old.filter((item) => item[idField] !== id),
  })

  return {
    add: addMutation,
    update: updateMutation,
    delete: deleteMutation,
    isLoading:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  }
}

export default useOptimisticMutation
