/**
 * Firestore Data Service
 * 
 * CRUD operations for user data (notes, conversations, messages) in Firestore.
 * Provides cloud storage and sync functionality.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { initializeFirebase } from '../config/firebase'
import { logger } from '../utils/logger'
import { getCurrentUser } from './firebaseAuth'

// Collection names
const COLLECTIONS = {
  NOTES: 'user_notes',
  CONVERSATIONS: 'user_conversations',
  MESSAGES: 'user_messages'
}

// Limits
const LIMITS = {
  MAX_NOTES: 500,
  MAX_CONVERSATIONS: 100,
  MAX_MESSAGES_PER_CONVERSATION: 200,
  PAGE_SIZE: 20
}

let db = null

/**
 * Get Firestore instance
 */
function getFirestore() {
  if (!db) {
    const firebase = initializeFirebase()
    db = firebase.db
  }
  return db
}

/**
 * Check if Firebase Auth is ready for Firestore operations
 * Returns true if user is authenticated with Firebase Auth
 */
function isFirebaseAuthReady() {
  const user = getCurrentUser()
  return !!user
}

/**
 * Ensure Firebase Auth is ready before Firestore write operations
 * Throws error if not authenticated - caller should handle gracefully
 */
function ensureFirebaseAuth(operation) {
  if (!isFirebaseAuthReady()) {
    logger.warn('FirestoreData', `Firebase Auth not ready for ${operation}, skipping Firestore write`)
    throw new Error('FIREBASE_AUTH_NOT_READY')
  }
}

/**
 * Convert Firestore Timestamp to Date
 */
function timestampToDate(timestamp) {
  if (!timestamp) return new Date()
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp.toDate) {
    return timestamp.toDate()
  }
  return new Date(timestamp)
}

/**
 * Convert Date to Firestore-compatible format
 */
function dateToTimestamp(date) {
  if (!date) return serverTimestamp()
  if (date instanceof Date) {
    return Timestamp.fromDate(date)
  }
  return Timestamp.fromDate(new Date(date))
}

// ============================================================================
// NOTES
// ============================================================================

/**
 * Get all notes for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.pageSize - Number of items per page
 * @param {any} options.lastDoc - Last document for pagination
 * @returns {Promise<{notes: Array, lastDoc: any, hasMore: boolean}>}
 */
export async function getNotes(userId, options = {}) {
  const firestore = getFirestore()
  const { pageSize = LIMITS.PAGE_SIZE, lastDoc = null } = options
  
  try {
    let q = query(
      collection(firestore, COLLECTIONS.NOTES),
      where('userId', '==', userId),
      orderBy('updated', 'desc'),
      limit(pageSize + 1) // Get one extra to check if there are more
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const snapshot = await getDocs(q)
    const notes = []
    let lastVisible = null
    
    snapshot.forEach((doc, index) => {
      if (index < pageSize) {
        const data = doc.data()
        notes.push({
          id: doc.id,
          ...data,
          created: timestampToDate(data.created),
          updated: timestampToDate(data.updated)
        })
        lastVisible = doc
      }
    })
    
    return {
      notes,
      lastDoc: lastVisible,
      hasMore: snapshot.size > pageSize
    }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to get notes', error)
    throw error
  }
}

/**
 * Get a single note by ID
 * @param {string} userId - User ID
 * @param {string} noteId - Note ID
 */
export async function getNote(userId, noteId) {
  const firestore = getFirestore()
  
  try {
    const docRef = doc(firestore, COLLECTIONS.NOTES, noteId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data()
    
    // Verify ownership
    if (data.userId !== userId) {
      throw new Error('Access denied')
    }
    
    return {
      id: docSnap.id,
      ...data,
      created: timestampToDate(data.created),
      updated: timestampToDate(data.updated)
    }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to get note', error)
    throw error
  }
}

/**
 * Create or update a note
 * @param {string} userId - User ID
 * @param {Object} note - Note data
 */
export async function saveNote(userId, note) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('saveNote')
  
  const firestore = getFirestore()
  
  try {
    const noteId = note.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const docRef = doc(firestore, COLLECTIONS.NOTES, noteId)
    
    const noteData = {
      ...note,
      id: noteId,
      userId,
      updated: serverTimestamp(),
      created: note.created ? dateToTimestamp(note.created) : serverTimestamp()
    }
    
    // Remove undefined values
    Object.keys(noteData).forEach(key => {
      if (noteData[key] === undefined) {
        delete noteData[key]
      }
    })
    
    await setDoc(docRef, noteData, { merge: true })
    
    logger.log('[FirestoreData] Note saved:', noteId)
    
    return { id: noteId, ...noteData }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to save note', error)
    throw error
  }
}

/**
 * Delete a note
 * @param {string} userId - User ID
 * @param {string} noteId - Note ID
 */
export async function deleteNote(userId, noteId) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('deleteNote')
  
  const firestore = getFirestore()
  
  try {
    // Verify ownership first
    const existing = await getNote(userId, noteId)
    if (!existing) {
      throw new Error('Note not found')
    }
    
    const docRef = doc(firestore, COLLECTIONS.NOTES, noteId)
    await deleteDoc(docRef)
    
    logger.log('[FirestoreData] Note deleted:', noteId)
    
    return { success: true }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to delete note', error)
    throw error
  }
}

