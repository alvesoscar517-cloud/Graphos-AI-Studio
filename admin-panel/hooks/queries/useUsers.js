import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/services/adminApi'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Hook to fetch users list with filters
 * @param {object} filters - Filter parameters (page, limit, search, status, etc.)
 */
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.getAllAdvanced(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch single user details
 * @param {string} userId - User ID
 */
export function useUser(userId) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch user logs
 * @param {string} userId - User ID
 * @param {object} params - Query parameters
 */
export function useUserLogs(userId, params = {}) {
  return useQuery({
    queryKey: queryKeys.users.logs(userId),
    queryFn: () => usersApi.getLogs(userId, params),
    enabled: !!userId,
  })
}

/**
 * Hook to update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }) => usersApi.update(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate user detail and list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
  })
}

/**
 * Hook to toggle user lock status
 */
export function useToggleUserLock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, locked, reason }) => usersApi.toggleLock(userId, locked, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
  })
}

/**
 * Hook to adjust user credits
 */
export function useAdjustUserCredits() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, amount, type, reason }) => 
      usersApi.adjustCredits(userId, amount, type, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) })
    },
  })
}

/**
 * Hook to delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export default useUsers
