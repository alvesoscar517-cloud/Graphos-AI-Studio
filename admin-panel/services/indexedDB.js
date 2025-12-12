import logger from '../lib/logger'
const DB_NAME = 'AIContentAuthenticator'
const DB_VERSION = 1
const NOTES_STORE = 'notes'

let db = null

/**
 * Initialize IndexedDB
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('[FAIL] Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      logger.log('[SUCCESS] IndexedDB initialized')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      db = event.target.result

      // Create notes store if it doesn't exist
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' })
        notesStore.createIndex('updated', 'updated', { unique: false })
        logger.log('[SUCCESS] Created notes store')
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
      logger.log('[SUCCESS] Loaded notes from IndexedDB:', request.result.length)
      resolve(request.result)
    }

    request.onerror = () => {
      console.error('[FAIL] Failed to get notes from IndexedDB:', request.error)
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
      logger.log('[SUCCESS] Saved notes to IndexedDB:', notes.length)
      resolve()
    }

    transaction.onerror = () => {
      console.error('[FAIL] Failed to save notes to IndexedDB:', transaction.error)
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
      logger.log('[SUCCESS] Saved note to IndexedDB:', note.title)
      resolve()
    }

    request.onerror = () => {
      console.error('[FAIL] Failed to save note to IndexedDB:', request.error)
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
      logger.log('[SUCCESS] Deleted note from IndexedDB')
      resolve()
    }

    request.onerror = () => {
      console.error('[FAIL] Failed to delete note from IndexedDB:', request.error)
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
      logger.log('[SUCCESS] Cleared notes from IndexedDB')
      resolve()
    }

    request.onerror = () => {
      console.error('[FAIL] Failed to clear notes from IndexedDB:', request.error)
      reject(request.error)
    }
  })
}

