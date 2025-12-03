/**
 * Unified Real-time Service using Server-Sent Events (SSE)
 * Uses native EventSource with manual reconnection control
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
 * - Controlled reconnection with auth failure detection
 */

import { CONFIG } from '../utils/config';

// ============================================================================
// CONFIGURATION
// ============================================================================

const RECONNECT_CONFIG = {
  initialDelay: 2000,      // 2 seconds initial delay
  maxDelay: 60000,         // Max 1 minute between retries
  maxRetries: 3,           // Only 3 retries before giving up
  backoffMultiplier: 2,    // Double delay each retry
};

// ============================================================================
// REALTIME SERVICE CLASS
// ============================================================================

class RealtimeService {
  constructor() {
    this.eventSource = null;
    this.userId = null;
    this.listeners = new Map();
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
    this.lastEventId = null;
    this.authFailed = false;
    this.reconnectTimeout = null;
    this.isConnecting = false;
    this.lastConnectTime = 0;
  }

  /**
   * Get auth token from tokenService (properly decrypted)
   */
  async getAuthToken() {
    try {
      // Use tokenService for proper token handling (decryption + auto-refresh)
      const { tokenService } = await import('./tokenService');
      const { getAuthMethod } = await import('../utils/authStorage');
      
      const authMethod = getAuthMethod();
      if (authMethod === 'email') {
        const token = await tokenService.getValidToken();
        if (token) return token;
      }
    } catch (err) {
      console.warn('[RealtimeService] Failed to get token from tokenService:', err.message);
    }
    
    // Fallback to Chrome extension
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
        return response?.token || null;
      }
    } catch {
      // Not in extension context
    }
    return null;
  }

  /**
   * Connect to SSE endpoint
   */
  async connect(userId) {
    if (!userId) {
      console.warn('[RealtimeService] userId required');
      return;
    }

    // Prevent multiple simultaneous connections
    if (this.isConnecting) {
      console.log('[RealtimeService] Already connecting, skipping');
      return;
    }

    // Already connected with same user
    if (this.eventSource && this.userId === userId && 
        this.eventSource.readyState === EventSource.OPEN) {
      console.log('[RealtimeService] Already connected');
      return;
    }

    // Debounce - minimum 3 seconds between connection attempts
    const now = Date.now();
    if (now - this.lastConnectTime < 3000) {
      console.log('[RealtimeService] Debouncing connection attempt');
      return;
    }

    // Don't reconnect if auth has failed
    if (this.authFailed) {
      console.log('[RealtimeService] Auth failed, skipping connection');
      return;
    }

    // Check max retries
    if (this.reconnectAttempts >= RECONNECT_CONFIG.maxRetries) {
      console.warn('[RealtimeService] Max retries reached, stopping');
      this.connectionStatus = 'failed';
      this._notifyStatusChange();
      return;
    }

    this.isConnecting = true;
    this.lastConnectTime = now;

    // Disconnect existing connection
    this._closeConnection();

    this.userId = userId;
    this.connectionStatus = 'connecting';
    this._notifyStatusChange();

    console.log('[RealtimeService] Connecting...', { userId, attempt: this.reconnectAttempts + 1 });

    // Build URL with auth token
    let url = `${CONFIG.API_BASE_URL}/api/realtime/events/${userId}`;
    const authToken = await this.getAuthToken();
    if (authToken) {
      url += `?token=${encodeURIComponent(authToken)}`;
    }
    
    if (this.lastEventId) {
      url += `${authToken ? '&' : '?'}lastEventId=${this.lastEventId}`;
    }

    try {
      // Use native EventSource (no auto-reconnect library)
      this.eventSource = new EventSource(url);

      // Connection opened
      this.eventSource.onopen = () => {
        console.log('[RealtimeService] Connected');
        this.reconnectAttempts = 0;
        this.connectionStatus = 'connected';
        this.isConnecting = false;
        this._notifyStatusChange();
      };

      // Handle events
      this.eventSource.addEventListener('connected', (e) => {
        console.log('[RealtimeService] Confirmed');
        if (e.lastEventId) this.lastEventId = e.lastEventId;
      });

      this.eventSource.addEventListener('credits', (e) => {
        const data = JSON.parse(e.data);
        this._notify('credits', data);
        if (e.lastEventId) this.lastEventId = e.lastEventId;
      });

      this.eventSource.addEventListener('payment', (e) => {
        const data = JSON.parse(e.data);
        this._notify('payment', data);
        if (e.lastEventId) this.lastEventId = e.lastEventId;
      });

      this.eventSource.addEventListener('notification', (e) => {
        const data = JSON.parse(e.data);
        this._notify('notification', data);
        if (e.lastEventId) this.lastEventId = e.lastEventId;
      });

      this.eventSource.addEventListener('profile', (e) => {
        const data = JSON.parse(e.data);
        this._notify('profile', data);
        if (e.lastEventId) this.lastEventId = e.lastEventId;
      });

      this.eventSource.addEventListener('heartbeat', () => {
        this.reconnectAttempts = 0;
      });

      // Error handling - this is where we control reconnection
      this.eventSource.onerror = () => {
        this.isConnecting = false;
        
        // Check if connection was immediately rejected (likely auth error)
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          if (this.connectionStatus === 'connecting') {
            console.warn('[RealtimeService] Connection rejected - likely auth error');
            this.authFailed = true;
            this._closeConnection();
            this.connectionStatus = 'auth_failed';
            this._notifyStatusChange();
            this._notify('authError', { message: 'Authentication failed' });
            return;
          }
        }

        this.reconnectAttempts++;
        console.log(`[RealtimeService] Error, attempt ${this.reconnectAttempts}/${RECONNECT_CONFIG.maxRetries}`);

        // Close current connection
        this._closeConnection();

        // Schedule reconnect with exponential backoff
        if (this.reconnectAttempts < RECONNECT_CONFIG.maxRetries && !this.authFailed) {
          const delay = Math.min(
            RECONNECT_CONFIG.initialDelay * Math.pow(RECONNECT_CONFIG.backoffMultiplier, this.reconnectAttempts - 1),
            RECONNECT_CONFIG.maxDelay
          );
          
          console.log(`[RealtimeService] Reconnecting in ${delay}ms...`);
          this.connectionStatus = 'reconnecting';
          this._notifyStatusChange();
          
          this.reconnectTimeout = setTimeout(() => {
            this.connect(this.userId);
          }, delay);
        } else {
          console.warn('[RealtimeService] Giving up on reconnection');
          this.connectionStatus = 'failed';
          this._notifyStatusChange();
        }
      };
    } catch (error) {
      console.error('[RealtimeService] Connection error:', error);
      this.isConnecting = false;
      this.connectionStatus = 'failed';
      this._notifyStatusChange();
    }
  }

  /**
   * Close connection without triggering reconnect
   */
  _closeConnection() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.eventSource) {
      this.eventSource.onopen = null;
      this.eventSource.onerror = null;
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Disconnect from SSE
   */
  disconnect() {
    this._closeConnection();
    this.connectionStatus = 'disconnected';
    this.isConnecting = false;
    this._notifyStatusChange();
    console.log('[RealtimeService] Disconnected');
  }

  /**
   * Reset auth failure state
   */
  resetAuthState() {
    this.authFailed = false;
    this.reconnectAttempts = 0;
    console.log('[RealtimeService] Auth state reset');
  }

  /**
   * Subscribe to event type
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

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

  /**
   * Check if connected
   */
  isConnected() {
    return this.connectionStatus === 'connected' && 
           this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Force reconnect (resets auth failure state)
   */
  async reconnect() {
    if (this.userId) {
      this.authFailed = false;
      this.reconnectAttempts = 0;
      this.disconnect();
      await this.connect(this.userId);
    }
  }

  /**
   * Notify listeners of an event
   */
  _notify(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error('[RealtimeService] Callback error:', e);
        }
      });
    }
  }

  /**
   * Notify status change listeners
   */
  _notifyStatusChange() {
    this._notify('_status', this.connectionStatus);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const realtimeService = new RealtimeService();

// ============================================================================
// AUTO-RECONNECT ON VISIBILITY CHANGE (with strict guards)
// ============================================================================

if (typeof document !== 'undefined') {
  let lastVisibilityChange = 0;
  
  document.addEventListener('visibilitychange', async () => {
    // Debounce visibility changes
    const now = Date.now();
    if (now - lastVisibilityChange < 5000) return;
    lastVisibilityChange = now;
    
    if (document.visibilityState === 'visible' && realtimeService.userId) {
      // Only reconnect if truly disconnected and auth hasn't failed
      if (realtimeService.authFailed) {
        console.log('[RealtimeService] Tab visible but auth failed');
        return;
      }
      if (realtimeService.isConnecting) {
        console.log('[RealtimeService] Tab visible but already connecting');
        return;
      }
      if (!realtimeService.isConnected() && 
          realtimeService.connectionStatus !== 'connecting' &&
          realtimeService.connectionStatus !== 'reconnecting') {
        console.log('[RealtimeService] Tab visible, attempting reconnect');
        await realtimeService.connect(realtimeService.userId);
      }
    }
  });
  
  // Reconnect on network online (with debounce)
  let lastOnline = 0;
  window.addEventListener('online', async () => {
    const now = Date.now();
    if (now - lastOnline < 10000) return;
    lastOnline = now;
    
    if (realtimeService.userId && !realtimeService.authFailed && !realtimeService.isConnecting) {
      if (!realtimeService.isConnected()) {
        console.log('[RealtimeService] Network online, attempting reconnect');
        realtimeService.reconnectAttempts = 0; // Reset on network change
        await realtimeService.connect(realtimeService.userId);
      }
    }
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default realtimeService;
export { realtimeService };
