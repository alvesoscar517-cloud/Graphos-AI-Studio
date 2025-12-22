/**
 * Workspace Query Hook
 * 
 * Re-exports from RxDB hooks for backward compatibility.
 * New code should use WorkspaceContext or import directly from db/hooks.
 */

import { 
  useConversations as useConversationsRx, 
  useConversationMutations,
  useMessageMutations 
} from '../../db/hooks'
import { useAuth } from '../../stores/authStore'

/**
 * Fetch conversations for current user
 */
export function useConversations() {
  const { user } = useAuth()
  const userId = user?.userId || user?.uid || user?.id
  const { conversations, loading, error } = useConversationsRx(userId)
  
  return {
    data: conversations,
    isLoading: loading,
    error,
    refetch: () => {} // RxDB auto-updates
  }
}

/**
 * Create new conversation
 */
export function useCreateConversation() {
  const { user } = useAuth()
  const userId = user?.userId || user?.uid || user?.id
  const { createConversation } = useConversationMutations()
  
  return {
    mutateAsync: async (conversationData = {}) => {
      return await createConversation(userId, conversationData)
    },
    mutate: (conversationData = {}) => {
      createConversation(userId, conversationData)
    }
  }
}

/**
 * Update conversation
 */
export function useUpdateConversation() {
  const { updateConversation } = useConversationMutations()
  
  return {
    mutateAsync: async ({ conversationId, updates }) => {
      return await updateConversation(conversationId, updates)
    },
    mutate: ({ conversationId, updates }) => {
      updateConversation(conversationId, updates)
    }
  }
}

/**
 * Delete conversation
 */
export function useDeleteConversation() {
  const { deleteConversation } = useConversationMutations()
  
  return {
    mutateAsync: async (conversationId) => {
      return await deleteConversation(conversationId)
    },
    mutate: (conversationId) => {
      deleteConversation(conversationId)
    }
  }
}

/**
 * Add message to conversation
 */
export function useAddMessage() {
  const { user } = useAuth()
  const userId = user?.userId || user?.uid || user?.id
  const { addMessage } = useMessageMutations()
  
  return {
    mutateAsync: async ({ conversationId, message }) => {
      return await addMessage(conversationId, userId, message)
    },
    mutate: ({ conversationId, message }) => {
      addMessage(conversationId, userId, message)
    }
  }
}

export default useConversations
