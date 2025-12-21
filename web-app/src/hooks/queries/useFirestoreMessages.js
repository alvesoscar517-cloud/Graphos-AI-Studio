/**
 * Firestore Messages Query Hooks
 * TanStack Query hooks for messages management with IndexedDB + Firestore sync
 * 
 * Requirements: 6.3, 6.4, 6.5
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryKeys } from '@/lib/queryKeys'
import { 
  initDB, 
  getMessagesFromDB, 
  saveMessageToDB, 
  saveMessagesToDB,
  deleteMessageFromDB,
  SyncStatus
} from '@/services/indexedDB'
import { 
  getMessages as getMessagesFromFirestore, 
  saveMessage as saveMessageToFirestore, 
  deleteMessage as deleteMessageFromFirestore
} from '@/services/firestoreDataService'
import { queueSync, isNetworkOnline, SyncOperation } from '@/services/syncService'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'

const MESSAGES_PAGE_SIZE = 50

/**
 * Fetch messages for a conversation with offline-first strategy
 */
export function useFirestoreMessages(conversationId, options = {}) {
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id
  
  return useQuery({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: async () => {
      if (!conversationId) return []
      
      await initDB()
      
      // Load from IndexedDB first
      let messages = await getMessagesFromDB(conversationId)
      
      // Try to sync with Firestore if online
      if (isNetworkOnline() && userId) {
        try {
          const { messages: firestoreMessages } = await getMessagesFromFirestore(
            userId, 
            conversationId, 
            { pageSize: 200 }
          )
          
          if (firestoreMessages.length > 0) {
            const merged = mergeMessages(messages, firestoreMessages)
            await saveMessagesToDB(conversationId, merged)
            logger.log('[useFirestoreMessages] Synced', firestoreMessages.length, 'messages')
            return merged
          }
        } catch (err) {
          logger.warn('Firestore', 'Messages sync failed:', err.message)
        }
      }
      
      return messages
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!conversationId && !!userId,
    ...options,
  })
}


/**
 * Infinite query for paginated messages
 */
export function useInfiniteFirestoreMessages(conversationId, options = {}) {
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id
  
  return useInfiniteQuery({
    queryKey: [...queryKeys.messages.list(conversationId), 'infinite'],
    queryFn: async ({ pageParam }) => {
      if (!conversationId || !userId) return { messages: [], nextCursor: null }
      
      await initDB()
      
      // For first page, try IndexedDB first
      if (!pageParam) {
        const localMessages = await getMessagesFromDB(conversationId)
        if (localMessages.length > 0 && !isNetworkOnline()) {
          return {
            messages: localMessages.slice(0, MESSAGES_PAGE_SIZE),
            nextCursor: localMessages.length > MESSAGES_PAGE_SIZE ? MESSAGES_PAGE_SIZE : null
          }
        }
      }
      
      // Fetch from Firestore
      if (isNetworkOnline()) {
        try {
          const result = await getMessagesFromFirestore(userId, conversationId, {
            pageSize: MESSAGES_PAGE_SIZE,
            startAfter: pageParam
          })
          
          // Cache to IndexedDB
          if (result.messages.length > 0) {
            await saveMessagesToDB(conversationId, result.messages)
          }
          
          return result
        } catch (err) {
          logger.warn('Firestore', 'Paginated messages fetch failed:', err.message)
        }
      }
      
      return { messages: [], nextCursor: null }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!conversationId && !!userId,
    ...options,
  })
}

/**
 * Merge local and remote messages
 */
function mergeMessages(local, remote) {
  const merged = new Map()
  
  remote.forEach(msg => {
    merged.set(msg.id, { ...msg, syncStatus: SyncStatus.SYNCED })
  })
  
  local.forEach(msg => {
    const existing = merged.get(msg.id)
    
    if (!existing) {
      merged.set(msg.id, { ...msg, syncStatus: msg.syncStatus || SyncStatus.PENDING })
    } else if (msg.syncStatus === SyncStatus.PENDING) {
      // Local has pending changes - keep local
      merged.set(msg.id, msg)
    }
  })
  
  // Sort by created timestamp
  return Array.from(merged.values())
    .sort((a, b) => new Date(a.created) - new Date(b.created))
}

/**
 * Add message to conversation
 */
export function useAddFirestoreMessage() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id

  return useMutation({
    mutationFn: async ({ conversationId, messageData }) => {
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        role: 'user',
        content: '',
        created: new Date(),
        userId,
        syncStatus: SyncStatus.PENDING,
        ...messageData,
      }
      
      await saveMessageToDB(newMessage)
      
      if (userId) {
        await queueSync({
          entityType: 'message',
          entityId: newMessage.id,
          operation: SyncOperation.CREATE,
          data: newMessage,
          userId,
          parentId: conversationId
        })
      }
      
      return newMessage
    },
    onSuccess: (newMessage, { conversationId }) => {
      queryClient.setQueryData(queryKeys.messages.list(conversationId), (old = []) => [
        ...old,
        newMessage,
      ])
      
      // Update conversation's messageCount and updated timestamp
      queryClient.setQueryData(queryKeys.conversations.list(), (old = []) =>
        old.map(c => c.id === conversationId 
          ? { ...c, messageCount: (c.messageCount || 0) + 1, updated: new Date() }
          : c
        )
      )
    },
  })
}

