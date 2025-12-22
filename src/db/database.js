/**
 * RxDB Database Setup
 * 
 * Offline-first database with Firestore sync
 */

import { createRxDatabase, addRxPlugin } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { replicateFirestore } from 'rxdb/plugins/replication-firestore'
import { collection, where } from 'firebase/firestore'

import { noteSchema, conversationSchema, messageSchema, profileSchema } from './schemas'
import { getDb } from '../config/firebase'
import { logger } from '../utils/logger'

// Add plugins
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBUpdatePlugin)

// Only add dev-mode in development
if (import.meta.env.DEV) {
  import('rxdb/plugins/dev-mode').then(({ RxDBDevModePlugin, disableWarnings }) => {
    addRxPlugin(RxDBDevModePlugin)
    disableWarnings()
  }).catch(() => {
    // Dev mode plugin not available, ignore
  })
}

let dbInstance = null
let replicationStates = {}
let dbPromise = null

/**
 * Get storage with validation wrapper for dev mode
 */
function getStorage() {
  const baseStorage = getRxStorageDexie()
  
  // In development, wrap with validator
  if (import.meta.env.DEV) {
    return wrappedValidateAjvStorage({ storage: baseStorage })
  }
  
  return baseStorage
}

/**
 * Get or create the RxDB database instance
 */
export async function getDatabase() {
  // Return existing instance if valid
  if (dbInstance && dbInstance.notes) return dbInstance
  
  // Reset if instance exists but is invalid
  if (dbInstance && !dbInstance.notes) {
    dbInstance = null
    dbPromise = null
  }
  
  // Return existing promise to prevent multiple creations
  if (dbPromise) return dbPromise

  dbPromise = (async () => {
    try {
      logger.log('[RxDB] Creating database...')
      
      dbInstance = await createRxDatabase({
        name: 'graphos_db',
        storage: getStorage(),
        multiInstance: true,
        eventReduce: true,
        ignoreDuplicate: true
      })

      // Add collections
      await dbInstance.addCollections({
        notes: { schema: noteSchema },
        conversations: { schema: conversationSchema },
        messages: { schema: messageSchema },
        profiles: { schema: profileSchema }
      })

      logger.log('[RxDB] Database created with collections: notes, conversations, messages, profiles')
      
      return dbInstance
    } catch (error) {
      logger.error('RxDB', 'Failed to create database', error)
      
      // If schema mismatch error, delete and retry
      if (error.code === 'DB6' || error.code === 'DB9' || error.code === 'DXE1' || error.code === 'SC34') {
        logger.log('[RxDB] Schema mismatch detected, deleting database...')
        try {
          if (dbInstance && typeof dbInstance.destroy === 'function') {
            await dbInstance.destroy()
          }
          dbInstance = null
          dbPromise = null
          
          // Delete all graphos databases
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name && db.name.includes('graphos')) {
              await new Promise((resolve) => {
                const req = indexedDB.deleteDatabase(db.name)
                req.onsuccess = () => resolve()
                req.onerror = () => resolve()
                req.onblocked = () => resolve()
              })
              logger.log('[RxDB] Deleted database:', db.name)
            }
          }
          
          await new Promise(r => setTimeout(r, 100))
          
          // Retry
          dbInstance = await createRxDatabase({
            name: 'graphos_db',
            storage: getStorage(),
            multiInstance: true,
            eventReduce: true,
            ignoreDuplicate: true
          })

          await dbInstance.addCollections({
            notes: { schema: noteSchema },
            conversations: { schema: conversationSchema },
            messages: { schema: messageSchema },
            profiles: { schema: profileSchema }
          })

          logger.log('[RxDB] Database recreated successfully!')
          return dbInstance
          
        } catch (retryError) {
          logger.error('RxDB', 'Failed to recreate database', retryError)
          dbInstance = null
          dbPromise = null
          return null
        }
      }
      
      dbPromise = null
      return null
    }
  })()

  return dbPromise
}

/**
 * Setup Firestore replication for a user
 * @param {string} userId - Firebase Auth UID
 */
export async function setupFirestoreSync(userId) {
  if (!userId) {
    logger.warn('RxDB', 'Cannot setup sync without userId')
    return
  }

  const db = await getDatabase()
  
  if (!db || !db.notes) {
    logger.warn('RxDB', 'Database not ready, skipping Firestore sync')
    return
  }
  
  // Get the SAME Firestore instance used by the rest of the app
  const firestore = getDb()
  
  if (!firestore) {
    logger.warn('RxDB', 'Firestore not available, running in offline mode')
    return
  }

  // Stop existing replications
  await stopFirestoreSync()

  logger.log(`[RxDB] Setting up Firestore sync for user: ${userId}`)

  try {
    // Helper to create replication for a collection
    const createReplication = (rxCollection, firestoreCollectionName) => {
      const firestoreCollection = collection(firestore, firestoreCollectionName)
      
      return replicateFirestore({
        collection: rxCollection,
        firestore: {
          projectId: 'notes-sync-472107',
          database: firestore,
          collection: firestoreCollection
        },
        pull: {
          filter: [
            where('userId', '==', userId)
          ]
        },
        push: {
          filter: (doc) => doc.userId === userId
        },
        live: true,
        autoStart: true
      })
    }

    // Setup replications
    replicationStates.notes = createReplication(db.notes, 'user_notes')
    replicationStates.conversations = createReplication(db.conversations, 'user_conversations')
    replicationStates.messages = createReplication(db.messages, 'user_messages')
    replicationStates.profiles = createReplication(db.profiles, 'user_profiles')

    // Log replication events
    Object.entries(replicationStates).forEach(([name, state]) => {
      state.error$.subscribe(err => {
        logger.error('RxDB', `Replication error (${name}):`, err)
      })
      
      state.active$.subscribe(active => {
        if (active) {
          logger.log(`[RxDB] ${name} replication active`)
        }
      })
    })

    logger.log('[RxDB] Firestore sync setup complete')
  } catch (error) {
    logger.error('RxDB', 'Failed to setup Firestore sync', error)
  }
}

/**
 * Stop all Firestore replications
 */
export async function stopFirestoreSync() {
  const promises = Object.values(replicationStates).map(state => {
    if (state && typeof state.cancel === 'function') {
      return state.cancel()
    }
    return Promise.resolve()
  })
  
  await Promise.all(promises)
  replicationStates = {}
  logger.log('[RxDB] Firestore sync stopped')
}

/**
 * Get replication state for a collection
 */
export function getReplicationState(collectionName) {
  return replicationStates[collectionName]
}

/**
 * Force sync all collections
 */
export async function forceSyncAll() {
  const promises = Object.values(replicationStates).map(state => {
    if (state && typeof state.reSync === 'function') {
      return state.reSync()
    }
    return Promise.resolve()
  })
  
  await Promise.all(promises)
  logger.log('[RxDB] Force sync triggered')
}

/**
 * Clear all local data (for logout)
 */
export async function clearLocalData() {
  try {
    const db = await getDatabase()
    if (!db) return
    
    await stopFirestoreSync()
    
    // Remove all documents from collections
    if (db.notes) await db.notes.find().remove()
    if (db.conversations) await db.conversations.find().remove()
    if (db.messages) await db.messages.find().remove()
    if (db.profiles) await db.profiles.find().remove()
    
    logger.log('[RxDB] Local data cleared')
  } catch (error) {
    logger.error('RxDB', 'Failed to clear local data', error)
  }
}

export default {
  getDatabase,
  setupFirestoreSync,
  stopFirestoreSync,
  getReplicationState,
  forceSyncAll,
  clearLocalData
}
