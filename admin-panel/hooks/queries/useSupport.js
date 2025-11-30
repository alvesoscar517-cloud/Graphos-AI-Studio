import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '@/services/adminApi'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Hook to fetch support tickets list
 * @param {object} filters - Filter parameters (status, priority, page, etc.)
 */
export function useTickets(filters = {}) {
  return useQuery({
    queryKey: queryKeys.support.list(filters),
    queryFn: () => supportApi.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook to fetch single ticket details
 * @param {string} ticketId - Ticket ID
 */
export function useTicket(ticketId) {
  return useQuery({
    queryKey: queryKeys.support.detail(ticketId),
    queryFn: () => supportApi.getById(ticketId),
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Hook to fetch support statistics
 */
export function useSupportStatistics() {
  return useQuery({
    queryKey: [...queryKeys.support.all, 'statistics'],
    queryFn: () => supportApi.getStatistics(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to reply to a ticket
 */
export function useReplyTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, data }) => supportApi.reply(ticketId, data),
    onSuccess: (_, variables) => {
      // Invalidate ticket detail and list
      queryClient.invalidateQueries({ queryKey: queryKeys.support.detail(variables.ticketId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.support.lists() })
    },
  })
}

/**
 * Hook to update ticket status
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, status }) => supportApi.updateStatus(ticketId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.detail(variables.ticketId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.support.lists() })
    },
  })
}

/**
 * Hook to delete a ticket
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId) => supportApi.delete(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all })
    },
  })
}

export default useTickets
