/**
 * Enhanced Logger - Powered by Pino
 * High-performance structured logging with correlation IDs
 * 
 * @module utils/logger
 */

const pino = require('pino');
const pinoHttp = require('pino-http');
const { AsyncLocalStorage } = require('async_hooks');

// ============================================================================
// CONFIGURATION
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug');

/**
 * Sensitive fields to redact from logs
 */
const REDACT_PATHS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apiKey',
  'api_key',
  'credit_card',
  'ssn',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]'
];

// ============================================================================
// PINO LOGGER INSTANCE
// ============================================================================

/**
 * Create Pino logger with appropriate configuration
 */
let transportConfig = undefined;

// Only use pino-pretty in development and if it's available
if (!IS_PRODUCTION) {
  try {
    require.resolve('pino-pretty');
    transportConfig = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    };
  } catch (e) {
    // pino-pretty not available, use default JSON output
    console.log('[LOGGER] pino-pretty not available, using JSON output');
  }
}

const logger = pino({
  level: LOG_LEVEL,
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]'
  },
  // Use pino-pretty in development if available
  transport: transportConfig,
  // Production: JSON format
  formatters: IS_PRODUCTION ? {
    level: (label) => ({ level: label }),
    bindings: () => ({})
  } : undefined,
  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime
});

// ============================================================================
// CORRELATION ID MANAGEMENT
// ============================================================================

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Get current correlation ID from async context
 * @returns {string|null} Correlation ID or null
 */
function getCorrelationId() {
  const store = asyncLocalStorage.getStore();
  return store?.correlationId || null;
}

/**
 * Set correlation ID in async context
 * @param {string} correlationId - Correlation ID to set
 * @param {Function} callback - Callback to run with correlation ID
 * @returns {*} Result of callback
 */
function runWithCorrelationId(correlationId, callback) {
  return asyncLocalStorage.run({ correlationId }, callback);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Express middleware to set correlation ID
 */
function correlationMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || 
                        req.headers['x-request-id'] || 
                        generateId();
  
  res.setHeader('X-Correlation-ID', correlationId);
  req.correlationId = correlationId;
  
  asyncLocalStorage.run({ correlationId }, () => {
    next();
  });
}

// ============================================================================
// PINO-HTTP MIDDLEWARE
// ============================================================================

/**
 * Create pino-http middleware for request logging
 */
const requestLogger = pinoHttp({
  logger,
  
  // Generate request ID
  genReqId: (req) => req.correlationId || req.headers['x-correlation-id'] || generateId(),
  
  // Custom log level based on status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  
  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  
  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  
  // Custom attributes to add to log
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration'
  },
  
  // Redact sensitive headers
  redact: REDACT_PATHS,
  
  // Custom props
  customProps: (req) => ({
    correlationId: req.correlationId,
    userId: req.userId
  }),
  
  // Serializers
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      correlationId: req.correlationId,
      userId: req.userId
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});

// ============================================================================
// LOGGER WRAPPER (backward compatibility)
// ============================================================================

/**
 * Logger class for backward compatibility
 */
class Logger {
  constructor(context = {}) {
    this.context = context;
    this.pino = logger.child(context);
  }
  
  /**
   * Create child logger with additional context
   */
  child(additionalContext) {
    return new Logger({ ...this.context, ...additionalContext });
  }
  
  /**
   * Add correlation ID to log context
   */
  _withCorrelation(meta = {}) {
    const correlationId = getCorrelationId();
    return correlationId ? { correlationId, ...meta } : meta;
  }
  
  error(message, meta = {}) {
    this.pino.error(this._withCorrelation(meta), message);
  }
  
  warn(message, meta = {}) {
    this.pino.warn(this._withCorrelation(meta), message);
  }
  
  info(message, meta = {}) {
    this.pino.info(this._withCorrelation(meta), message);
  }
  
  http(message, meta = {}) {
    this.pino.info(this._withCorrelation({ ...meta, type: 'http' }), message);
  }
  
  debug(message, meta = {}) {
    this.pino.debug(this._withCorrelation(meta), message);
  }
  
  trace(message, meta = {}) {
    this.pino.trace(this._withCorrelation(meta), message);
  }
  
  /**
   * Log API request (legacy method)
   */
  logRequest(req, res, duration) {
    const meta = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId,
      ip: req.ip
    };
    
    if (res.statusCode >= 500) {
      this.error('Request failed', meta);
    } else if (res.statusCode >= 400) {
      this.warn('Request error', meta);
    } else {
      this.http('Request completed', meta);
    }
  }
  
  /**
   * Log performance metric
   */
  logPerformance(operation, duration, meta = {}) {
    this.info(`Performance: ${operation}`, {
      ...meta,
      duration: `${duration}ms`,
      slow: duration > 1000
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create default logger instance
const defaultLogger = new Logger();

// Export as default
module.exports = defaultLogger;

// Named exports
module.exports.Logger = Logger;
module.exports.pino = logger;
module.exports.correlationMiddleware = correlationMiddleware;
module.exports.requestLogger = requestLogger;
module.exports.getCorrelationId = getCorrelationId;
module.exports.runWithCorrelationId = runWithCorrelationId;
module.exports.generateId = generateId;
