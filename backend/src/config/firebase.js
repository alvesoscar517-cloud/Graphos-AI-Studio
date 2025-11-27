/**
 * Firebase/Firestore Configuration
 */

const { Firestore, FieldValue } = require('@google-cloud/firestore');
const config = require('./index');

let db = null;

try {
  // Initialize Firestore with optimizations
  db = new Firestore({
    projectId: config.PROJECT_ID,
    // Connection pooling for better performance
    maxIdleChannels: 10,
    keepAlive: true
  });
  console.log('[INIT] Firestore initialized');
} catch (error) {
  console.error('[INIT] Firestore initialization failed:', error.message);
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
