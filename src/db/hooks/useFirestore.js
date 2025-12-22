/**
 * React Hooks for Firestore
 * 
 * Simple hooks wrapping Firestore subscriptions for Notes and Conversations.
 * Replaces RxDB hooks with native Firebase SDK.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  subscribeToNotes,
  createNote as createNoteDb,
  updateNote as updateNoteDb,
  deleteNote as deleteNoteDb,
  deleteNotes as deleteNotesDb,
  subscribeToConversations,
  createConversation as createConversationDb,
  updateConversation as updateConversationDb,
  saveConversationMessages as saveConversationMessagesDb,
  deleteConversation as deleteConversationDb,
  subscribeToMessages,
  saveMessage as saveMessageDb,
  clearLocalData
} from '../firestore'
import { logger } from '../../utils/logger'

// ============================================================================
// NOTES HOOKS
// ============================================================================

/**
 * Subscribe to user's notes
 */
export function useNotes(userId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToNotes(userId, (notesData) => {
      setNotes(notesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return { notes, loading, error }
}

/**
 * Note mutations
 */
export function useNoteMutations() {
  const createNote = useCallback(async (userId, noteData) => {
    return await createNoteDb(userId, noteData)
  }, [])

  const updateNote = useCallback(async (noteId, updates) => {
    return await updateNoteDb(noteId, updates)
  }, [])

  const saveNote = useCallback(async (userId, noteData) => {
    // For upsert, if noteData has id, update; otherwise create
    if (noteData.id) {
      await updateNoteDb(noteData.id, noteData)
      return noteData
    }
    return await createNoteDb(userId, noteData)
  }, [])

  const deleteNote = useCallback(async (noteId) => {
    return await deleteNoteDb(noteId)
  }, [])

  const deleteNotes = useCallback(async (noteIds) => {
    return await deleteNotesDb(noteIds)
  }, [])

  return { createNote, updateNote, saveNote, deleteNote, deleteNotes }
}

// ============================================================================
// CONVERSATIONS HOOKS
// ============================================================================

/**
 * Subscribe to user's conversations
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setConversations([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToConversations(userId, (convData) => {
      setConversations(convData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return { conversations, loading, error }
}

/**
 * Conversation mutations
 */
export function useConversationMutations() {
  const createConversation = useCallback(async (userId, convData) => {
    return await createConversationDb(userId, convData)
  }, [])

  const updateConversation = useCallback(async (conversationId, updates) => {
    return await updateConversationDb(conversationId, updates)
  }, [])

  const saveConversationMessages = useCallback(async (conversationId, messages, updates = {}) => {
    return await saveConversationMessagesDb(conversationId, messages, updates)
  }, [])

  const deleteConversation = useCallback(async (conversationId) => {
    return await deleteConversationDb(conversationId)
  }, [])

  return { createConversation, updateConversation, saveConversationMessages, deleteConversation }
}

// ============================================================================
// MESSAGES HOOKS
// ============================================================================

/**
 * Subscribe to messages for a conversation
 */
export function useMessages(conversationId, userId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!conversationId || !userId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToMessages(conversationId, userId, (msgData) => {
      setMessages(msgData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [conversationId, userId])

  return { messages, loading, error }
}

/**
 * Message mutations
 */
export function useMessageMutations() {
  const saveMessage = useCallback(async (conversationId, userId, messageData) => {
    return await saveMessageDb(conversationId, userId, messageData)
  }, [])

  const addMessage = useCallback(async (conversationId, userId, messageData) => {
    return await saveMessageDb(conversationId, userId, messageData)
  }, [])

  return { saveMessage, addMessage }
}

// ============================================================================
// SYNC HOOK (No-op for Firestore - auto syncs)
// ============================================================================

/**
 * No-op sync hook - Firestore auto-syncs
 */
export function useFirestoreSync(userId) {
  // Firestore handles sync automatically
  // This is just for API compatibility with old RxDB hooks
  useEffect(() => {
    if (userId) {
      logger.log('[Firestore] User connected:', userId)
    }
  }, [userId])
}

// Export clearLocalData for logout
export { clearLocalData }