/**
 * Update message
 */
export function useUpdateFirestoreMessage() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id

  return useMutation({
    mutationFn: async ({ conversationId, messageId, data }) => {
      const messages = queryClient.getQueryData(queryKeys.messages.list(conversationId)) || []
      const existing = messages.find(m => m.id === messageId)
      if (!existing) throw new Error('Message not found')

      const updated = { 
        ...existing, 
        ...data, 
        updated: new Date(),
        syncStatus: SyncStatus.PENDING
      }

      await saveMessageToDB(updated)

      if (userId) {
        await queueSync({
          entityType: 'message',
          entityId: messageId,
          operation: SyncOperation.UPDATE,
          data: updated,
          userId,
          parentId: conversationId
        })
      }

      return updated
    },
    onMutate: async ({ conversationId, messageId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.list(conversationId) })
      const previous = queryClient.getQueryData(queryKeys.messages.list(conversationId))

      queryClient.setQueryData(queryKeys.messages.list(conversationId), (old = []) =>
        old.map(m => m.id === messageId ? { ...m, ...data, updated: new Date() } : m)
      )

      return { previous }
    },
    onError: (_err, { conversationId }, context) => {
      queryClient.setQueryData(queryKeys.messages.list(conversationId), context?.previous)
    },
  })
}

/**
 * Delete message
 */
export function useDeleteFirestoreMessage() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id

  return useMutation({
    mutationFn: async ({ conversationId, messageId }) => {
      await deleteMessageFromDB(messageId)

      if (userId) {
        await queueSync({
          entityType: 'message',
          entityId: messageId,
          operation: SyncOperation.DELETE,
          data: null,
          userId,
          parentId: conversationId
        })
      }

      return messageId
    },
    onMutate: async ({ conversationId, messageId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.list(conversationId) })
      const previous = queryClient.getQueryData(queryKeys.messages.list(conversationId))

      queryClient.setQueryData(queryKeys.messages.list(conversationId), (old = []) =>
        old.filter(m => m.id !== messageId)
      )

      // Update conversation's messageCount
      queryClient.setQueryData(queryKeys.conversations.list(), (old = []) =>
        old.map(c => c.id === conversationId 
          ? { ...c, messageCount: Math.max(0, (c.messageCount || 0) - 1) }
          : c
        )
      )

      return { previous }
    },
    onError: (_err, { conversationId }, context) => {
      queryClient.setQueryData(queryKeys.messages.list(conversationId), context?.previous)
    },
  })
}

/**
 * Batch add messages (for AI responses with streaming)
 */
export function useBatchAddMessages() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id

  return useMutation({
    mutationFn: async ({ conversationId, messages }) => {
      const newMessages = messages.map(msg => ({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        created: new Date(),
        userId,
        syncStatus: SyncStatus.PENDING,
        ...msg,
      }))
      
      await saveMessagesToDB(conversationId, newMessages)
      
      if (userId) {
        for (const msg of newMessages) {
          await queueSync({
            entityType: 'message',
            entityId: msg.id,
            operation: SyncOperation.CREATE,
            data: msg,
            userId,
            parentId: conversationId
          })
        }
      }
      
      return newMessages
    },
    onSuccess: (newMessages, { conversationId }) => {
      queryClient.setQueryData(queryKeys.messages.list(conversationId), (old = []) => [
        ...old,
        ...newMessages,
      ])
      
      queryClient.setQueryData(queryKeys.conversations.list(), (old = []) =>
        old.map(c => c.id === conversationId 
          ? { ...c, messageCount: (c.messageCount || 0) + newMessages.length, updated: new Date() }
          : c
        )
      )
    },
  })
}

/**
 * Get message count for a conversation
 */
export function useMessageCount(conversationId) {
  const { data: messages = [] } = useFirestoreMessages(conversationId)
  return messages.length
}

/**
 * Get last message for a conversation (for preview)
 */
export function useLastMessage(conversationId) {
  const { data: messages = [], ...rest } = useFirestoreMessages(conversationId)
  
  const lastMessage = useMemo(() => {
    if (messages.length === 0) return null
    return messages[messages.length - 1]
  }, [messages])
  
  return { data: lastMessage, ...rest }
}
