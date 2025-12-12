/**
 * Unified Real-time Service
 * Now uses Firestore Realtime instead of SSE for instant updates
 * 
 * Benefits:
 * - 50-200ms latency (vs 500ms+ with SSE)
 * - No backend connection overhead
 * - Automatic offline support & reconnection
 * - Reduced server costs
 * 
 * Keeps same API for backward compatibility with existing code
 */

import { logger } from '../utils/logger'
import firestoreRealtimeService from './firestoreRealtimeService'

class RealtimeService {
  constructor() {
    this.userId = null
    this.connectionStatus = 'disconnected'
    this.statusListeners = new Set()
  }

  /**
   * Connect to realtime updates (now uses Firestore)
   */
  connect(userId) {
    if (!userId) {
      logger.warn('RealtimeService', 'userId required')
      return
    }

    // Already connected with same user
    if (this.userId === userId && firestoreRealtimeService.isConnected()) {
      return
    }

    this.userId = userId
    this._setStatus('connecting')

    // Initialize Firestore realtime
    const success = firestoreRealtimeService.init(userId)
    
    if (success) {
      this._setStatus('connected')
    } else {
      this._setStatus('failed')
      logger.warn('RealtimeService', 'Failed to connect')
    }
  }

  /**
   * Disconnect from realtime updates
   */
  disconnect() {
    firestoreRealtimeService.cleanup()
    this.userId = null
    this._setStatus('disconnected')
  }

  /**
   * Subscribe to event type
   * Supported types: 'credits', 'notification', 'profile', 'payment'
   */
  subscribe(eventType, callback) {
    return firestoreRealtimeService.subscribe(eventType, callback)
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback) {
    this.statusListeners.add(callback)
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return this.connectionStatus
  }

  /**
   * Check if connected
   */
  isConnected() {
    return firestoreRealtimeService.isConnected()
  }

  /**
   * Force reconnect
   */
  async reconnect() {
    if (this.userId) {
      this.disconnect()
      await this.connect(this.userId)
    }
  }

  /**
   * Reset auth state (for compatibility)
   */
  resetAuthState() {
    // No-op for Firestore, kept for compatibility
  }

  /**
   * Auth failed flag (for compatibility)
   */
  get authFailed() {
    return false // Firestore handles auth differently
  }

  /**
   * Set connection status and notify listeners
   */
  _setStatus(status) {
    this.connectionStatus = status
    this.statusListeners.forEach(cb => {
      try {
        cb(status)
      } catch (e) {
        logger.error('RealtimeService', 'Status callback error', e)
      }
    })
  }
}

// Singleton instance
const realtimeService = new RealtimeService()

// Auto-reconnect on visibility change
if (typeof document !== 'undefined') {
  let lastVisibilityChange = 0
  
  document.addEventListener('visibilitychange', async () => {
    const now = Date.now()
    if (now - lastVisibilityChange < 5000) return
    lastVisibilityChange = now
    
    if (document.visibilityState === 'visible' && realtimeService.userId) {
      if (!realtimeService.isConnected()) {
        await realtimeService.connect(realtimeService.userId)
      }
    }
  })
  
  // Reconnect on network online
  let lastOnline = 0
  window.addEventListener('online', async () => {
    const now = Date.now()
    if (now - lastOnline < 10000) return
    lastOnline = now
    
    if (realtimeService.userId && !realtimeService.isConnected()) {
      await realtimeService.connect(realtimeService.userId)
    }
  })
}

export default realtimeService
export { realtimeService }
