/**
 * Firebase/Firestore Configuration
 */

const { Firestore, FieldValue } = require('@google-cloud/firestore');
const config = require('./index');

const logger = require('../utils/logger');
let db = null;

try {
  // Initialize Firestore with optimizations
  db = new Firestore({
    projectId: config.PROJECT_ID,
    // Connection pooling for better performance
    maxIdleChannels: 10,
    keepAlive: true
  });
  logger.info('[INIT] Firestore initialized');
} catch (error) {
  logger.error('[INIT] Firestore initialization failed:', error.message);
  // Create a mock db that throws on operations - server can still start
  db = {
    collection: () => {
      throw new Error('Firestore not available');
    },
    batch: () => {
      throw new Error('Firestore not available');
    }
  };
}

module.exports = {
  db,
  FieldValue
};
