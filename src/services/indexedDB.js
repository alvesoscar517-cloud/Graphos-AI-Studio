import { logger } from '../utils/logger'
const DB_NAME = 'AIContentAuthenticator'
const DB_VERSION = 3 // Bump version to add messages store, syncQueue, and syncStatus indexes
const NOTES_STORE = 'notes'
const CONVERSATIONS_STORE = 'conversations'
const MESSAGES_STORE = 'messages'
const SYNC_QUEUE_STORE = 'syncQueue'

let db = null

/**
 * Initialize IndexedDB
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to open IndexedDB', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      db = /** @type {IDBOpenDBRequest} */ (event.target).result
      const oldVersion = event.oldVersion

      // Create notes store if it doesn't exist
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' })
        notesStore.createIndex('updated', 'updated', { unique: false })
        notesStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        notesStore.createIndex('userId', 'userId', { unique: false })
      } else if (oldVersion < 3) {
        // Add syncStatus and userId indexes to existing notes store
        const transaction = /** @type {IDBVersionChangeEvent} */ (event).target.transaction
        const notesStore = transaction.objectStore(NOTES_STORE)
        if (!notesStore.indexNames.contains('syncStatus')) {
          notesStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        }
        if (!notesStore.indexNames.contains('userId')) {
          notesStore.createIndex('userId', 'userId', { unique: false })
        }
      }

      // Create conversations store if it doesn't exist
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
        const convsStore = db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' })
        convsStore.createIndex('updated', 'updated', { unique: false })
        convsStore.createIndex('userId', 'userId', { unique: false })
        convsStore.createIndex('syncStatus', 'syncStatus', { unique: false })
      } else if (oldVersion < 3) {
        // Add syncStatus index to existing conversations store
        const transaction = /** @type {IDBVersionChangeEvent} */ (event).target.transaction
        const convsStore = transaction.objectStore(CONVERSATIONS_STORE)
        if (!convsStore.indexNames.contains('syncStatus')) {
          convsStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        }
      }

      // Create messages store (new in v3)
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const messagesStore = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' })
        messagesStore.createIndex('conversationId', 'conversationId', { unique: false })
        messagesStore.createIndex('timestamp', 'timestamp', { unique: false })
        messagesStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        messagesStore.createIndex('userId', 'userId', { unique: false })
      }

      // Create sync queue store (new in v3)
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncQueueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
        syncQueueStore.createIndex('entityType', 'entityType', { unique: false })
        syncQueueStore.createIndex('entityId', 'entityId', { unique: false })
        syncQueueStore.createIndex('operation', 'operation', { unique: false })
        syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false })
        syncQueueStore.createIndex('status', 'status', { unique: false })
        syncQueueStore.createIndex('userId', 'userId', { unique: false })
      }
    }
  })
}

/**
 * Get all notes from IndexedDB for a specific user
 * @param {string} userId - User ID to filter notes (optional for backward compatibility)
 */
export async function getNotesFromDB(userId = null) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readonly')
    const store = transaction.objectStore(NOTES_STORE)
    
    // If userId provided, use index to filter
    if (userId) {
      const index = store.index('userId')
      const request = index.getAll(userId)
      
      request.onsuccess = () => {
        resolve(request.result || [])
      }
      
      request.onerror = () => {
        logger.error('IndexedDB', 'Failed to get notes from IndexedDB', request.error)
        reject(request.error)
      }
    } else {
      // Backward compatibility: get all notes
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        logger.error('IndexedDB', 'Failed to get notes from IndexedDB', request.error)
        reject(request.error)
      }
    }
  })
}

/**
 * Save notes to IndexedDB for a specific user
 * @param {Array} notes - Notes to save
 * @param {string} userId - User ID (optional, will clear only user's notes if provided)
 */
export async function saveNotesToDB(notes, userId = null) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)

    if (userId) {
      // Clear only this user's notes first
      const index = store.index('userId')
      const cursorRequest = index.openCursor(userId)
      
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        }
      }
    } else {
      // Clear all notes (backward compatibility)
      store.clear()
    }

    // Add all notes after clearing
    transaction.oncomplete = async () => {
      const addTransaction = db.transaction([NOTES_STORE], 'readwrite')
      const addStore = addTransaction.objectStore(NOTES_STORE)
      
      notes.forEach(note => {
        // Ensure userId is set on each note
        addStore.put({ ...note, userId: note.userId || userId })
      })

      addTransaction.oncomplete = () => resolve()
      addTransaction.onerror = () => {
        logger.error('IndexedDB', 'Failed to save notes to IndexedDB', addTransaction.error)
        reject(addTransaction.error)
      }
    }

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear notes from IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}

