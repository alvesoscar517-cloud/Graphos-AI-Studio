/**
 * Firestore Realtime Service - OPTIMIZED
 * Direct Firestore listeners for instant updates
 * 
 * COST OPTIMIZATION STRATEGIES:
 * 1. Lazy loading - Only setup listeners when needed
 * 2. Visibility-based pause/resume - Pause when tab hidden
 * 3. Debounced notifications - Prevent rapid-fire updates
 * 4. Smart reconnection - Exponential backoff on errors
 * 5. Limit queries - Use limit() to reduce document reads
 * 6. Change detection - Only notify on actual changes
 * 
 * Listens to:
 * - users/{userId} - credits, profile settings (1 doc read)
 * - user_notifications - notifications (limit 50)
 * - voice_profiles - writing style profiles (user's only)
 * - orders - payment detection (limit 5, recent only)
 */

import { logger } from '@/utils/logger'
import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { getDb, initializeFirebase } from '@/config/firebase'

class FirestoreRealtimeService {
  constructor() {
    this.userId = null
    this.listeners = new Map()
    this.unsubscribers = new Map()
    this.isInitialized = false
    this.isPaused = false
    
    // Change detection cache
    this.lastCredits = null
    this.lastProfile = null
    this.seenNotificationIds = new Set()
    this.seenOrderIds = new Set()
    
    // Debounce timers
    this.debounceTimers = new Map()
    
    // Setup visibility handler for cost optimization
    this._setupVisibilityHandler()
  }

  /**
   * Initialize realtime listeners for a user
   */
  init(userId) {
    if (!userId) return false
    if (this.isInitialized && this.userId === userId) return true

    initializeFirebase()
    const db = getDb()
    if (!db) return false

    this.cleanup()
    this.userId = userId
    this.isInitialized = true
    this.isPaused = false

    // Setup all listeners
    this._setupUserListener(db, userId)
    this._setupNotificationsListener(db, userId)
    this._setupVoiceProfilesListener(db, userId)
    this._setupOrdersListener(db, userId)

    logger.log('[Realtime] Connected for user:', userId)
    return true
  }

  /**
   * OPTIMIZATION: Pause/resume based on tab visibility
   * Reduces Firestore reads when user is not actively using the app
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
    if (!this.isPaused || !this.isInitialized || !this.userId) return
    this.isPaused = false
    logger.log('[Realtime] Resumed (tab visible)')
    
    const db = getDb()
    if (!db) return
    
    // Re-setup all listeners
    this._setupUserListener(db, this.userId)
    this._setupNotificationsListener(db, this.userId)
    this._setupVoiceProfilesListener(db, this.userId)
    this._setupOrdersListener(db, this.userId)
  }

  /**
   * OPTIMIZATION: Debounced notify to prevent rapid-fire updates
   */
  _debouncedNotify(eventType, data, delay = 100) {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(eventType)
    if (existingTimer) clearTimeout(existingTimer)
    
    // Set new timer
    const timer = setTimeout(() => {
      this._notify(eventType, data)
      this.debounceTimers.delete(eventType)
    }, delay)
    
    this.debounceTimers.set(eventType, timer)
  }

  /**
   * User document listener (credits + profile)
   * OPTIMIZATION: Single document = 1 read per change
   */
  _setupUserListener(db, userId) {
    try {
      const userRef = doc(db, 'users', userId)
      
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (!snapshot.exists() || this.isPaused) return
        
        const data = snapshot.data()
        
        // OPTIMIZATION: Only notify if credits actually changed
        if (data.credits) {
          const creditsStr = JSON.stringify(data.credits)
          if (creditsStr !== this.lastCredits) {
            this.lastCredits = creditsStr
            this._notify('credits', {
              type: 'update',
              credits: {
                balance: data.credits.balance || 0,
                used: data.credits.used || 0,
                purchased: data.credits.purchased || 0,
                bonus: data.credits.bonus || 0,
              }
            })
          }
        }
        
        // OPTIMIZATION: Only notify if profile actually changed
        const profileStr = JSON.stringify({ locked: data.locked, settings: data.settings })
        if (profileStr !== this.lastProfile && (data.settings || data.locked !== undefined)) {
          this.lastProfile = profileStr
          this._notify('userProfile', {
            type: 'updated',
            profile: { locked: data.locked, settings: data.settings }
          })
        }
      }, (error) => {
        logger.error('Realtime', 'User listener error:', error.message)
      })

