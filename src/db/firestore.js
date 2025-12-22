/**
 * Firestore Database Service
 * 
 * Simple Firestore wrapper with offline persistence for Notes and Conversations.
 * Replaces RxDB with native Firebase SDK for better stability.
 */

import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { getDb } from '../config/firebase'
import { logger } from '../utils/logger'

// Collection names
const COLLECTIONS = {
  NOTES: 'user_notes',
  CONVERSATIONS: 'user_conversations', 
  MESSAGES: 'user_messages'
}

/**
 * Convert Firestore timestamp to ISO string
 */
function convertTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString()
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  return timestamp
}

/**
 * Convert Firestore doc to plain object
 * Handles nested timestamps in messages array
 */
function docToObject(doc) {
  if (!doc.exists()) return null
  const data = doc.data()
  
  // Convert messages timestamps if present
  const messages = data.messages?.map(m => ({
    ...m,
    timestamp: convertTimestamp(m.timestamp)
  })) || []
  
  return {
    id: doc.id,
    ...data,
    messages,
    created: convertTimestamp(data.created),
    updated: convertTimestamp(data.updated)
  }
}

// ============================================================================
// NOTES
// ============================================================================

/**
 * Subscribe to user's notes
 * @param {string} userId 
 * @param {Function} callback - Called with array of notes
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotes(userId, callback) {
  if (!userId) {
    callback([])
    return () => {}
  }

  const db = getDb()
  if (!db) {
    logger.warn('Firestore', 'Database not available')
    callback([])
    return () => {}
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.NOTES),
      where('userId', '==', userId),
      orderBy('updated', 'desc'),
      limit(500)
    )

    return onSnapshot(q, 
      (snapshot) => {
        const notes = snapshot.docs.map(doc => docToObject(doc))
        callback(notes)
      },
      (error) => {
        logger.error('Firestore', 'Notes subscription error:', error)
        callback([])
      }
    )
  } catch (error) {
    logger.error('Firestore', 'Failed to subscribe to notes:', error)
    callback([])
    return () => {}
  }
}

/**
 * Create a new note
 */
export async function createNote(userId, noteData) {
  const db = getDb()
  if (!db || !userId) return null

  try {
    const now = new Date().toISOString()
    const noteDoc = {
      userId,
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      tags: noteData.tags || [],
      folder: noteData.folder || null,
      isPinned: noteData.isPinned || false,
      isArchived: noteData.isArchived || false,
      created: now,
      updated: now
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), noteDoc)
    logger.log('[Firestore] Created note:', docRef.id)
    
    return { id: docRef.id, ...noteDoc }
  } catch (error) {
    logger.error('Firestore', 'Failed to create note:', error)
    return null
  }
}

/**
 * Update a note
 */
export async function updateNote(noteId, updates) {
  const db = getDb()
  if (!db || !noteId) return null

  try {
    const docRef = doc(db, COLLECTIONS.NOTES, noteId)
    await updateDoc(docRef, {
      ...updates,
      updated: new Date().toISOString()
    })
    logger.log('[Firestore] Updated note:', noteId)
    return true
  } catch (error) {
    logger.error('Firestore', 'Failed to update note:', error)
    return null
  }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId) {
  const db = getDb()
  if (!db || !noteId) return null

  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId))
    logger.log('[Firestore] Deleted note:', noteId)
    return true
  } catch (error) {
    logger.error('Firestore', 'Failed to delete note:', error)
    return null
  }
}

/**
 * Delete multiple notes
 */
export async function deleteNotes(noteIds) {
  const db = getDb()
  if (!db || !noteIds?.length) return null

  try {
    const batch = writeBatch(db)
    noteIds.forEach(id => {
      batch.delete(doc(db, COLLECTIONS.NOTES, id))
    })
    await batch.commit()
    logger.log('[Firestore] Deleted notes:', noteIds.length)
    return true
  } catch (error) {
    logger.error('Firestore', 'Failed to delete notes:', error)
    return null
  }
}

// ============================================================================
// CONVERSATIONS (with embedded messages)
// ============================================================================

/**
 * Subscribe to user's conversations
 */
export function subscribeToConversations(userId, callback) {
  if (!userId) {
    callback([])
    return () => {}
  }

  const db = getDb()
  if (!db) {
    callback([])
    return () => {}
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      orderBy('updated', 'desc'),
      limit(100)
    )

    return onSnapshot(q,
      (snapshot) => {
        const conversations = snapshot.docs.map(doc => docToObject(doc))
        callback(conversations)
      },
      (error) => {
        logger.error('Firestore', 'Conversations subscription error:', error)
        callback([])
      }
    )
  } catch (error) {
    logger.error('Firestore', 'Failed to subscribe to conversations:', error)
    callback([])
    return () => {}
  }
}

/**
 * Create a new conversation (with empty messages array)
 */
export async function createConversation(userId, convData = {}) {
  const db = getDb()
  if (!db || !userId) return null

  try {
    const now = new Date().toISOString()
    const convDoc = {
      userId,
      title: convData.title || 'New Chat',
      systemPrompt: convData.systemPrompt || '',
      type: convData.type || 'chat',
      messages: [], // Embedded messages array
      titleGenerated: false,
      userEditedTitle: false,
      summary: null,
      created: now,
      updated: now
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.CONVERSATIONS), convDoc)
    logger.log('[Firestore] Created conversation:', docRef.id)
    
    return { id: docRef.id, ...convDoc }
  } catch (error) {
    logger.error('Firestore', 'Failed to create conversation:', error)
    return null
  }
}

