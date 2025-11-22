/**
 * Logging Utility
 * Structured logging for Cloud Logging
 */

const config = require('../config');

// Log levels
const LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

function log(level, message, metadata = {}) {
  const entry = {
    severity: level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  // In production, this will be picked up by Cloud Logging
  console.log(JSON.stringify(entry));
}

module.exports = {
  debug: (message, metadata) => log(LEVELS.DEBUG, message, metadata),
  info: (message, metadata) => log(LEVELS.INFO, message, metadata),
  warn: (message, metadata) => log(LEVELS.WARN, message, metadata),
  error: (message, metadata) => log(LEVELS.ERROR, message, metadata)
};
