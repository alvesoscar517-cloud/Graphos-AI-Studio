/**
 * Firestore Realtime Service
 * Direct Firestore listeners for instant updates (replaces SSE)
 * 
 * Benefits over SSE:
 * - 50-200ms latency (vs 500ms+ with SSE through backend)
 * - No backend connection overhead
 * - Automatic offline support
 * - Firebase handles reconnection
 */

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
    this.retryAttempts = new Map()
    this.maxRetries = 3
    this.lastUserData = null // Track last user data to detect actual changes
  }

  /**
   * Initialize realtime listeners for a user
   */
  init(userId) {
    if (!userId) {
      console.warn('[FirestoreRealtime] userId required')
      return false
    }

    // Already initialized for this user
    if (this.isInitialized && this.userId === userId) {
      return true
    }

    return this._doInit(userId)
  }

  _doInit(userId) {
    // Initialize Firebase first
    initializeFirebase()
    
    const db = getDb()
    if (!db) {
      console.warn('[FirestoreRealtime] Firestore not available')
      return false
    }

    // Cleanup previous listeners
    this.cleanup()

    this.userId = userId
    this.isInitialized = true

    console.log('[FirestoreRealtime] Initializing for user:', userId)

    // Setup listeners - combined user listener for credits + profile
    this._setupUserListener(db, userId)
    this._setupNotificationsListener(db, userId)
    this._setupVoiceProfilesListener(db, userId)
    this._setupOrdersListener(db, userId)

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
          const delay = 1000 * Math.pow(2, attempts) // Exponential backoff
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
   * Combined listener for user document (credits + profile)
   * Avoids duplicate listeners on same document
   */
  _setupUserListener(db, userId) {
    this._setupWithRetry('user', () => {
      const userRef = doc(db, 'users', userId)
      
      const unsubscribe = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            const lastData = this.lastUserData
            
            // Check if credits changed
            if (data.credits && (!lastData || JSON.stringify(data.credits) !== JSON.stringify(lastData.credits))) {
              console.log('[FirestoreRealtime] Credits updated:', data.credits.balance)
              this._notify('credits', {
                type: 'update',
                credits: {
                  balance: data.credits.balance || 0,
                  used: data.credits.used || 0,
                  purchased: data.credits.purchased || 0,
                  bonus: data.credits.bonus || 0,
                },
                timestamp: Date.now()
              })
            }
            
            // Check if profile changed (locked, settings)
            const profileChanged = !lastData || 
              data.locked !== lastData.locked || 
              JSON.stringify(data.settings) !== JSON.stringify(lastData.settings)
            
            if (profileChanged && (data.settings || data.locked !== undefined)) {
              console.log('[FirestoreRealtime] User profile updated')
              this._notify('userProfile', {
                type: 'updated',
                profile: {
                  locked: data.locked,
                  settings: data.settings,
                },
                timestamp: Date.now()
              })
            }
            
            // Store for comparison
            this.lastUserData = { 
              credits: data.credits, 
              locked: data.locked, 
              settings: data.settings 
            }
          }
        },
        (error) => {
          console.error('[FirestoreRealtime] User listener error:', error)
          this._handleListenerError('user', error)
        }
      )

      this.unsubscribers.set('user', unsubscribe)
    })
  }

  /**
   * Handle listener errors with retry
   */
  _handleListenerError(key, error) {
    const attempts = this.retryAttempts.get(key) || 0
    
    // Don't retry for permanent errors
    const permanentErrors = ['permission-denied', 'failed-precondition', 'invalid-argument']
    const isPermanentError = permanentErrors.includes(error.code) || 
      error.message?.includes('requires an index')
    
    if (isPermanentError) {
      console.error(`[FirestoreRealtime] Permanent error for ${key}, not retrying:`, error.message)
      return
    }
    
    if (attempts < this.maxRetries) {
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
        if (db && this.userId) {
          this._retryListener(key, db, this.userId)
        }
      }, delay)
    }
  }

  /**
   * Retry specific listener
   */
  _retryListener(key, db, userId) {
    switch (key) {
      case 'user':
        this._setupUserListener(db, userId)
        break
      case 'notifications':
        this._setupNotificationsListener(db, userId)
        break
      case 'voiceProfiles':
        this._setupVoiceProfilesListener(db, userId)
        break
      case 'orders':
        this._setupOrdersListener(db, userId)
        break
    }
  }

  /**
   * Listen to user's notifications (user_notifications collection)
   */
  _setupNotificationsListener(db, userId) {
    this._setupWithRetry('notifications', () => {
      const notificationsRef = collection(db, 'user_notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const docData = change.doc.data()
            
            // Convert Firestore Timestamp to ISO string if present
            let createdAt = docData.createdAt
            if (createdAt instanceof Timestamp) {
              createdAt = createdAt.toDate().toISOString()
            }
            
            const notification = { id: change.doc.id, ...docData, createdAt }
            
            if (change.type === 'added') {
              console.log('[FirestoreRealtime] New notification:', notification.id)
              this._notify('notification', {
                type: 'new',
                notification,
                timestamp: Date.now()
              })
            } else if (change.type === 'modified') {
              this._notify('notification', {
                type: 'updated',
                notification,
                timestamp: Date.now()
              })
            } else if (change.type === 'removed') {
              this._notify('notification', {
                type: 'removed',
                notificationId: notification.id,
                timestamp: Date.now()
              })
            }
          })
        },
        (error) => {
          console.error('[FirestoreRealtime] Notifications listener error:', error)
          this._handleListenerError('notifications', error)
        }
      )

      this.unsubscribers.set('notifications', unsubscribe)
    })
  }

  /**
   * Listen to user's voice profiles (voice_profiles collection)
   */
  _setupVoiceProfilesListener(db, userId) {
    this._setupWithRetry('voiceProfiles', () => {
      const profilesRef = collection(db, 'voice_profiles')
      const q = query(
        profilesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const docData = change.doc.data()
            
            // Convert Firestore Timestamps (backend uses camelCase)
            let createdAt = docData.createdAt
            let updatedAt = docData.updatedAt
            if (createdAt instanceof Timestamp) {
              createdAt = createdAt.toDate().toISOString()
            }
            if (updatedAt instanceof Timestamp) {
              updatedAt = updatedAt.toDate().toISOString()
            }
            
            const profile = { 
              profile_id: change.doc.id, 
              ...docData, 
              createdAt,
              updatedAt
            }
            
            if (change.type === 'added') {
              console.log('[FirestoreRealtime] Voice profile added:', profile.profile_id)
              this._notify('profile', {
                type: 'created',
                profile,
                timestamp: Date.now()
              })
            } else if (change.type === 'modified') {
              console.log('[FirestoreRealtime] Voice profile updated:', profile.profile_id)
              this._notify('profile', {
                type: 'updated',
                profile,
                timestamp: Date.now()
              })
            } else if (change.type === 'removed') {
              console.log('[FirestoreRealtime] Voice profile deleted:', profile.profile_id)
              this._notify('profile', {
                type: 'deleted',
                profileId: profile.profile_id,
                timestamp: Date.now()
              })
            }
          })
        },
        (error) => {
          console.error('[FirestoreRealtime] Voice profiles listener error:', error)
          this._handleListenerError('voiceProfiles', error)
        }
      )

      this.unsubscribers.set('voiceProfiles', unsubscribe)
    })
  }

  /**
   * Listen to user's orders (for payment success detection - replaces polling)
   */
  _setupOrdersListener(db, userId) {
    this._setupWithRetry('orders', () => {
      const ordersRef = collection(db, 'orders')
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const docData = change.doc.data()
              
              // Convert Firestore Timestamp
              let createdAt = docData.createdAt
              if (createdAt instanceof Timestamp) {
                createdAt = createdAt.toDate().toISOString()
              }
              
              const order = { 
                id: change.doc.id, 
                ...docData, 
                createdAt 
              }
              
              console.log('[FirestoreRealtime] New order detected:', order.id)
              this._notify('payment', {
                type: 'order_created',
                order,
                timestamp: Date.now()
              })
              
              // Also dispatch browser event for payment success
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('payment-success', { 
                  detail: { order } 
                }))
              }
            }
          })
        },
        (error) => {
          console.error('[FirestoreRealtime] Orders listener error:', error)
          this._handleListenerError('orders', error)
        }
      )

      this.unsubscribers.set('orders', unsubscribe)
    })
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
    return this.isInitialized && this.userId !== null
  }

  /**
   * Get connection status (for compatibility with old SSE service)
   */
  getStatus() {
    return this.isInitialized ? 'connected' : 'disconnected'
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
    this.lastUserData = null
    this.userId = null
    this.isInitialized = false
    console.log('[FirestoreRealtime] Cleaned up')
  }
}

// Singleton instance
const firestoreRealtimeService = new FirestoreRealtimeService()

export default firestoreRealtimeService
export { firestoreRealtimeService }
