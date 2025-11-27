/**
 * Enhanced Logger
 * Structured logging with correlation IDs and log levels
 */

const config = require('../config');

// ============================================================================
// LOG LEVELS
// ============================================================================

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || (config.IS_PRODUCTION ? 'info' : 'debug')];

// ============================================================================
// COLORS (for development)
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  green: '\x1b[32m'
};

const LEVEL_COLORS = {
  error: COLORS.red,
  warn: COLORS.yellow,
  info: COLORS.blue,
  http: COLORS.cyan,
  debug: COLORS.gray
};

// ============================================================================
// CORRELATION ID MANAGEMENT
// ============================================================================

const asyncLocalStorage = new (require('async_hooks').AsyncLocalStorage)();

function getCorrelationId() {
  const store = asyncLocalStorage.getStore();
  return store?.correlationId || null;
}

function setCorrelationId(correlationId) {
  return asyncLocalStorage.run({ correlationId }, () => correlationId);
}

function correlationMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || 
                        req.headers['x-request-id'] || 
                        generateId();
  
  res.setHeader('X-Correlation-ID', correlationId);
  
  asyncLocalStorage.run({ correlationId }, () => {
    req.correlationId = correlationId;
    next();
  });
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Format log entry for console output
 */
function formatConsole(level, message, meta) {
  const timestamp = new Date().toISOString();
  const correlationId = getCorrelationId();
  const color = LEVEL_COLORS[level] || COLORS.reset;
  
  let output = '';
  
  if (config.IS_DEVELOPMENT) {
    // Pretty format for development
    output = `${COLORS.gray}${timestamp}${COLORS.reset} `;
    output += `${color}[${level.toUpperCase().padEnd(5)}]${COLORS.reset} `;
    if (correlationId) {
      output += `${COLORS.cyan}[${correlationId}]${COLORS.reset} `;
    }
    output += message;
    
    if (meta && Object.keys(meta).length > 0) {
      output += ` ${COLORS.gray}${JSON.stringify(meta)}${COLORS.reset}`;
    }
  } else {
    // JSON format for production (better for log aggregation)
    const logEntry = {
      timestamp,
      level,
      message,
      correlationId,
      ...meta
    };
    output = JSON.stringify(logEntry);
  }
  
  return output;
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'authorization',
    'cookie', 'credit_card', 'ssn', 'api_key', 'apiKey'
  ];
  
  const sanitized = { ...meta };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeMeta(sanitized[key]);
    }
  }
  
  return sanitized;
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  constructor(context = {}) {
    this.context = context;
  }
  
  /**
   * Create child logger with additional context
   */
  child(additionalContext) {
    return new Logger({ ...this.context, ...additionalContext });
  }
  
  /**
   * Log at specified level
   */
  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > CURRENT_LEVEL) return;
    
    const sanitizedMeta = sanitizeMeta({ ...this.context, ...meta });
    const formatted = formatConsole(level, message, sanitizedMeta);
    
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
  
  error(message, meta = {}) {
    this.log('error', message, meta);
  }
  
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }
  
  info(message, meta = {}) {
    this.log('info', message, meta);
  }
  
  http(message, meta = {}) {
    this.log('http', message, meta);
  }
  
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
  
  /**
   * Log API request
   */
  logRequest(req, res, duration) {
    const meta = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId,
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100)
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
// REQUEST LOGGING MIDDLEWARE
// ============================================================================

function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });
  
  next();
}

// ============================================================================
// EXPORTS
// ============================================================================

const logger = new Logger();

module.exports = logger;
module.exports.Logger = Logger;
module.exports.correlationMiddleware = correlationMiddleware;
module.exports.requestLogger = requestLogger;
module.exports.getCorrelationId = getCorrelationId;
module.exports.setCorrelationId = setCorrelationId;
