/**
 * React Hooks for RxDB
 * 
 * Provides reactive data access with automatic updates
 */

import { useState, useEffect, useCallback } from 'react'
import { getDatabase, setupFirestoreSync, stopFirestoreSync, clearLocalData } from '../database'
import { logger } from '../../utils/logger'

/**
 * Hook to get database instance
 * Returns null db if initialization fails (graceful degradation)
 */
export function useDatabase() {
  const [db, setDb] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    
    getDatabase()
      .then(database => {
        if (mounted) {
          setDb(database)
          setLoading(false)
        }
      })
      .catch(err => {
        if (mounted) {
          logger.error('RxDB', 'Database initialization failed:', err)
          setError(err)
          setLoading(false)
          // Don't throw - allow app to continue with degraded functionality
        }
      })

    return () => { mounted = false }
  }, [])

  return { db, loading, error }
}

/**
 * Hook to setup sync when user logs in
 */
export function useRxDBSync(userId) {
  useEffect(() => {
    if (userId) {
      setupFirestoreSync(userId)
    } else {
      stopFirestoreSync()
    }

    return () => {
      // Don't stop sync on unmount, only on logout
    }
  }, [userId])
}

/**
 * Generic hook for RxDB collection queries
 * @param {string} collectionName - Name of the collection
 * @param {Object} queryOptions - Query options
 */
export function useRxCollection(collectionName, queryOptions = {}) {
  const { db, loading: dbLoading, error: dbError } = useDatabase()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { selector = {}, sort, limit: queryLimit } = queryOptions

  useEffect(() => {
    // If database failed to initialize, return empty results
    if (dbError) {
      setDocuments([])
      setLoading(false)
      setError(dbError)
      return
    }
    
    if (!db || dbLoading) return

    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      setDocuments([])
      setLoading(false)
      return
    }

    // Skip query if selector has null/undefined userId (user not logged in)
    if (selector.userId === null || selector.userId === undefined) {
      setDocuments([])
      setLoading(false)
      return
    }

    let query = collection.find({ selector })
    
    if (sort) {
      query = query.sort(sort)
    }
    
    if (queryLimit) {
      query = query.limit(queryLimit)
    }

    const subscription = query.$.subscribe({
      next: docs => {
        setDocuments(docs.map(d => d.toJSON()))
        setLoading(false)
      },
      error: err => {
        logger.error('RxDB', `Query error in ${collectionName}:`, err)
        setError(err)
        setDocuments([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [db, dbLoading, dbError, collectionName, JSON.stringify(selector), JSON.stringify(sort), queryLimit])

  return { documents, loading: loading || dbLoading, error: error || dbError }
}

/**
 * Hook for single document by ID
 */
export function useRxDocument(collectionName, documentId) {
  const { db, loading: dbLoading, error: dbError } = useDatabase()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If database failed to initialize, return null
    if (dbError) {
      setDocument(null)
      setLoading(false)
      setError(dbError)
      return
    }
    
    if (!db || dbLoading || !documentId) {
      setLoading(false)
      return
    }

    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      setDocument(null)
      setLoading(false)
      return
    }

    const subscription = collection.findOne(documentId).$.subscribe({
      next: doc => {
        setDocument(doc ? doc.toJSON() : null)
        setLoading(false)
      },
      error: err => {
        logger.error('RxDB', `Document query error:`, err)
        setError(err)
        setDocument(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [db, dbLoading, dbError, collectionName, documentId])

  return { document, loading: loading || dbLoading, error: error || dbError }
}

/**
 * Hook for CRUD operations on a collection
 * Returns no-op functions if database is not available
 */
export function useRxMutations(collectionName) {
  const { db, error: dbError } = useDatabase()

  const insert = useCallback(async (data) => {
    if (!db) {
      logger.warn('RxDB', 'Database not ready, cannot insert')
      return null
    }
    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      return null
    }
    
    const doc = {
      ...data,
      id: data.id || `${collectionName.slice(0, -1)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: data.created || new Date().toISOString(),
      updated: new Date().toISOString()
    }
    
    return await collection.insert(doc)
  }, [db, collectionName])

  const update = useCallback(async (id, data) => {
    if (!db) {
      logger.warn('RxDB', 'Database not ready, cannot update')
      return null
    }
    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      return null
    }
    
    const doc = await collection.findOne(id).exec()
    if (!doc) {
      logger.warn('RxDB', 'Document not found:', id)
      return null
    }
    
    return await doc.patch({
      ...data,
      updated: new Date().toISOString()
    })
  }, [db, collectionName])

  const upsert = useCallback(async (data) => {
    if (!db) {
      logger.warn('RxDB', 'Database not ready, cannot upsert')
      return null
    }
    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      return null
    }
    
    const doc = {
      ...data,
      id: data.id || `${collectionName.slice(0, -1)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: data.created || new Date().toISOString(),
      updated: new Date().toISOString()
    }
    
    return await collection.upsert(doc)
  }, [db, collectionName])

  const remove = useCallback(async (id) => {
    if (!db) {
      logger.warn('RxDB', 'Database not ready, cannot remove')
      return null
    }
    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      return null
    }
    
    const doc = await collection.findOne(id).exec()
    if (doc) {
      return await doc.remove()
    }
    return null
  }, [db, collectionName])

  const bulkInsert = useCallback(async (docs) => {
    if (!db) {
      logger.warn('RxDB', 'Database not ready, cannot bulk insert')
      return null
    }
    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      return null
    }
    
    const docsWithMeta = docs.map(data => ({
      ...data,
      id: data.id || `${collectionName.slice(0, -1)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: data.created || new Date().toISOString(),
      updated: new Date().toISOString()
    }))
    
    return await collection.bulkInsert(docsWithMeta)
  }, [db, collectionName])

  const bulkRemove = useCallback(async (ids) => {
    if (!db) {
      logger.warn('RxDB', 'Database not ready, cannot bulk remove')
      return null
    }
    const collection = db[collectionName]
    if (!collection) {
      logger.warn('RxDB', `Collection ${collectionName} not found`)
      return null
    }
    
    return await collection.bulkRemove(ids)
  }, [db, collectionName])

  return { insert, update, upsert, remove, bulkInsert, bulkRemove, dbError }
}

// Export utility functions
export { clearLocalData, setupFirestoreSync, stopFirestoreSync }