/**
 * Update a conversation (title, summary, etc.)
 */
export async function updateConversation(conversationId, updates) {
  const db = getDb()
  if (!db || !conversationId) return null

  try {
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId)
    await updateDoc(docRef, {
      ...updates,
      updated: new Date().toISOString()
    })
    return true
  } catch (error) {
    logger.error('Firestore', 'Failed to update conversation:', error)
    return null
  }
}

/**
 * Save messages to conversation (replaces entire messages array)
 * This is atomic - either all messages are saved or none
 * Pattern: Optimistic update with retry support
 */
export async function saveConversationMessages(conversationId, messages, updates = {}) {
  const db = getDb()
  if (!db || !conversationId) {
    logger.warn('[Firestore] Cannot save messages - missing db or conversationId')
    return null
  }

  // Don't try to save to temp conversations
  if (conversationId.startsWith('temp_')) {
    logger.warn('[Firestore] Cannot save to temp conversation:', conversationId)
    return null
  }

  try {
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId)
    
    // Clean messages for storage (remove streaming flag, internal fields, etc.)
    const cleanMessages = messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date().toISOString(),
      // Preserve attachments if present (but clean them)
      ...(m.attachments?.length > 0 ? {
        attachments: m.attachments.map(a => ({
          name: a.name,
          type: a.type || a.mimeType,
          // Don't store base64 in Firestore - too large
          // Store reference or URL instead if needed
        })).filter(a => a.name)
      } : {})
    }))
    
    await updateDoc(docRef, {
      messages: cleanMessages,
      ...updates,
      updated: new Date().toISOString()
    })
    
    logger.log('[Firestore] Saved conversation messages:', conversationId, cleanMessages.length)
    return true
  } catch (error) {
    logger.error('Firestore', 'Failed to save conversation messages:', error)
    
    // Check if document doesn't exist (race condition)
    if (error.code === 'not-found') {
      logger.warn('[Firestore] Conversation not found, may need to create first:', conversationId)
    }
    
    return null
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId) {
  const db = getDb()
  if (!db || !conversationId) return null

  try {
    await deleteDoc(doc(db, COLLECTIONS.CONVERSATIONS, conversationId))
    logger.log('[Firestore] Deleted conversation:', conversationId)
    return true
  } catch (error) {
    logger.error('Firestore', 'Failed to delete conversation:', error)
    return null
  }
}

// ============================================================================
// MESSAGES (Legacy - kept for backward compatibility, will migrate)
// ============================================================================

/**
 * Subscribe to messages for a conversation
 * Now reads from embedded messages in conversation doc
 * Pattern: Real-time sync with optimistic update support
 */
export function subscribeToMessages(conversationId, userId, callback) {
  if (!conversationId || !userId) {
    callback([])
    return () => {}
  }

  // For temp conversations, return empty - they don't exist in Firestore yet
  if (conversationId.startsWith('temp_')) {
    logger.log('[Firestore] Skipping subscription for temp conversation:', conversationId)
    callback([])
    return () => {}
  }

  const db = getDb()
  if (!db) {
    callback([])
    return () => {}
  }

  try {
    // Subscribe to the conversation document itself
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId)
    
    return onSnapshot(docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          logger.log('[Firestore] Conversation not found:', conversationId)
          callback([])
          return
        }
        
        const data = snapshot.data()
        // Check ownership
        if (data.userId !== userId) {
          logger.warn('[Firestore] User mismatch for conversation:', conversationId)
          callback([])
          return
        }
        
        // Return embedded messages with proper timestamp conversion
        const messages = (data.messages || []).map(m => ({
          ...m,
          timestamp: convertTimestamp(m.timestamp)
        }))
        
        logger.log('[Firestore] Messages subscription update:', conversationId, messages.length)
        callback(messages)
      },
      (error) => {
        logger.error('Firestore', 'Messages subscription error:', error)
        callback([])
      }
    )
  } catch (error) {
    logger.error('Firestore', 'Failed to subscribe to messages:', error)
    callback([])
    return () => {}
  }
}

/**
 * Save a message - now saves to embedded array
 * @deprecated Use saveConversationMessages instead for batch saves
 */
export async function saveMessage() {
  // This is now handled by saveConversationMessages
  // Kept for backward compatibility but does nothing
  logger.log('[Firestore] saveMessage called - use saveConversationMessages instead')
  return null
}

/**
 * Clear all local data (for logout)
 */
export async function clearLocalData() {
  // With Firestore, data is server-side, so we just log
  logger.log('[Firestore] Clear local data called - data persists on server')
}

export default {
  // Notes
  subscribeToNotes,
  createNote,
  updateNote,
  deleteNote,
  deleteNotes,
  // Conversations
  subscribeToConversations,
  createConversation,
  updateConversation,
  saveConversationMessages,
  deleteConversation,
  // Messages
  subscribeToMessages,
  saveMessage,
  // Utils
  clearLocalData
}
