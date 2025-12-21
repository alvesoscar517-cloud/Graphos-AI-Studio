/**
 * Sync Service
 * 
 * Handles offline-first sync between IndexedDB and Firestore.
 * - Queue management with debounce
 * - Retry logic with exponential backoff
 * - Conflict resolution (last write wins)
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.6, 12.1, 12.2
 */

import { logger } from '../utils/logger'
import {
  addToSyncQueue,
  getPendingSyncItems,
  updateSyncQueueItem,
  removeSyncQueueItem,
  clearSyncedItems,
  getSyncQueueStats,
  SyncStatus as IDBSyncStatus,
  SyncOperation as IDBSyncOperation,
  saveNoteToDB,
  saveConversationToDB,
  saveMessageToDB,
  deleteNoteFromDB,
  deleteConversationFromDB,
  deleteMessageFromDB,
  updateNoteSyncStatus,
  updateConversationSyncStatus
} from './indexedDB'

// Re-export for external use
export const SyncStatus = IDBSyncStatus
export const SyncOperation = IDBSyncOperation
import {
  saveNote as saveNoteToFirestore,
  deleteNote as deleteNoteFromFirestore,
  saveConversation as saveConversationToFirestore,
  deleteConversation as deleteConversationFromFirestore,
  saveMessage as saveMessageToFirestore,
  deleteMessage as deleteMessageFromFirestore
} from './firestoreDataService'

// Sync configuration
const SYNC_CONFIG = {
  DEBOUNCE_MS: 1000,
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 5000, 15000], // Exponential backoff
  BATCH_SIZE: 10
}

// Sync state
let syncInProgress = false
let syncTimer = null
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
let syncListeners = []

/**
 * Initialize sync service
 */
export function initSyncService() {
  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    isOnline = navigator.onLine
  }
  
  logger.log('[SyncService] Initialized, online:', isOnline)
}

/**
 * Cleanup sync service
 */
export function cleanupSyncService() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
  
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
}

/**
 * Handle coming online
 */
function handleOnline() {
  logger.log('[SyncService] Online')
  isOnline = true
  notifyListeners({ type: 'online' })
  
  // Trigger sync when coming online
  triggerSync()
}

/**
 * Handle going offline
 */
function handleOffline() {
  logger.log('[SyncService] Offline')
  isOnline = false
  notifyListeners({ type: 'offline' })
}

/**
 * Subscribe to sync events
 * @param {Function} listener - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeSyncEvents(listener) {
  syncListeners.push(listener)
  return () => {
    syncListeners = syncListeners.filter(l => l !== listener)
  }
}

/**
 * Notify all listeners
 */
function notifyListeners(event) {
  syncListeners.forEach(listener => {
    try {
      listener(event)
    } catch (e) {
      logger.error('SyncService', 'Listener error', e)
    }
  })
}

/**
 * Check if online
 */
export function isNetworkOnline() {
  return isOnline
}

/**
 * Get number of pending sync items
 */
export async function getSyncQueueLength() {
  try {
    const stats = await getSyncQueueStats()
    return stats.pending || 0
  } catch (e) {
    logger.error('SyncService', 'Failed to get queue length', e)
    return 0
  }
}

/**
 * Queue a sync operation (debounced)
 * @param {Object} params - Sync parameters
 * @param {string} params.entityType - 'note' | 'conversation' | 'message'
 * @param {string} params.entityId - Entity ID
 * @param {string} params.operation - 'create' | 'update' | 'delete'
 * @param {Object} params.data - Entity data
 * @param {string} params.userId - User ID
 */
export async function queueSync(params) {
  const { entityType, entityId, operation, data, userId } = params
  
  try {
    // Add to sync queue
    await addToSyncQueue({
      entityType,
      entityId,
      operation,
      data,
      userId
    })
    
    logger.log('[SyncService] Queued:', operation, entityType, entityId)
    
    // Trigger debounced sync
    debouncedSync()
    
    notifyListeners({ type: 'queued', entityType, entityId, operation })
  } catch (error) {
    logger.error('SyncService', 'Failed to queue sync', error)
    throw error
  }
}

/**
 * Debounced sync trigger
 */
function debouncedSync() {
  if (syncTimer) {
    clearTimeout(syncTimer)
  }
  
  syncTimer = setTimeout(() => {
    triggerSync()
  }, SYNC_CONFIG.DEBOUNCE_MS)
}

/**
 * Trigger sync process
 */
