/**
 * Firestore Conversations Query Hooks
 * TanStack Query hooks for conversations management with IndexedDB + Firestore sync
 * 
 * Requirements: 6.1, 6.2
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryKeys } from '@/lib/queryKeys'
import { 
  initDB, 
  getConversationsFromDB, 
  saveConversationsToDB, 
  saveConversationToDB, 
  deleteConversationFromDB,
  deleteMessagesForConversation,
  SyncStatus
} from '@/services/indexedDB'
import { 
  getConversations as getConversationsFromFirestore, 
  saveConversation as saveConversationToFirestore, 
  deleteConversation as deleteConversationFromFirestore
} from '@/services/firestoreDataService'
import { queueSync, isNetworkOnline, SyncOperation } from '@/services/syncService'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'

/**
 * Fetch all conversations with offline-first strategy
 */
export function useFirestoreConversations(options = {}) {
  const user = useAuthStore(state => state.user)
  const userId = user?.id || user?.uid || user?.userId
  
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: async () => {
      await initDB()
      
      // Load from IndexedDB first
      let conversations = await getConversationsFromDB(userId)
      
      // Try to sync with Firestore if online
      if (isNetworkOnline() && userId) {
        try {
          const { conversations: firestoreConvs } = await getConversationsFromFirestore(userId, { pageSize: 100 })
          
          if (firestoreConvs.length > 0) {
            const merged = mergeConversations(conversations, firestoreConvs)
            await saveConversationsToDB(userId, merged)
            logger.log('[useFirestoreConversations] Synced', firestoreConvs.length, 'conversations')
            return merged
          }
        } catch (err) {
          logger.warn('Firestore', 'Conversations sync failed:', err.message)
        }
      }
      
      return conversations
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!userId,
    ...options,
  })
}


/**
 * Merge local and remote conversations
 */
function mergeConversations(local, remote) {
  const merged = new Map()
  
  remote.forEach(conv => {
    merged.set(conv.id, { ...conv, syncStatus: SyncStatus.SYNCED })
  })
  
  local.forEach(conv => {
    const existing = merged.get(conv.id)
    
    if (!existing) {
      merged.set(conv.id, { ...conv, syncStatus: conv.syncStatus || SyncStatus.PENDING })
    } else if (conv.syncStatus === SyncStatus.PENDING) {
      const localUpdated = new Date(conv.updated).getTime()
      const remoteUpdated = new Date(existing.updated).getTime()
      
      if (localUpdated > remoteUpdated) {
        merged.set(conv.id, conv)
      }
    }
  })
  
  return Array.from(merged.values())
}

/**
 * Fetch single conversation by ID
 */
export function useFirestoreConversation(conversationId, options = {}) {
  const { data: conversations = [] } = useFirestoreConversations()
  
  return useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => conversations.find(c => c.id === conversationId) || null,
    enabled: !!conversationId && conversations.length > 0,
    ...options,
  })
}

/**
 * Create new conversation
 */
export function useCreateFirestoreConversation() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const userId = user?.id || user?.uid || user?.userId

  return useMutation({
    mutationFn: async (convData = {}) => {
      const newConv = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'New Conversation',
        created: new Date(),
        updated: new Date(),
        userId,
        messageCount: 0,
        syncStatus: SyncStatus.PENDING,
        ...convData,
      }
      
      await saveConversationToDB(userId, newConv)
      
      if (userId) {
        await queueSync({
          entityType: 'conversation',
          entityId: newConv.id,
          operation: SyncOperation.CREATE,
          data: newConv,
          userId
        })
      }
      
      return newConv
    },
    onSuccess: (newConv) => {
      queryClient.setQueryData(queryKeys.conversations.list(), (old = []) => [
        newConv,
        ...old,
      ])
    },
  })
}

/**
 * Update conversation
 */
export function useUpdateFirestoreConversation() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const userId = user?.id || user?.uid || user?.userId

  return useMutation({
    mutationFn: async ({ conversationId, data }) => {
      const conversations = queryClient.getQueryData(queryKeys.conversations.list()) || []
      const existing = conversations.find(c => c.id === conversationId)
      if (!existing) throw new Error('Conversation not found')

      const updated = { 
        ...existing, 
        ...data, 
        updated: new Date(),
        syncStatus: SyncStatus.PENDING
      }

      await saveConversationToDB(userId, updated)

      if (userId) {
        await queueSync({
          entityType: 'conversation',
          entityId: conversationId,
          operation: SyncOperation.UPDATE,
          data: updated,
          userId
        })
      }

      return updated
    },
    onMutate: async ({ conversationId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.list() })
      const previous = queryClient.getQueryData(queryKeys.conversations.list())

      queryClient.setQueryData(queryKeys.conversations.list(), (old = []) =>
        old.map(c => c.id === conversationId ? { ...c, ...data, updated: new Date() } : c)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.conversations.list(), context?.previous)
    },
  })
}

/**
 * Delete conversation
 */
export function useDeleteFirestoreConversation() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const userId = user?.id || user?.uid || user?.userId

  return useMutation({
    mutationFn: async (conversationId) => {
      // Delete from IndexedDB
      await deleteConversationFromDB(conversationId)
      await deleteMessagesForConversation(conversationId)

      if (userId) {
        await queueSync({
          entityType: 'conversation',
          entityId: conversationId,
          operation: SyncOperation.DELETE,
          data: null,
          userId
        })
      }

      return conversationId
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.list() })
      const previous = queryClient.getQueryData(queryKeys.conversations.list())

      queryClient.setQueryData(queryKeys.conversations.list(), (old = []) =>
        old.filter(c => c.id !== conversationId)
      )

      // Also invalidate messages for this conversation
      queryClient.removeQueries({ queryKey: queryKeys.messages.list(conversationId) })

      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(queryKeys.conversations.list(), context?.previous)
    },
  })
}

/**
 * Get recent conversations
 */
export function useRecentConversations(limit = 10) {
  const { data: conversations = [], ...rest } = useFirestoreConversations()
  
  const recent = useMemo(() => {
    return conversations
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, limit)
  }, [conversations, limit])
  
  return { data: recent, ...rest }
}

/**
 * Search conversations
 */
export function useSearchConversations(searchTerm, options = {}) {
  const { data: conversations = [] } = useFirestoreConversations()
  
  return useQuery({
    queryKey: [...queryKeys.conversations.all, 'search', searchTerm],
    queryFn: () => {
      if (!searchTerm || searchTerm.length < 2) return []
      const term = searchTerm.toLowerCase()
      return conversations.filter(conv => 
        conv.title?.toLowerCase().includes(term)
      )
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000,
    ...options,
  })
}