/**
 * Save single note to IndexedDB
 */
export async function saveNoteToDB(note) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)
    const request = store.put(note)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to save note to IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Delete note from IndexedDB
 */
export async function deleteNoteFromDB(noteId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)
    const request = store.delete(noteId)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to delete note from IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Clear all notes from IndexedDB
 * @param {string} userId - User ID (optional, if provided only clears user's notes)
 */
export async function clearNotesDB(userId = null) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)
    
    if (userId) {
      // Clear only this user's notes
      const index = store.index('userId')
      const cursorRequest = index.openCursor(userId)
      
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        }
      }
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => {
        logger.error('IndexedDB', 'Failed to clear notes from IndexedDB', transaction.error)
        reject(transaction.error)
      }
    } else {
      // Clear all notes
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        logger.error('IndexedDB', 'Failed to clear notes from IndexedDB', request.error)
        reject(request.error)
      }
    }
  })
}

/**
 * Clear ALL user data from IndexedDB (for logout)
 * Clears notes, conversations, messages, and sync queue for a specific user
 * @param {string} userId - User ID
 */
export async function clearAllUserData(userId) {
  if (!userId) {
    logger.warn('IndexedDB', 'clearAllUserData called without userId')
    return
  }
  
  if (!db) await initDB()
  
  try {
    // Clear notes for this user
    await clearNotesDB(userId)
    
    // Clear conversations for this user
    await clearConversationsDB(userId)
    
    // Clear messages for this user
    await clearMessagesDB(userId)
    
    // Clear sync queue for this user
    await clearSyncQueueForUser(userId)
    
    logger.log('[IndexedDB] Cleared all data for user:', userId)
  } catch (error) {
    logger.error('IndexedDB', 'Failed to clear all user data', error)
    throw error
  }
}

/**
 * Clear messages for a specific user
 * @param {string} userId - User ID
 */
export async function clearMessagesDB(userId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite')
    const store = transaction.objectStore(MESSAGES_STORE)
    const index = store.index('userId')
    const cursorRequest = index.openCursor(userId)

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear messages from IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}

/**
 * Clear sync queue for a specific user
 * @param {string} userId - User ID
 */
export async function clearSyncQueueForUser(userId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const index = store.index('userId')
    const cursorRequest = index.openCursor(userId)

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear sync queue from IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}



// ============================================================================
// CONVERSATIONS (AI Workspace)
// ============================================================================

/**
 * Get all conversations for a user from IndexedDB
 * @param {string} userId - User ID (email or uid)
 */
export async function getConversationsFromDB(userId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readonly')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = () => {
      // Convert date strings back to Date objects
      const conversations = (request.result || []).map(conv => ({
        ...conv,
        created: conv.created ? new Date(conv.created) : new Date(),
        updated: conv.updated ? new Date(conv.updated) : new Date(),
        messages: conv.messages?.map(m => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
        })) || []
      }))
      resolve(conversations)
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to get conversations from IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Save conversations to IndexedDB (replaces all for user)
 * @param {string} userId - User ID
 * @param {Array} conversations - Conversations to save
 */
export async function saveConversationsToDB(userId, conversations) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)

    // Delete existing conversations for this user first
    const index = store.index('userId')
    const cursorRequest = index.openCursor(userId)

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }

    // After deletion, add new conversations
    transaction.oncomplete = async () => {
      // Start new transaction to add
      const addTransaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
      const addStore = addTransaction.objectStore(CONVERSATIONS_STORE)

      conversations.forEach(conv => {
        // Add userId to each conversation for indexing
        addStore.put({ ...conv, userId })
      })

      addTransaction.oncomplete = () => resolve()
      addTransaction.onerror = () => {
        logger.error('IndexedDB', 'Failed to save conversations to IndexedDB', addTransaction.error)
        reject(addTransaction.error)
      }
    }

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear old conversations from IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}

/**
 * Save single conversation to IndexedDB
 * @param {string} userId - User ID
 * @param {Object} conversation - Conversation to save
 */