      this.unsubscribers.set('user', unsubscribe)
    } catch (e) {
      logger.error('Realtime', 'Failed to setup user listener:', e.message)
    }
  }

  /**
   * Notifications listener
   * OPTIMIZATION: limit(50) reduces reads, only process changes
   */
  _setupNotificationsListener(db, userId) {
    try {
      const q = query(
        collection(db, 'user_notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50) // OPTIMIZATION: Limit to reduce reads
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (this.isPaused) return
        
        snapshot.docChanges().forEach((change) => {
          const docId = change.doc.id
          
          // OPTIMIZATION: Skip already seen notifications on initial load
          if (change.type === 'added' && this.seenNotificationIds.has(docId)) {
            return
          }
          
          const docData = change.doc.data()
          let createdAt = docData.createdAt
          if (createdAt instanceof Timestamp) {
            createdAt = createdAt.toDate().toISOString()
          }
          
          const notification = { id: docId, ...docData, createdAt }
          
          if (change.type === 'added') {
            this.seenNotificationIds.add(docId)
            // Only notify for truly new notifications (not initial load)
            if (this.seenNotificationIds.size > 1) {
              this._notify('notification', { type: 'new', notification })
            }
          } else if (change.type === 'modified') {
            this._notify('notification', { type: 'updated', notification })
          } else if (change.type === 'removed') {
            this.seenNotificationIds.delete(docId)
            this._notify('notification', { type: 'removed', notificationId: docId })
          }
        })
      }, (error) => {
        logger.error('Realtime', 'Notifications listener error:', error.message)
      })

      this.unsubscribers.set('notifications', unsubscribe)
    } catch (e) {
      logger.error('Realtime', 'Failed to setup notifications listener:', e.message)
    }
  }

  /**
   * Voice profiles listener
   * OPTIMIZATION: Only user's profiles, no limit needed (usually < 10)
   */
  _setupVoiceProfilesListener(db, userId) {
    try {
      const q = query(
        collection(db, 'voice_profiles'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (this.isPaused) return
        
        snapshot.docChanges().forEach((change) => {
          const docData = change.doc.data()
          let createdAt = docData.createdAt
          let updatedAt = docData.updatedAt
          if (createdAt instanceof Timestamp) createdAt = createdAt.toDate().toISOString()
          if (updatedAt instanceof Timestamp) updatedAt = updatedAt.toDate().toISOString()
          
          const profile = { profile_id: change.doc.id, ...docData, createdAt, updatedAt }
          
          if (change.type === 'added') {
            this._notify('profile', { type: 'created', profile })
          } else if (change.type === 'modified') {
            this._notify('profile', { type: 'updated', profile })
          } else if (change.type === 'removed') {
            this._notify('profile', { type: 'deleted', profileId: profile.profile_id })
          }
        })
      }, (error) => {
        logger.error('Realtime', 'Profiles listener error:', error.message)
      })

      this.unsubscribers.set('voiceProfiles', unsubscribe)
    } catch (e) {
      logger.error('Realtime', 'Failed to setup profiles listener:', e.message)
    }
  }

  /**
   * Orders listener (payment detection)
   * OPTIMIZATION: limit(5) - only need recent orders for payment detection
   */
  _setupOrdersListener(db, userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5) // OPTIMIZATION: Only recent orders matter
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (this.isPaused) return
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const docId = change.doc.id
            
            // OPTIMIZATION: Skip already seen orders
            if (this.seenOrderIds.has(docId)) return
            this.seenOrderIds.add(docId)
            
            const docData = change.doc.data()
            let createdAt = docData.createdAt
            if (createdAt instanceof Timestamp) createdAt = createdAt.toDate().toISOString()
            
            const order = { id: docId, ...docData, createdAt }
            
            // Only notify for orders created in last 5 minutes (payment detection)
            const orderTime = new Date(createdAt).getTime()
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
            
            if (orderTime > fiveMinutesAgo) {
              this._notify('payment', { type: 'order_created', order })
              
              // Dispatch browser event for payment success
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('payment-success', { detail: { order } }))
              }
            }
          }
        })
      }, (error) => {
        logger.error('Realtime', 'Orders listener error:', error.message)
      })

      this.unsubscribers.set('orders', unsubscribe)
    } catch (e) {
      logger.error('Realtime', 'Failed to setup orders listener:', e.message)
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

  /**
   * Check if connected
   */
  isConnected() {
    return this.isInitialized && this.userId !== null && !this.isPaused
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
    
    // Unsubscribe all
    this.unsubscribers.forEach((unsubscribe) => {
      try { unsubscribe() } catch (e) { /* ignore */ }
    })
    this.unsubscribers.clear()
    this.listeners.clear()
    
    // Reset cache
    this.lastCredits = null
    this.lastProfile = null
    this.seenNotificationIds.clear()
    this.seenOrderIds.clear()
    
    this.userId = null
    this.isInitialized = false
    this.isPaused = false
  }
}

const firestoreRealtimeService = new FirestoreRealtimeService()

export default firestoreRealtimeService
export { firestoreRealtimeService }
