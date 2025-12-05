import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '@/services/adminApi'
import { queryKeys } from '@/lib/queryKeys'
import firestoreRealtimeService from '@/services/firestoreRealtimeService'

/**
 * Hook to fetch support tickets list with Firestore Realtime updates
 * @param {object} filters - Filter parameters (status, priority, page, etc.)
 */
export function useTickets(filters = {}) {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)

  // Subscribe to Firestore Realtime support updates
  useEffect(() => {
    unsubscribeRef.current = firestoreRealtimeService.subscribe('support', (data) => {
      if (data.type === 'support_update' && data.tickets) {
        // Update cache with realtime data
        queryClient.setQueryData(queryKeys.support.list(filters), (old) => ({
          ...old,
          tickets: data.tickets,
        }))
      }
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [queryClient, filters])

  return useQuery({
    queryKey: queryKeys.support.list(filters),
    queryFn: () => supportApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - Firestore handles instant updates
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
 * Hook to fetch support statistics with Firestore Realtime updates
 */
export function useSupportStatistics() {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)

  // Subscribe to Firestore Realtime support updates for statistics
  useEffect(() => {
    unsubscribeRef.current = firestoreRealtimeService.subscribe('support', (data) => {
      if (data.type === 'support_update' && data.statistics) {
        queryClient.setQueryData([...queryKeys.support.all, 'statistics'], (old) => ({
          ...old,
          statistics: data.statistics,
        }))
      }
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [queryClient])

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