export async function saveConversationToDB(userId, conversation) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const request = store.put({ ...conversation, userId })

    request.onsuccess = () => resolve()

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to save conversation to IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Delete conversation from IndexedDB
 * @param {string} conversationId - Conversation ID
 */
export async function deleteConversationFromDB(conversationId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const request = store.delete(conversationId)

    request.onsuccess = () => resolve()

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to delete conversation from IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Clear all conversations for a user from IndexedDB
 * @param {string} userId - User ID
 */
export async function clearConversationsDB(userId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const index = store.index('userId')
    const cursorRequest = index.openCursor(userId)

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear conversations from IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}


// ============================================================================
// MESSAGES (Separated from conversations for better sync)
// ============================================================================

/**
 * Get all messages for a conversation from IndexedDB
 * @param {string} conversationId - Conversation ID
 */
export async function getMessagesFromDB(conversationId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readonly')
    const store = transaction.objectStore(MESSAGES_STORE)
    const index = store.index('conversationId')
    const request = index.getAll(conversationId)

    request.onsuccess = () => {
      // Convert date strings back to Date objects and sort by timestamp
      const messages = (request.result || [])
        .map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
      resolve(messages)
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to get messages from IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Save single message to IndexedDB
 * @param {Object} message - Message to save (must have id, conversationId, and optionally userId)
 */
export async function saveMessageToDB(message) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite')
    const store = transaction.objectStore(MESSAGES_STORE)
    const request = store.put({ 
      ...message, 
      syncStatus: message.syncStatus || 'pending'
    })

    request.onsuccess = () => resolve()

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to save message to IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Save multiple messages to IndexedDB
 * @param {string} conversationId - Conversation ID (for reference)
 * @param {Array} messages - Messages to save (each must have id and conversationId)
 */
export async function saveMessagesToDB(conversationId, messages) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite')
    const store = transaction.objectStore(MESSAGES_STORE)

    messages.forEach(msg => {
      store.put({ 
        ...msg, 
        conversationId: msg.conversationId || conversationId,
        syncStatus: msg.syncStatus || 'synced'
      })
    })

    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to save messages to IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}

/**
 * Delete message from IndexedDB
 * @param {string} messageId - Message ID
 */
export async function deleteMessageFromDB(messageId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite')
    const store = transaction.objectStore(MESSAGES_STORE)
    const request = store.delete(messageId)

    request.onsuccess = () => resolve()

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to delete message from IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Delete all messages for a conversation from IndexedDB
 * @param {string} conversationId - Conversation ID
 */
export async function deleteMessagesForConversation(conversationId) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite')
    const store = transaction.objectStore(MESSAGES_STORE)
    const index = store.index('conversationId')
    const cursorRequest = index.openCursor(conversationId)

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to delete messages from IndexedDB', transaction.error)
      reject(transaction.error)
    }
  })
}

// ============================================================================
// SYNC QUEUE (For offline-first sync)
// ============================================================================

/**
 * Sync status enum
 */
export const SyncStatus = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  ERROR: 'error'
}

/**
 * Sync operation enum
 */
export const SyncOperation = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
}

/**
 * Add item to sync queue
 * @param {Object} item - Sync queue item
 * @param {string} item.entityType - 'note' | 'conversation' | 'message'
 * @param {string} item.entityId - ID of the entity
 * @param {string} item.operation - 'create' | 'update' | 'delete'
 * @param {Object} item.data - Entity data (for create/update)
 * @param {string} item.userId - User ID
 */
export async function addToSyncQueue(item) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    
    const queueItem = {
      ...item,
      timestamp: new Date().toISOString(),
      status: SyncStatus.PENDING,
      retryCount: 0
    }
    
    const request = store.add(queueItem)

    request.onsuccess = () => resolve(request.result)

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to add to sync queue', request.error)
      reject(request.error)
    }
  })
}

/**
 * Get pending items from sync queue
 * @param {string} userId - User ID (optional, filter by user)
 */
export async function getPendingSyncItems(userId = null) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const index = store.index('status')
    const request = index.getAll(SyncStatus.PENDING)

    request.onsuccess = () => {
      let items = request.result || []
      if (userId) {
        items = items.filter(item => item.userId === userId)
      }
      // Sort by timestamp (oldest first)
      items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      resolve(items)
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to get pending sync items', request.error)
      reject(request.error)
    }
  })
}

/**
 * Update sync queue item status
 * @param {number} id - Queue item ID
 * @param {string} status - New status
 * @param {string} error - Error message (optional)
 */
