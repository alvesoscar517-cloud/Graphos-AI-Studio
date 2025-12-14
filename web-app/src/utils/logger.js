/**
 * Production-safe Logger Utility
 * 
 * Provides conditional logging that respects production mode.
 * In production, only errors are logged. In development, all logs are shown.
 * 
 * Features:
 * - Environment-aware logging (dev vs prod)
 * - Structured logging support for production monitoring
 * - Log levels: debug, info, warn, error
 * - Domain-specific loggers (auth, api, cache, etc.)
 */

const isDev = import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true';
const isProd = import.meta.env.PROD;

/**
 * Log levels for filtering
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Current log level (can be configured via env)
 */
const currentLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

/**
 * Format log entry for structured logging (production)
 */
const formatStructured = (level, context, message, data = null) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message: typeof message === 'string' ? message : JSON.stringify(message),
  };
  
  if (data !== null && data !== undefined) {
    // Sanitize sensitive data
    entry.data = sanitizeData(data);
  }
  
  return entry;
};

/**
 * Sanitize sensitive data from logs
 */
const sanitizeData = (data) => {
  if (typeof data !== 'object' || data === null) return data;
  
  const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey', 'authorization'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
};

/**
 * Check if should log at given level
 */
const shouldLog = (level) => {
  if (isDev || isDebugEnabled) return true;
  return level >= currentLevel;
};

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
  debug: (context, ...args) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(`[DEBUG][${context}]`, ...args);
    }
  },

  /**
   * Log informational messages - only in development
   */
  info: (context, ...args) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.info(`[INFO][${context}]`, ...args);
    }
  },

  /**
   * Log warnings - in dev always, in prod only if level allows
   */
  warn: (context, ...args) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(`[WARN][${context}]`, ...args);
    }
  },

  /**
   * Log errors - always logged (even in production)
   * In production, uses structured format for monitoring tools
   */
  error: (context, message, error = null) => {
    if (isProd) {
      // Structured logging for production monitoring
      const entry = formatStructured('ERROR', context, message, {
        errorMessage: error?.message,
        errorCode: error?.code,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines only
      });
      console.error(JSON.stringify(entry));
    } else {
      console.error(`[ERROR][${context}]`, message, error || '');
    }
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

  // ============================================================================
  // DOMAIN-SPECIFIC LOGGERS
  // ============================================================================

  /**
   * Auth-related logs
   */
  auth: {
    log: (...args) => logger.log('[Auth]', ...args),
    warn: (message, data) => logger.warn('Auth', message, data),
    error: (message, error) => logger.error('Auth', message, error),
  },

  /**
   * API-related logs
   */
  api: {
    log: (...args) => logger.log('[API]', ...args),
    warn: (message, data) => logger.warn('API', message, data),
    error: (message, error) => logger.error('API', message, error),
  },

  /**
   * Cache-related logs
   */
  cache: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[CACHE]', ...args);
    }
  },

  /**
   * Credential-related logs
   */
  credential: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[CredentialManager]', ...args);
    }
  },

  /**
   * Storage-related logs
   */
  storage: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[Storage]', ...args);
    }
  },

  /**
   * Credit-related logs
   */
  credit: (...args) => {
    if (isDev || isDebugEnabled) {
      console.log('[Credit]', ...args);
    }
  },

  /**
   * Firestore/Realtime logs
   */
  realtime: {
    log: (...args) => logger.log('[Realtime]', ...args),
    warn: (message, data) => logger.warn('Realtime', message, data),
    error: (message, error) => logger.error('Realtime', message, error),
  },

  /**
   * Notification logs
   */
  notification: {
    log: (...args) => logger.log('[Notification]', ...args),
    warn: (message, data) => logger.warn('Notification', message, data),
    error: (message, error) => logger.error('Notification', message, error),
  },
};

export default logger;
