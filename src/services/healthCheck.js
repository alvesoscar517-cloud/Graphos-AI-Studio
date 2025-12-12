/**
 * Health Check Service
 * Monitors backend availability and provides early detection of issues
 * 
 * Features:
 * - Periodic health checks
 * - Automatic retry on failure
 * - Status change notifications
 * - Graceful degradation support
 */

import { logger } from '../utils/logger'
import { CONFIG } from '../utils/config';

// ============================================================================
// CONFIGURATION
// ============================================================================

const HEALTH_CHECK_INTERVAL = 60000; // 1 minute
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
const UNHEALTHY_THRESHOLD = 3; // Number of failures before marking unhealthy
const RECOVERY_THRESHOLD = 2; // Number of successes before marking healthy

// ============================================================================
// HEALTH CHECK SERVICE
// ============================================================================

class HealthCheckService {
  constructor() {
    this.status = 'unknown'; // 'healthy' | 'unhealthy' | 'degraded' | 'unknown'
    this.lastCheck = null;
    this.lastSuccessfulCheck = null;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.listeners = new Set();
    this.checkInterval = null;
    this.isChecking = false;
    this.backendInfo = null;
  }

  /**
   * Start periodic health checks
   * @param {number} interval - Check interval in ms (default: 60000)
   */
  start(interval = HEALTH_CHECK_INTERVAL) {
    if (this.checkInterval) {
      this.stop();
    }

    // Initial check
    this.check();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.check();
    }, interval);

    logger.log('[HealthCheck] Started with interval:', interval);
  }

  /**
   * Stop periodic health checks
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.log('[HealthCheck] Stopped');
  }

  /**
   * Perform a health check
   * @returns {Promise<{healthy: boolean, latency: number, info?: Object}>}
   */
  async check() {
    if (this.isChecking) {
      return { healthy: this.status === 'healthy', latency: 0 };
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

      const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      this.lastCheck = new Date();

      if (response.ok) {
        const data = await response.json();
        this.backendInfo = data;
        this.lastSuccessfulCheck = new Date();
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses++;

        // Update status
        const previousStatus = this.status;
        if (this.consecutiveSuccesses >= RECOVERY_THRESHOLD || this.status === 'unknown') {
          this.status = 'healthy';
        }

        if (previousStatus !== this.status) {
          this._notifyStatusChange();
        }

        logger.log('[HealthCheck] Healthy', { latency, version: data.version });

        return { healthy: true, latency, info: data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      this.lastCheck = new Date();
      this.consecutiveSuccesses = 0;
      this.consecutiveFailures++;

      // Update status
      const previousStatus = this.status;
      if (this.consecutiveFailures >= UNHEALTHY_THRESHOLD) {
        this.status = 'unhealthy';
      } else if (this.status === 'healthy') {
        this.status = 'degraded';
      }

      if (previousStatus !== this.status) {
        this._notifyStatusChange();
      }

      console.warn('[HealthCheck] Failed', { 
        error: error.message, 
        latency,
        consecutiveFailures: this.consecutiveFailures 
      });

      return { healthy: false, latency, error: error.message };
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Get current health status
   * @returns {Object}
   */
  getStatus() {
    return {
      status: this.status,
      lastCheck: this.lastCheck,
      lastSuccessfulCheck: this.lastSuccessfulCheck,
      consecutiveFailures: this.consecutiveFailures,
      backendInfo: this.backendInfo
    };
  }

  /**
   * Check if backend is healthy
   * @returns {boolean}
   */
  isHealthy() {
    return this.status === 'healthy';
  }

  /**
   * Check if backend is available (healthy or degraded)
   * @returns {boolean}
   */
  isAvailable() {
    return this.status === 'healthy' || this.status === 'degraded';
  }

  /**
   * Subscribe to status changes
   * @param {Function} callback - Called with new status
   * @returns {Function} Unsubscribe function
   */
  onStatusChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Wait for healthy status
   * @param {number} timeout - Maximum wait time in ms
   * @returns {Promise<boolean>}
   */
  async waitForHealthy(timeout = 30000) {
    if (this.status === 'healthy') {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.onStatusChange((status) => {
        if (status === 'healthy') {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });

      // Trigger immediate check
      this.check();
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  _notifyStatusChange() {
    logger.log('[HealthCheck] Status changed:', this.status);
    
    this.listeners.forEach(callback => {
      try {
        callback(this.status, this.getStatus());
      } catch (error) {
        console.error('[HealthCheck] Listener error:', error);
      }
    });

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('backendHealthChange', {
      detail: this.getStatus()
    }));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const healthCheckService = new HealthCheckService();

// ============================================================================
// AUTO-START ON VISIBILITY
// ============================================================================

if (typeof document !== 'undefined') {
  // Start when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      healthCheckService.check();
    }
  });

  // Check on network recovery
  window.addEventListener('online', () => {
    logger.log('[HealthCheck] Network online, checking...');
    healthCheckService.check();
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default healthCheckService;
export { healthCheckService, HealthCheckService };