export async function triggerSync(userId = null) {
  if (!isOnline) {
    logger.log('[SyncService] Offline, skipping sync')
    return { success: false, reason: 'offline' }
  }
  
  if (syncInProgress) {
    logger.log('[SyncService] Sync already in progress')
    return { success: false, reason: 'in_progress' }
  }
  
  syncInProgress = true
  notifyListeners({ type: 'sync_start' })
  
  try {
    const pendingItems = await getPendingSyncItems(userId)
    
    if (pendingItems.length === 0) {
      logger.log('[SyncService] No pending items')
      return { success: true, synced: 0 }
    }
    
    logger.log('[SyncService] Processing', pendingItems.length, 'items')
    
    let syncedCount = 0
    let errorCount = 0
    
    // Process in batches
    for (let i = 0; i < pendingItems.length; i += SYNC_CONFIG.BATCH_SIZE) {
      const batch = pendingItems.slice(i, i + SYNC_CONFIG.BATCH_SIZE)
      
      for (const item of batch) {
        try {
          await processSyncItem(item)
          await removeSyncQueueItem(item.id)
          syncedCount++
          
          notifyListeners({ 
            type: 'item_synced', 
            entityType: item.entityType, 
            entityId: item.entityId 
          })
        } catch (error) {
          errorCount++
          
          // Update retry count
          if (item.retryCount < SYNC_CONFIG.MAX_RETRIES) {
            await updateSyncQueueItem(item.id, IDBSyncStatus.ERROR, error.message)
          } else {
            // Max retries reached, mark as failed
            logger.error('SyncService', 'Max retries reached for item', item.id)
            await updateSyncQueueItem(item.id, IDBSyncStatus.ERROR, 'Max retries reached: ' + error.message)
          }
          
          notifyListeners({ 
            type: 'item_error', 
            entityType: item.entityType, 
            entityId: item.entityId,
            error: error.message
          })
        }
      }
    }
    
    // Clean up synced items
    await clearSyncedItems()
    
    logger.log('[SyncService] Sync complete:', syncedCount, 'synced,', errorCount, 'errors')
    
    notifyListeners({ type: 'sync_complete', synced: syncedCount, errors: errorCount })
    
    return { success: true, synced: syncedCount, errors: errorCount }
  } catch (error) {
    logger.error('SyncService', 'Sync failed', error)
    notifyListeners({ type: 'sync_error', error: error.message })
    return { success: false, error: error.message }
  } finally {
    syncInProgress = false
  }
}

/**
 * Process a single sync item
 */
async function processSyncItem(item) {
  const { entityType, entityId, operation, data, userId } = item
  
  logger.log('[SyncService] Processing:', operation, entityType, entityId)
  
  switch (entityType) {
    case 'note':
      await processNoteSync(operation, entityId, data, userId)
      break
    case 'conversation':
      await processConversationSync(operation, entityId, data, userId)
      break
    case 'message':
      await processMessageSync(operation, entityId, data, userId)
      break
    default:
      throw new Error(`Unknown entity type: ${entityType}`)
  }
}

/**
 * Process note sync
 */
async function processNoteSync(operation, noteId, data, userId) {
  switch (operation) {
    case IDBSyncOperation.CREATE:
    case IDBSyncOperation.UPDATE:
      await saveNoteToFirestore(userId, { ...data, id: noteId })
      await updateNoteSyncStatus(noteId, IDBSyncStatus.SYNCED)
      break
    case IDBSyncOperation.DELETE:
      await deleteNoteFromFirestore(userId, noteId)
      break
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Process conversation sync
 */
async function processConversationSync(operation, convId, data, userId) {
  switch (operation) {
    case IDBSyncOperation.CREATE:
    case IDBSyncOperation.UPDATE:
      await saveConversationToFirestore(userId, { ...data, id: convId })
      await updateConversationSyncStatus(convId, IDBSyncStatus.SYNCED)
      break
    case IDBSyncOperation.DELETE:
      await deleteConversationFromFirestore(userId, convId)
      break
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Process message sync
 */
async function processMessageSync(operation, msgId, data, userId) {
  switch (operation) {
    case IDBSyncOperation.CREATE:
    case IDBSyncOperation.UPDATE:
      await saveMessageToFirestore(userId, data.conversationId, { ...data, id: msgId })
      break
    case IDBSyncOperation.DELETE:
      await deleteMessageFromFirestore(userId, msgId)
      break
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus() {
  const stats = await getSyncQueueStats()
  
  return {
    isOnline,
    isSyncing: syncInProgress,
    pendingCount: stats.pending,
    errorCount: stats.error,
    ...stats
  }
}

/**
 * Force retry failed items
 */
export async function retryFailedItems(userId = null) {
  const firestore = await import('./indexedDB')
  const db = firestore.default
  
  // Get all error items and reset their status to pending
  const pendingItems = await getPendingSyncItems(userId)
  const errorItems = pendingItems.filter(item => item.status === IDBSyncStatus.ERROR)
  
  for (const item of errorItems) {
    if (item.retryCount < SYNC_CONFIG.MAX_RETRIES) {
      await updateSyncQueueItem(item.id, IDBSyncStatus.PENDING, null)
    }
  }
  
  // Trigger sync
  return triggerSync(userId)
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  initSyncService,
  cleanupSyncService,
  subscribeSyncEvents,
  isNetworkOnline,
  getSyncQueueLength,
  queueSync,
  triggerSync,
  getSyncStatus,
  retryFailedItems,
  SyncStatus,
  SyncOperation
}
