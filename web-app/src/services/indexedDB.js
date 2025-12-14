import { logger } from '../utils/logger'
const DB_NAME = 'AIContentAuthenticator'
const DB_VERSION = 2 // Bump version to add conversations store
const NOTES_STORE = 'notes'
const CONVERSATIONS_STORE = 'conversations'

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

      // Create notes store if it doesn't exist
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' })
        notesStore.createIndex('updated', 'updated', { unique: false })
      }

      // Create conversations store if it doesn't exist
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
        const convsStore = db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' })
        convsStore.createIndex('updated', 'updated', { unique: false })
        convsStore.createIndex('userId', 'userId', { unique: false })
      }
    }
  })
}

/**
 * Get all notes from IndexedDB
 */
export async function getNotesFromDB() {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readonly')
    const store = transaction.objectStore(NOTES_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to get notes from IndexedDB', request.error)
      reject(request.error)
    }
  })
}

/**
 * Save notes to IndexedDB
 */
export async function saveNotesToDB(notes) {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)

    // Clear existing notes
    store.clear()

    // Add all notes
    notes.forEach(note => {
      store.put(note)
    })

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      logger.error('IndexedDB', 'Failed to save notes to IndexedDB', transaction.error)
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
 */
export async function clearNotesDB() {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite')
    const store = transaction.objectStore(NOTES_STORE)
    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      logger.error('IndexedDB', 'Failed to clear notes from IndexedDB', request.error)
      reject(request.error)
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
