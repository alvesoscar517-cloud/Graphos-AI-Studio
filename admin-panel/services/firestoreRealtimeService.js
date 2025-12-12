/**
 * Firestore Realtime Service for Admin Panel - OPTIMIZED
 * Direct Firestore listeners for instant updates
 * 
 * COST OPTIMIZATION STRATEGIES:
 * 1. Visibility-based pause/resume - Pause when tab hidden
 * 2. Periodic stats refresh - Use getCountFromServer instead of listeners
 * 3. Limited queries - Only recent data (24h) for alerts
 * 4. Debounced notifications - Prevent rapid-fire updates
 * 5. Smart initial load detection - Don't notify for existing data
 * 6. Exponential backoff on errors
 * 
 * Listens to:
 * - support_tickets (limit 50)
 * - users (recent 24h, limit 20)
 * - orders (recent 24h, limit 20)
 * - stats (periodic refresh every 60s)
 */

import logger from '../lib/logger'
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
    this.isPaused = false
    this.retryAttempts = new Map()
    this.maxRetries = 3
    this.statsRefreshInterval = null
    this.STATS_REFRESH_MS = 60000 // Refresh stats every 60s
    
    // Change detection cache
    this.seenUserIds = new Set()
    this.seenOrderIds = new Set()
    this.seenTicketIds = new Set()
    this.lastStats = null
    
    // Debounce timers
    this.debounceTimers = new Map()
    
    // Setup visibility handler
    this._setupVisibilityHandler()
  }

  /**
   * Initialize realtime listeners for admin
   */
  init() {
    if (this.isInitialized) return true
    return this._doInit()
  }

  _doInit() {
    initializeFirebase()
    
    const db = getDb()
    if (!db) {
      console.warn('[Realtime] Firestore not available')
      return false
    }

    logger.log('[Realtime] Initializing admin listeners...')

    this._setupStatsRefresh()
    this._setupSupportListener(db)
    this._setupUsersListener(db)
    this._setupOrdersListener(db)
    
    this.isInitialized = true
    this.isPaused = false
    return true
  }

  /**
   * OPTIMIZATION: Pause/resume based on tab visibility
   */
  _setupVisibilityHandler() {
    if (typeof document === 'undefined') return
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this._pause()
      } else if (document.visibilityState === 'visible') {
        this._resume()
      }
    })
  }

  /**
   * Pause listeners when tab is hidden (cost saving)
   */
  _pause() {
    if (this.isPaused || !this.isInitialized) return
    this.isPaused = true
    logger.log('[Realtime] Paused (tab hidden)')
    
    // Clear stats interval
    if (this.statsRefreshInterval) {
      clearInterval(this.statsRefreshInterval)
      this.statsRefreshInterval = null
    }
    
    // Unsubscribe from all listeners
    this.unsubscribers.forEach((unsubscribe) => {
      try { unsubscribe() } catch (e) { /* ignore */ }
    })
    this.unsubscribers.clear()
  }

  /**
   * Resume listeners when tab is visible
   */
  _resume() {
    if (!this.isPaused || !this.isInitialized) return
    this.isPaused = false
    logger.log('[Realtime] Resumed (tab visible)')
    
    const db = getDb()
    if (!db) return
    
    // Re-setup all listeners
    this._setupStatsRefresh()
    this._setupSupportListener(db)
    this._setupUsersListener(db)
    this._setupOrdersListener(db)
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
          console.warn(`[Realtime] Retrying ${key} in ${delay}ms`)
          setTimeout(attempt, delay)
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
    const permanentErrors = ['permission-denied', 'failed-precondition', 'invalid-argument']
    
    if (permanentErrors.includes(error.code) || error.message?.includes('requires an index')) {
      console.error(`[Realtime] Permanent error for ${key}:`, error.message)
      return
    }
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(key, attempts + 1)
      const delay = 1000 * Math.pow(2, attempts)
      
      const unsub = this.unsubscribers.get(key)
      if (unsub) {
        try { unsub() } catch (e) { /* ignore */ }
        this.unsubscribers.delete(key)
      }
      
      setTimeout(() => {
        const db = getDb()
        if (db && !this.isPaused) this._retryListener(key, db)
      }, delay)
    }
  }

  _retryListener(key, db) {
    switch (key) {
      case 'support': this._setupSupportListener(db); break
      case 'usersRecent': this._setupUsersListener(db); break
      case 'ordersRecent': this._setupOrdersListener(db); break
    }
  }

  /**
   * OPTIMIZATION: Periodic stats refresh instead of full collection listeners
   */
  _setupStatsRefresh() {
    this._fetchAndNotifyStats()
    this.statsRefreshInterval = setInterval(() => {
      if (!this.isPaused) this._fetchAndNotifyStats()
    }, this.STATS_REFRESH_MS)
  }

  /**
   * Support tickets listener
   * OPTIMIZATION: limit(50), change detection
   */
  _setupSupportListener(db) {
    this._setupWithRetry('support', () => {
      const q = query(
        collection(db, 'support_tickets'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (this.isPaused) return
        
        const tickets = []
        let hasNewTicket = false
        
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          const ticket = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt
          }
          tickets.push(ticket)
          
          // Check for new tickets
          if (!this.seenTicketIds.has(doc.id)) {
            this.seenTicketIds.add(doc.id)
            hasNewTicket = true
          }
        })

        const stats = {
          total: tickets.length,
          open: tickets.filter(t => t.status === 'open').length,
          inProgress: tickets.filter(t => t.status === 'in_progress').length,
          resolved: tickets.filter(t => t.status === 'resolved').length
        }

        // Only notify if there are changes
        if (hasNewTicket || this.seenTicketIds.size === 0) {
          this._notify('support', {
            type: 'support_update',
            tickets,
            statistics: stats,
            timestamp: new Date().toISOString()
          })
        }
      }, (error) => {
        console.error('[Realtime] Support listener error:', error)
        this._handleListenerError('support', error)
      })

      this.unsubscribers.set('support', unsubscribe)
    })
  }

  /**
   * Users listener (recent registrations)
   * OPTIMIZATION: Only 24h, limit 20, smart initial load detection
   */
  _setupUsersListener(db) {
    this._setupWithRetry('usersRecent', () => {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      
      const q = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (this.isPaused) return
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const docId = change.doc.id
            
            // Skip already seen users
            if (this.seenUserIds.has(docId)) return
            this.seenUserIds.add(docId)
            
            const docData = change.doc.data()
            let createdAt = docData.createdAt
            if (createdAt instanceof Timestamp) {
              createdAt = createdAt.toDate().toISOString()
            }
            
            // Only notify for users created in last 60 seconds (truly new)
            const userCreatedAt = new Date(createdAt)
            const isRecentlyCreated = (Date.now() - userCreatedAt.getTime()) < 60000
            
            if (isRecentlyCreated) {
              const user = { id: docId, ...docData, createdAt }
              logger.log('[Realtime] New user:', user.email || docId)
              this._notify('users', {
                type: 'user_created',
                user,
                timestamp: new Date().toISOString()
              })
            }
          }
        })
      }, (error) => {
        console.error('[Realtime] Users listener error:', error)
        this._handleListenerError('usersRecent', error)
      })

      this.unsubscribers.set('usersRecent', unsubscribe)
    })
  }

  /**
   * Orders listener (purchases)
   * OPTIMIZATION: Only 24h, limit 20, smart initial load detection
   */
  _setupOrdersListener(db) {
    this._setupWithRetry('ordersRecent', () => {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      
      const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (this.isPaused) return
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const docId = change.doc.id
            
            // Skip already seen orders
            if (this.seenOrderIds.has(docId)) return
            this.seenOrderIds.add(docId)
            
            const docData = change.doc.data()
            let createdAt = docData.createdAt
            if (createdAt instanceof Timestamp) {
              createdAt = createdAt.toDate().toISOString()
            }
            
            // Only notify for orders created in last 60 seconds (truly new)
            const orderCreatedAt = new Date(createdAt)
            const isRecentlyCreated = (Date.now() - orderCreatedAt.getTime()) < 60000
            
            if (isRecentlyCreated) {
              const order = { id: docId, ...docData, createdAt }
              logger.log('[Realtime] New order:', docId, order.productName)
              this._notify('orders', {
                type: 'order_created',
                order,
                timestamp: new Date().toISOString()
              })
            }
          }
        })
      }, (error) => {
        console.error('[Realtime] Orders listener error:', error)
        this._handleListenerError('ordersRecent', error)
      })

      this.unsubscribers.set('ordersRecent', unsubscribe)
    })
  }

  /**
   * Fetch stats using getCountFromServer (cheaper than listeners)
   * OPTIMIZATION: Only notify if stats changed
   */
  async _fetchAndNotifyStats() {
    const db = getDb()
    if (!db || this.isPaused) return

    try {
      const [usersSnapshot, profilesSnapshot, notificationsSnapshot] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'voice_profiles')),
        getCountFromServer(collection(db, 'notifications'))
      ])

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

      // OPTIMIZATION: Only notify if stats changed
      const statsStr = JSON.stringify(stats)
      if (statsStr !== this.lastStats) {
        this.lastStats = statsStr
        this._notify('stats', { type: 'stats_update', stats })
      }
    } catch (error) {
      console.error('[Realtime] Error fetching stats:', error)
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
      if (callbacks) callbacks.delete(callback)
    }
  }

  /**
   * Notify listeners
   */
  _notify(eventType, data) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach(cb => {
        try { cb(data) } catch (e) { /* ignore */ }
      })
    }
  }

  isConnected() {
    return this.isInitialized && !this.isPaused
  }

  cleanup() {
    // Clear timers
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
    
    if (this.statsRefreshInterval) {
      clearInterval(this.statsRefreshInterval)
      this.statsRefreshInterval = null
    }
    
    // Unsubscribe all
    this.unsubscribers.forEach((unsubscribe) => {
      try { unsubscribe() } catch (e) { /* ignore */ }
    })
    this.unsubscribers.clear()
    this.listeners.clear()
    this.retryAttempts.clear()
    
    // Reset cache
    this.seenUserIds.clear()
    this.seenOrderIds.clear()
    this.seenTicketIds.clear()
    this.lastStats = null
    
    this.isInitialized = false
    this.isPaused = false
    logger.log('[Realtime] Admin listeners cleaned up')
  }

  refreshStats() {
    this._fetchAndNotifyStats()
  }
}

const firestoreRealtimeService = new FirestoreRealtimeService()

export default firestoreRealtimeService
export { firestoreRealtimeService }
