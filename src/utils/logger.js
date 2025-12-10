/**
 * Production-safe Logger Utility
 * 
 * Provides conditional logging that respects production mode.
 * In production, only errors are logged. In development, all logs are shown.
 */

const isDev = import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true';

/**
 * Logger object with methods that respect production mode
 */
export const logger = {
  /**
   * Log general information - only in development
   */
  log: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log(...args);
    }
  },

  /**
   * Log debug information - only in development
   */
  debug: (...args) => {
    if (isDev || isDebugEnabled) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log informational messages - only in development
   */
  info: (...args) => {
    if (isDev || isDebugEnabled) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log warnings - only in development
   */
  warn: (...args) => {
    if (isDev || isDebugEnabled) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log errors - always logged (even in production)
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log with custom prefix - only in development
   */
  prefix: (prefix, ...args) => {
    if (isDev || isDebugEnabled) {
      console.log(`[${prefix}]`, ...args);
    }
  },

  /**
   * Log success messages - only in development
   */
  success: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[SUCCESS]', ...args);
    }
  },

  /**
   * Log cache-related messages - only in development
   */
  cache: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[CACHE]', ...args);
    }
  },

  /**
   * Log credential-related messages - only in development
   */
  credential: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[CredentialManager]', ...args);
    }
  },

  /**
   * Log storage-related messages - only in development
   */
  storage: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[Storage]', ...args);
    }
  },

  /**
   * Log credit-related messages - only in development
   */
  credit: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[Credit]', ...args);
    }
  }
};

export default logger;
