/**
 * Workspace Query Hook
 * TanStack Query hook for workspace/conversations management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Get conversations from localStorage (client-side only)
 */
function getConversationsFromStorage(userKey) {
  try {
    const saved = localStorage.getItem(`workspace_conversations_${userKey}`)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

/**
 * Save conversations to localStorage
 */
function saveConversationsToStorage(userKey, conversations) {
  try {
    localStorage.setItem(`workspace_conversations_${userKey}`, JSON.stringify(conversations))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Fetch conversations (from localStorage)
 */
export function useConversations(userKey) {
  return useQuery({
    queryKey: queryKeys.workspace.conversations(),
    queryFn: () => getConversationsFromStorage(userKey),
    enabled: !!userKey,
    staleTime: Infinity, // Don't refetch automatically since it's local
  })
}

/**
 * Create new conversation
 */
export function useCreateConversation(userKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationData) => {
      const newConversation = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        created: new Date(),
        updated: new Date(),
        ...conversationData,
      }
      return newConversation
    },
    onSuccess: (newConversation) => {
      queryClient.setQueryData(queryKeys.workspace.conversations(), (old = []) => {
        const updated = [newConversation, ...old]
        saveConversationsToStorage(userKey, updated)
        return updated
      })
    },
  })
}

/**
 * Update conversation
 */
export function useUpdateConversation(userKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, updates }) => {
      return { conversationId, updates }
    },
    onSuccess: ({ conversationId, updates }) => {
      queryClient.setQueryData(queryKeys.workspace.conversations(), (old = []) => {
        const updated = old.map((c) =>
          c.id === conversationId ? { ...c, ...updates, updated: new Date() } : c
        )
        saveConversationsToStorage(userKey, updated)
        return updated
      })
    },
  })
}

/**
 * Delete conversation
 */
export function useDeleteConversation(userKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId) => {
      return conversationId
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workspace.conversations() })

      const previousConversations = queryClient.getQueryData(
        queryKeys.workspace.conversations()
      )

      queryClient.setQueryData(queryKeys.workspace.conversations(), (old = []) => {
        const updated = old.filter((c) => c.id !== conversationId)
        saveConversationsToStorage(userKey, updated)
        return updated
      })

      return { previousConversations }
    },
    onError: (err, conversationId, context) => {
      queryClient.setQueryData(
        queryKeys.workspace.conversations(),
        context.previousConversations
      )
    },
  })
}

/**
 * Add message to conversation
 */
export function useAddMessage(userKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, message }) => {
      return { conversationId, message }
    },
    onSuccess: ({ conversationId, message }) => {
      queryClient.setQueryData(queryKeys.workspace.conversations(), (old = []) => {
        const updated = old.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: [...(c.messages || []), message],
              updated: new Date(),
            }
          }
          return c
        })
        saveConversationsToStorage(userKey, updated)
        return updated
      })
    },
  })
}

export default useConversations
