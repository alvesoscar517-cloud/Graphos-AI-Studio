/**
 * Share Query Hook
 * TanStack Query hook for sharing content
 */

import { useMutation } from '@tanstack/react-query'
import apiClient from '@/services/api/client'

/**
 * Create share link
 */
export function useCreateShare() {
  return useMutation({
    mutationFn: async (shareData) => {
      const { data } = await apiClient.post('/api/share', shareData)
      return data
    },
  })
}

export default useCreateShare
