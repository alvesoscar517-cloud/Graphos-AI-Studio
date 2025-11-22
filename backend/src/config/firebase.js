/**
 * Firebase/Firestore Configuration
 */

const { Firestore, FieldValue } = require('@google-cloud/firestore');
const config = require('./index');

// Initialize Firestore with optimizations
const db = new Firestore({
  projectId: config.PROJECT_ID,
  // Connection pooling for better performance
  maxIdleChannels: 10,
  keepAlive: true
});

console.log('✅ Firestore initialized');

module.exports = {
  db,
  FieldValue
};
