/**
 * Analysis Query Hook
 * TanStack Query hook for AI analysis history
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'

/**
 * Fetch analysis history
 */
export function useAnalysisHistory(filters = {}) {
  return useQuery({
    queryKey: queryKeys.analysis.history(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString()
      const { data } = await apiClient.get(`/api/analysis/history?${params}`)
      return data.history || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch single analysis detail
 */
export function useAnalysisDetail(analysisId) {
  return useQuery({
    queryKey: queryKeys.analysis.detail(analysisId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/analysis/${analysisId}`)
      return data
    },
    enabled: !!analysisId,
    staleTime: 10 * 60 * 1000, // 10 minutes - analysis results don't change
  })
}

/**
 * Delete analysis from history
 */
export function useDeleteAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (analysisId) => {
      const { data } = await apiClient.delete(`/api/analysis/${analysisId}`)
      return data
    },
    onMutate: async (analysisId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.analysis.all })
      
      // Snapshot previous value
      const previousHistory = queryClient.getQueryData(queryKeys.analysis.history({}))
      
      // Optimistically remove
      queryClient.setQueryData(queryKeys.analysis.history({}), (old = []) => {
        return old.filter(a => a.id !== analysisId)
      })
      
      return { previousHistory }
    },
    onError: (err, analysisId, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.analysis.history({}), context.previousHistory)
    },
  })
}

/**
 * Get analysis stats
 */
export function useAnalysisStats() {
  return useQuery({
    queryKey: queryKeys.analysis.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/analysis/stats')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export default useAnalysisHistory
