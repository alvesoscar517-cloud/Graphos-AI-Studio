/**
 * RxDB Hook for Conversations
 */

import { useMemo, useCallback } from 'react'
import { useRxCollection, useRxDocument, useRxMutations, useDatabase } from './useRxDB'

/**
 * Get all conversations for a user
 */
export function useConversations(userId, options = {}) {
  const { limit = 100 } = options
  
  const selector = useMemo(() => ({ userId }), [userId])

  const { documents, loading, error } = useRxCollection('conversations', {
    selector,
    sort: { updated: 'desc' },
    limit
  })

  return { conversations: documents, loading, error }
}

/**
 * Get a single conversation by ID
 */
export function useConversation(conversationId) {
  const { document, loading, error } = useRxDocument('conversations', conversationId)
  return { conversation: document, loading, error }
}

/**
 * Conversation mutations
 */
export function useConversationMutations() {
  const { insert, update, upsert, remove } = useRxMutations('conversations')
  const messageMutations = useRxMutations('messages')
  const { db } = useDatabase()

  const createConversation = async (userId, convData = {}) => {
    return await insert({
      userId,
      title: convData.title || 'New Chat',
      systemPrompt: convData.systemPrompt || '',
      type: convData.type || 'chat',
      titleGenerated: false,
      userEditedTitle: false,
      summary: null,
      messageCount: 0,
      ...convData
    })
  }

  const updateConversation = async (conversationId, convData) => {
    return await update(conversationId, convData)
  }

  const saveConversation = async (userId, convData) => {
    return await upsert({
      ...convData,
      userId
    })
  }

  const deleteConversation = async (conversationId) => {
    // Delete all messages first
    if (db) {
      const messages = await db.messages.find({
        selector: { conversationId }
      }).exec()
      
      if (messages.length > 0) {
        await db.messages.bulkRemove(messages.map(m => m.id))
      }
    }
    
    return await remove(conversationId)
  }

  return { createConversation, updateConversation, saveConversation, deleteConversation }
}

/**
 * Get messages for a conversation
 */
export function useMessages(conversationId, userId) {
  const selector = useMemo(() => ({ 
    conversationId,
    userId 
  }), [conversationId, userId])

  const { documents, loading, error } = useRxCollection('messages', {
    selector,
    sort: { timestamp: 'asc' }
  })

  return { messages: documents, loading, error }
}

/**
 * Message mutations
 */
export function useMessageMutations() {
  const { insert, update, upsert, remove, bulkInsert } = useRxMutations('messages')
  const convMutations = useRxMutations('conversations')

  const addMessage = async (conversationId, userId, messageData) => {
    const result = await insert({
      ...messageData,
      conversationId,
      userId,
      timestamp: messageData.timestamp || new Date().toISOString()
    })
    
    // Update conversation's messageCount and updated time
    try {
      await convMutations.update(conversationId, {
        messageCount: (messageData.messageCount || 0) + 1
      })
    } catch (e) {
      // Ignore if conversation update fails
    }
    
    return result
  }

  const updateMessage = async (messageId, messageData) => {
    return await update(messageId, messageData)
  }

  const saveMessage = async (conversationId, userId, messageData) => {
    return await upsert({
      ...messageData,
      conversationId,
      userId,
      timestamp: messageData.timestamp || new Date().toISOString()
    })
  }

  const deleteMessage = async (messageId) => {
    return await remove(messageId)
  }

  const addMessages = async (conversationId, userId, messages) => {
    const messagesWithMeta = messages.map(m => ({
      ...m,
      conversationId,
      userId,
      timestamp: m.timestamp || new Date().toISOString()
    }))
    return await bulkInsert(messagesWithMeta)
  }

  return { addMessage, updateMessage, saveMessage, deleteMessage, addMessages }
}