/**
 * Batch save multiple notes
 * @param {string} userId - User ID
 * @param {Array} notes - Array of notes
 */
export async function saveNotesBatch(userId, notes) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('saveNotesBatch')
  
  const firestore = getFirestore()
  
  try {
    const batch = writeBatch(firestore)
    
    for (const note of notes) {
      const noteId = note.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const docRef = doc(firestore, COLLECTIONS.NOTES, noteId)
      
      const noteData = {
        ...note,
        id: noteId,
        userId,
        updated: serverTimestamp(),
        created: note.created ? dateToTimestamp(note.created) : serverTimestamp()
      }
      
      batch.set(docRef, noteData, { merge: true })
    }
    
    await batch.commit()
    
    logger.log('[FirestoreData] Batch saved', notes.length, 'notes')
    
    return { success: true, count: notes.length }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to batch save notes', error)
    throw error
  }
}

// ============================================================================
// CONVERSATIONS
// ============================================================================

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 */
export async function getConversations(userId, options = {}) {
  const firestore = getFirestore()
  const { pageSize = LIMITS.PAGE_SIZE, lastDoc = null } = options
  
  try {
    let q = query(
      collection(firestore, COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      orderBy('updated', 'desc'),
      limit(pageSize + 1)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const snapshot = await getDocs(q)
    const conversations = []
    let lastVisible = null
    
    snapshot.forEach((doc, index) => {
      if (index < pageSize) {
        const data = doc.data()
        conversations.push({
          id: doc.id,
          ...data,
          created: timestampToDate(data.created),
          updated: timestampToDate(data.updated),
          // Don't include messages here - load separately
          messages: []
        })
        lastVisible = doc
      }
    })
    
    return {
      conversations,
      lastDoc: lastVisible,
      hasMore: snapshot.size > pageSize
    }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to get conversations', error)
    throw error
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(userId, conversationId) {
  const firestore = getFirestore()
  
  try {
    const docRef = doc(firestore, COLLECTIONS.CONVERSATIONS, conversationId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data()
    
    if (data.userId !== userId) {
      throw new Error('Access denied')
    }
    
    return {
      id: docSnap.id,
      ...data,
      created: timestampToDate(data.created),
      updated: timestampToDate(data.updated),
      messages: [] // Load messages separately
    }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to get conversation', error)
    throw error
  }
}

/**
 * Create or update a conversation
 */
export async function saveConversation(userId, conversation) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('saveConversation')
  
  const firestore = getFirestore()
  
  try {
    const convId = conversation.id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const docRef = doc(firestore, COLLECTIONS.CONVERSATIONS, convId)
    
    // Don't save messages in conversation document
    const { messages, ...convData } = conversation
    
    const saveData = {
      ...convData,
      id: convId,
      userId,
      updated: serverTimestamp(),
      created: conversation.created ? dateToTimestamp(conversation.created) : serverTimestamp(),
      messageCount: messages?.length || conversation.messageCount || 0
    }
    
    Object.keys(saveData).forEach(key => {
      if (saveData[key] === undefined) {
        delete saveData[key]
      }
    })
    
    await setDoc(docRef, saveData, { merge: true })
    
    logger.log('[FirestoreData] Conversation saved:', convId)
    
    return { id: convId, ...saveData }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to save conversation', error)
    throw error
  }
}

/**
 * Delete a conversation and its messages
 */
export async function deleteConversation(userId, conversationId) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('deleteConversation')
  
  const firestore = getFirestore()
  
  try {
    // Verify ownership
    const existing = await getConversation(userId, conversationId)
    if (!existing) {
      throw new Error('Conversation not found')
    }
    
    const batch = writeBatch(firestore)
    
    // Delete conversation
    const convRef = doc(firestore, COLLECTIONS.CONVERSATIONS, conversationId)
    batch.delete(convRef)
    
    // Delete all messages for this conversation
    const messagesQuery = query(
      collection(firestore, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    )
    const messagesSnapshot = await getDocs(messagesQuery)
    messagesSnapshot.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    
    logger.log('[FirestoreData] Conversation deleted:', conversationId)
    
    return { success: true }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to delete conversation', error)
    throw error
  }
}

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Get messages for a conversation
 */
export async function getMessages(userId, conversationId, options = {}) {
  const firestore = getFirestore()
  const { pageSize = LIMITS.MAX_MESSAGES_PER_CONVERSATION, lastDoc = null } = options
  
  try {
    let q = query(
      collection(firestore, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc'),
      limit(pageSize + 1)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const snapshot = await getDocs(q)
    const messages = []
    let lastVisible = null
    
    snapshot.forEach((doc, index) => {
      if (index < pageSize) {
        const data = doc.data()
        messages.push({
          id: doc.id,
          ...data,
          timestamp: timestampToDate(data.timestamp)
        })
        lastVisible = doc
      }
    })
    
    return {
      messages,
      lastDoc: lastVisible,
      hasMore: snapshot.size > pageSize
    }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to get messages', error)
    throw error
  }
}

/**
 * Save a message
 */
export async function saveMessage(userId, conversationId, message) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('saveMessage')
  
  const firestore = getFirestore()
  
  try {
    const msgId = message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const docRef = doc(firestore, COLLECTIONS.MESSAGES, msgId)
    
    const msgData = {
      ...message,
      id: msgId,
      userId,
      conversationId,
      timestamp: message.timestamp ? dateToTimestamp(message.timestamp) : serverTimestamp()
    }
    
    Object.keys(msgData).forEach(key => {
      if (msgData[key] === undefined) {
        delete msgData[key]
      }
    })
    
    await setDoc(docRef, msgData, { merge: true })
    
    // Update conversation's updated timestamp and message count
    const convRef = doc(firestore, COLLECTIONS.CONVERSATIONS, conversationId)
    await updateDoc(convRef, {
      updated: serverTimestamp(),
      messageCount: (await getMessagesCount(userId, conversationId))
    }).catch(() => {
      // Conversation might not exist yet, ignore
    })
    
    return { id: msgId, ...msgData }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to save message', error)
    throw error
  }
}

/**
 * Save multiple messages
 */
export async function saveMessagesBatch(userId, conversationId, messages) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('saveMessagesBatch')
  
  const firestore = getFirestore()
  
  try {
    const batch = writeBatch(firestore)
    
    for (const message of messages) {
      const msgId = message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const docRef = doc(firestore, COLLECTIONS.MESSAGES, msgId)
      
      const msgData = {
        ...message,
        id: msgId,
        userId,
        conversationId,
        timestamp: message.timestamp ? dateToTimestamp(message.timestamp) : serverTimestamp()
      }
      
      batch.set(docRef, msgData, { merge: true })
    }
    
    await batch.commit()
    
    logger.log('[FirestoreData] Batch saved', messages.length, 'messages')
    
    return { success: true, count: messages.length }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to batch save messages', error)
    throw error
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(userId, messageId) {
  // Check Firebase Auth before write operation
  ensureFirebaseAuth('deleteMessage')
  
  const firestore = getFirestore()
  
  try {
    const docRef = doc(firestore, COLLECTIONS.MESSAGES, messageId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Message not found')
    }
    
    const data = docSnap.data()
    if (data.userId !== userId) {
      throw new Error('Access denied')
    }
    
    await deleteDoc(docRef)
    
    return { success: true }
  } catch (error) {
    logger.error('FirestoreData', 'Failed to delete message', error)
    throw error
  }
}

/**
 * Get message count for a conversation
 */
async function getMessagesCount(userId, conversationId) {
  const firestore = getFirestore()
  
  const q = query(
    collection(firestore, COLLECTIONS.MESSAGES),
    where('conversationId', '==', conversationId),
    where('userId', '==', userId)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.size
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Notes
  getNotes,
  getNote,
  saveNote,
  deleteNote,
  saveNotesBatch,
  // Conversations
  getConversations,
  getConversation,
  saveConversation,
  deleteConversation,
  // Messages
  getMessages,
  saveMessage,
  saveMessagesBatch,
  deleteMessage,
  // Constants
  COLLECTIONS,
  LIMITS
}
