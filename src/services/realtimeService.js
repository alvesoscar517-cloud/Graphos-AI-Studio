/**
 * Unified Real-time Service using Server-Sent Events (SSE)
 * 
 * Single connection handles all real-time updates:
 * - Credits balance changes
 * - Payment notifications
 * - Profile updates
 * - System notifications
 * 
 * Benefits:
 * - 1 connection instead of multiple polling intervals
 * - Instant updates (< 100ms vs 30s polling)
 * - Reduced API costs by ~95%
 * - Better UX with real-time feedback
 */

import { CONFIG } from '../utils/config';

class RealtimeService {
  constructor() {
    this.eventSource = null;
    this.userId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.reconnectTimeout = null;
    this.isConnecting = false;
    this.connectionStatus = 'disconnected';
  }

  /**
   * Connect to SSE endpoint
   */
  connect(userId) {
    if (!userId) {
      console.warn('[WARNING] RealtimeService: userId required');
      return;
    }

    // Already connected with same user
    if (this.eventSource && this.userId === userId && this.connectionStatus === 'connected') {
      console.log('📡 RealtimeService: Already connected');
      return;
    }

    // Disconnect existing connection
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    this.isConnecting = true;
    this.connectionStatus = 'connecting';
    this._notifyStatusChange();

    console.log('🔌 RealtimeService: Connecting...', { userId });

    const url = `${CONFIG.API_BASE_URL}/api/realtime/events/${userId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('[SUCCESS] RealtimeService: Connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.connectionStatus = 'connected';
      this._notifyStatusChange();
    };

    // Handle different event types
    this.eventSource.addEventListener('connected', (e) => {
      console.log('📡 RealtimeService: Confirmed', JSON.parse(e.data));
    });

    this.eventSource.addEventListener('credits', (e) => {
      const data = JSON.parse(e.data);
      console.log('💰 Credits update:', data);
      this._notify('credits', data);
    });

    this.eventSource.addEventListener('payment', (e) => {
      const data = JSON.parse(e.data);
      console.log('💳 Payment update:', data);
      this._notify('payment', data);
    });

    this.eventSource.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data);
      console.log('[BELL] Notification:', data);
      this._notify('notification', data);
    });

    this.eventSource.addEventListener('profile', (e) => {
      const data = JSON.parse(e.data);
      console.log('[USER] Profile update:', data);
      this._notify('profile', data);
    });

    this.eventSource.addEventListener('heartbeat', () => {
      // Connection alive
    });

    this.eventSource.onerror = (error) => {
      console.error('[FAIL] RealtimeService: Error', error);
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatus = 'disconnected';
      this._notifyStatusChange();
      this._attemptReconnect();
    };
  }

  /**
   * Disconnect from SSE
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this._notifyStatusChange();
    console.log('⏹️ RealtimeService: Disconnected');
  }

  /**
   * Subscribe to event type
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback) {
    return this.subscribe('_status', callback);
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return this.connectionStatus;
  }

  // Private methods
  _notify(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error('RealtimeService callback error:', e);
        }
      });
    }
  }

  _notifyStatusChange() {
    this._notify('_status', this.connectionStatus);
  }

  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WARNING] RealtimeService: Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`[SYNC] RealtimeService: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }
}

// Singleton instance
const realtimeService = new RealtimeService();

// Auto-reconnect when tab becomes visible
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && realtimeService.userId) {
      if (realtimeService.connectionStatus !== 'connected') {
        console.log('👁️ Tab visible, reconnecting...');
        realtimeService.reconnectAttempts = 0;
        realtimeService.connect(realtimeService.userId);
      }
    }
  });
}

export default realtimeService;