export async function updateSyncQueueItem(id, status, error = null) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (!item) {
        resolve(null)
        return
      }

      const updatedItem = {
        ...item,
        status,
        lastError: error,
        lastAttempt: new Date().toISOString(),
        retryCount: status === SyncStatus.ERROR ? (item.retryCount || 0) + 1 : item.retryCount
      }

      const putRequest = store.put(updatedItem)
      putRequest.onsuccess = () => resolve(updatedItem)
      putRequest.onerror = () => reject(putRequest.error)
    }

    getRequest.onerror = () => {
      logger.error('IndexedDB', 'Failed to update sync queue item', getRequest.error)
      reject(getRequest.error)
    }
  })
}

/**
 * Remove item from sync queue
 * @param {number} id - Queue item ID
 */
export async function removeSyncQueueItem(id) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to remove sync queue item', request.error)
      reject(request.error)
    }
  })
}

/**
 * Clear all synced items from queue
 */
export async function clearSyncedItems() {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const index = store.index('status')
    const cursorRequest = index.openCursor(SyncStatus.SYNCED)

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear synced items', transaction.error)
      reject(transaction.error)
    }
  })
}

/**
 * Get sync queue count by status
 */
export async function getSyncQueueStats() {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = request.result || []
      const stats = {
        total: items.length,
        pending: items.filter(i => i.status === SyncStatus.PENDING).length,
        syncing: items.filter(i => i.status === SyncStatus.SYNCING).length,
        error: items.filter(i => i.status === SyncStatus.ERROR).length,
        synced: items.filter(i => i.status === SyncStatus.SYNCED).length
      }
      resolve(stats)
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to get sync queue stats', request.error)
      reject(request.error)
    }
  })
}

// ============================================================================
// SYNC STATUS HELPERS
// ============================================================================

/**
 * Update sync status for a note
 * @param {string} noteId - Note ID
 * @param {string} syncStatus - Sync status
 */
export async function updateNoteSyncStatus(noteId, syncStatus) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)
    const getRequest = store.get(noteId)

    getRequest.onsuccess = () => {
      const note = getRequest.result
      if (!note) {
        resolve(null)
        return
      }

      const updatedNote = { ...note, syncStatus }
      const putRequest = store.put(updatedNote)
      putRequest.onsuccess = () => resolve(updatedNote)
      putRequest.onerror = () => reject(putRequest.error)
    }

    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Update sync status for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} syncStatus - Sync status
 */
export async function updateConversationSyncStatus(conversationId, syncStatus) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const getRequest = store.get(conversationId)

    getRequest.onsuccess = () => {
      const conv = getRequest.result
      if (!conv) {
        resolve(null)
        return
      }

      const updatedConv = { ...conv, syncStatus }
      const putRequest = store.put(updatedConv)
      putRequest.onsuccess = () => resolve(updatedConv)
      putRequest.onerror = () => reject(putRequest.error)
    }

    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Get items with pending sync status
 * @param {string} storeName - Store name ('notes' | 'conversations' | 'messages')
 */
export async function getPendingSyncItems_Store(storeName) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index('syncStatus')
    const request = index.getAll(SyncStatus.PENDING)

    request.onsuccess = () => resolve(request.result || [])

    request.onerror = () => {
      logger.error('IndexedDB', `Failed to get pending items from ${storeName}`, request.error)
      reject(request.error)
    }
  })
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  initDB,
  // Notes
  getNotesFromDB,
  saveNotesToDB,
  saveNoteToDB,
  deleteNoteFromDB,
  clearNotesDB,
  updateNoteSyncStatus,
  // Conversations
  getConversationsFromDB,
  saveConversationsToDB,
  saveConversationToDB,
  deleteConversationFromDB,
  clearConversationsDB,
  updateConversationSyncStatus,
  // Messages
  getMessagesFromDB,
  saveMessageToDB,
  saveMessagesToDB,
  deleteMessageFromDB,
  deleteMessagesForConversation,
  clearMessagesDB,
  // Sync Queue
  addToSyncQueue,
  getPendingSyncItems,
  updateSyncQueueItem,
  removeSyncQueueItem,
  clearSyncedItems,
  getSyncQueueStats,
  getPendingSyncItems_Store,
  clearSyncQueueForUser,
  // User Data Management
  clearAllUserData,
  // Constants
  SyncStatus,
  SyncOperation
}
