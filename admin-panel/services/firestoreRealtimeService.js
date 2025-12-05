/**
 * Firestore Realtime Service for Admin Panel
 * Direct Firestore listeners for instant updates (replaces SSE)
 * 
 * Listens to:
 * - users collection (for stats)
 * - support_tickets collection
 * - voice_profiles collection
 * - notifications collection
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getCountFromServer,
  Timestamp 
} from 'firebase/firestore'
import { getDb, initializeFirebase } from '@/lib/firebase'

class FirestoreRealtimeService {
  constructor() {
    this.listeners = new Map()
    this.unsubscribers = new Map()
    this.isInitialized = false
    this.retryAttempts = new Map()
    this.maxRetries = 3
    this.statsRefreshInterval = null
    this.STATS_REFRESH_MS = 60000 // Refresh stats every 60s instead of on every change
  }

  /**
   * Initialize realtime listeners for admin
   */
  init() {
    if (this.isInitialized) {
      return true
    }

    return this._doInit()
  }

  _doInit() {
    // Initialize Firebase first
    initializeFirebase()
    
    const db = getDb()
    if (!db) {
      console.warn('[FirestoreRealtime] Firestore not available, using API fallback')
      return false
    }

    console.log('[FirestoreRealtime] Initializing admin listeners...')

    // Use periodic refresh for stats instead of full collection listeners
    this._setupStatsRefresh()
    this._setupSupportListener(db)
    this._setupUsersListener(db)
    this._setupOrdersListener(db)
    
    this.isInitialized = true
    return true
  }

  /**
   * Setup listener with retry logic
   */
  _setupWithRetry(key, setupFn) {
    const attempt = () => {
      try {
        setupFn()
        this.retryAttempts.set(key, 0)
      } catch (error) {
        const attempts = this.retryAttempts.get(key) || 0
        if (attempts < this.maxRetries) {
          this.retryAttempts.set(key, attempts + 1)
          const delay = 1000 * Math.pow(2, attempts)
          console.warn(`[FirestoreRealtime] Retrying ${key} in ${delay}ms (attempt ${attempts + 1})`)
          setTimeout(attempt, delay)
        } else {
          console.error(`[FirestoreRealtime] Max retries reached for ${key}`)
        }
      }
    }
    attempt()
  }

  /**
   * Handle listener errors with retry
   */
  _handleListenerError(key, error) {
    const attempts = this.retryAttempts.get(key) || 0
    if (attempts < this.maxRetries && error.code !== 'permission-denied') {
      this.retryAttempts.set(key, attempts + 1)
      const delay = 1000 * Math.pow(2, attempts)
      console.warn(`[FirestoreRealtime] Will retry ${key} in ${delay}ms`)
      
      // Cleanup old listener
      const unsub = this.unsubscribers.get(key)
      if (unsub) {
        try { unsub() } catch (e) { /* ignore */ }
        this.unsubscribers.delete(key)
      }
      
      // Retry after delay
      setTimeout(() => {
        const db = getDb()
        if (db) {
          this._retryListener(key, db)
        }
      }, delay)
    }
  }

  /**
   * Retry specific listener
   */
  _retryListener(key, db) {
    switch (key) {
      case 'support':
        this._setupSupportListener(db)
        break
      case 'usersRecent':
        this._setupUsersListener(db)
        break
      case 'ordersRecent':
        this._setupOrdersListener(db)
        break
    }
  }

  /**
   * Setup periodic stats refresh instead of full collection listeners
   * This is more efficient for large collections
   */
  _setupStatsRefresh() {
    // Initial fetch
    this._fetchAndNotifyStats()
    
    // Periodic refresh instead of listening to entire collections
    this.statsRefreshInterval = setInterval(() => {
      this._fetchAndNotifyStats()
    }, this.STATS_REFRESH_MS)
  }

  /**
   * Setup listener for support tickets
   */
  _setupSupportListener(db) {
    this._setupWithRetry('support', () => {
      const supportRef = collection(db, 'support_tickets')
      const q = query(
        supportRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tickets = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt
          }
        })

        // Calculate statistics
        const stats = {
          total: tickets.length,
          open: tickets.filter(t => t.status === 'open').length,
          inProgress: tickets.filter(t => t.status === 'in_progress').length,
          resolved: tickets.filter(t => t.status === 'resolved').length
        }

        this._notify('support', {
          type: 'support_update',
          tickets,
          statistics: stats,
          timestamp: new Date().toISOString()
        })
      }, (error) => {
        console.error('[FirestoreRealtime] Support listener error:', error)
        this._handleListenerError('support', error)
      })

      this.unsubscribers.set('support', unsubscribe)
    })
  }

  /**
   * Setup listener for new users (recent registrations)
   */
  _setupUsersListener(db) {
    this._setupWithRetry('usersRecent', () => {
      // Listen to recent users (last 24 hours) for new registration alerts
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      
      const usersRef = collection(db, 'users')
      const q = query(
        usersRef,
        where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const docData = change.doc.data()
            
            let createdAt = docData.createdAt
            if (createdAt instanceof Timestamp) {
              createdAt = createdAt.toDate().toISOString()
            }
            
            const user = {
              id: change.doc.id,
              ...docData,
              createdAt
            }
            
            console.log('[FirestoreRealtime] New user registered:', user.email || user.id)
            this._notify('users', {
              type: 'user_created',
              user,
              timestamp: new Date().toISOString()
            })
          }
        })
      }, (error) => {
        console.error('[FirestoreRealtime] Users listener error:', error)
        this._handleListenerError('usersRecent', error)
      })

      this.unsubscribers.set('usersRecent', unsubscribe)
    })
  }

  /**
   * Setup listener for new orders (purchases)
   */
  _setupOrdersListener(db) {
    this._setupWithRetry('ordersRecent', () => {
      // Listen to recent orders for purchase alerts
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      
      const ordersRef = collection(db, 'orders')
      const q = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const docData = change.doc.data()
            
            let createdAt = docData.createdAt
            if (createdAt instanceof Timestamp) {
              createdAt = createdAt.toDate().toISOString()
            }
            
            const order = {
              id: change.doc.id,
              ...docData,
              createdAt
            }
            
            console.log('[FirestoreRealtime] New order:', order.id, order.productName)
            this._notify('orders', {
              type: 'order_created',
              order,
              timestamp: new Date().toISOString()
            })
          }
        })
      }, (error) => {
        console.error('[FirestoreRealtime] Orders listener error:', error)
        this._handleListenerError('ordersRecent', error)
      })

      this.unsubscribers.set('ordersRecent', unsubscribe)
    })
  }

  /**
   * Fetch current stats and notify listeners
   */
  async _fetchAndNotifyStats() {
    const db = getDb()
    if (!db) return

    try {
      const [usersSnapshot, profilesSnapshot, notificationsSnapshot] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'voice_profiles')),
        getCountFromServer(collection(db, 'notifications'))
      ])

      // Get new users in last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const newUsersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
      )
      const newUsersSnapshot = await getCountFromServer(newUsersQuery)

      const stats = {
        totalUsers: usersSnapshot.data().count,
        totalProfiles: profilesSnapshot.data().count,
        totalNotifications: notificationsSnapshot.data().count,
        newUsers: newUsersSnapshot.data().count,
        timestamp: new Date().toISOString()
      }

      this._notify('stats', {
        type: 'stats_update',
        stats
      })
    } catch (error) {
      console.error('[FirestoreRealtime] Error fetching stats:', error)
    }
  }

  /**
   * Subscribe to event type
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)

    return () => {
      const callbacks = this.listeners.get(eventType)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  /**
   * Notify listeners
   */
  _notify(eventType, data) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data)
        } catch (e) {
          console.error('[FirestoreRealtime] Callback error:', e)
        }
      })
    }
  }

  /**
   * Check if initialized
   */
  isConnected() {
    return this.isInitialized
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.unsubscribers.forEach((unsubscribe, key) => {
      try {
        unsubscribe()
      } catch (e) {
        console.warn('[FirestoreRealtime] Cleanup error for', key, e)
      }
    })
    this.unsubscribers.clear()
    this.listeners.clear()
    this.retryAttempts.clear()
    
    // Clear stats refresh interval
    if (this.statsRefreshInterval) {
      clearInterval(this.statsRefreshInterval)
      this.statsRefreshInterval = null
    }
    
    this.isInitialized = false
    console.log('[FirestoreRealtime] Admin listeners cleaned up')
  }

  /**
   * Force refresh stats immediately
   */
  refreshStats() {
    this._fetchAndNotifyStats()
  }
}

// Singleton instance
const firestoreRealtimeService = new FirestoreRealtimeService()

export default firestoreRealtimeService
export { firestoreRealtimeService }
