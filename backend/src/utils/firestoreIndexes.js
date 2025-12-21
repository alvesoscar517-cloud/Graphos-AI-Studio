/**
 * Firestore Index Management Utility
 * 
 * Automatically ensures required composite indexes exist for the application.
 * Firestore creates single-field indexes automatically, but composite indexes
 * need to be created manually or via this utility.
 * 
 * NOTE: Firestore Admin SDK doesn't have direct API to create indexes programmatically.
 * Instead, this utility:
 * 1. Runs test queries that would require the indexes
 * 2. If query fails with FAILED_PRECONDITION, logs the index creation URL
 * 3. Caches successful checks to avoid repeated queries
 * 
 * For production, indexes should be deployed via:
 * `firebase deploy --only firestore:indexes`
 */

const { db } = require('../config/firebase');
const logger = require('./logger');

// Cache for index check results (in-memory, resets on server restart)
const indexCheckCache = new Map();

// Required indexes configuration
const REQUIRED_INDEXES = [
  {
    name: 'user_notes_by_updated',
    collection: 'user_notes',
    fields: ['userId', 'updated'],
    testQuery: (collection) => collection
      .where('userId', '==', '__test__')
      .orderBy('updated', 'desc')
      .limit(1)
  },
  {
    name: 'user_conversations_by_updated',
    collection: 'user_conversations',
    fields: ['userId', 'updated'],
    testQuery: (collection) => collection
      .where('userId', '==', '__test__')
      .orderBy('updated', 'desc')
      .limit(1)
  },
  {
    name: 'user_messages_by_conversation',
    collection: 'user_messages',
    fields: ['conversationId', 'userId', 'timestamp'],
    testQuery: (collection) => collection
      .where('conversationId', '==', '__test__')
      .where('userId', '==', '__test__')
      .orderBy('timestamp', 'asc')
      .limit(1)
  }
];

/**
 * Check if a specific index exists by running a test query
 * @param {Object} indexConfig - Index configuration
 * @returns {Promise<{exists: boolean, error?: string, createUrl?: string}>}
 */
async function checkIndex(indexConfig) {
  const { name, collection, testQuery } = indexConfig;
  
  // Check cache first
  if (indexCheckCache.get(name)) {
    return { exists: true, cached: true };
  }
  
  try {
    const collectionRef = db.collection(collection);
    const query = testQuery(collectionRef);
    
    // Run the query - if index doesn't exist, it will throw FAILED_PRECONDITION
    await query.get();
    
    // Query succeeded, index exists
    indexCheckCache.set(name, true);
    return { exists: true };
  } catch (error) {
    if (error.code === 9 || error.message?.includes('FAILED_PRECONDITION') || 
        error.message?.includes('index')) {
      // Extract index creation URL from error message if available
      const urlMatch = error.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
      return { 
        exists: false, 
        error: 'Index not found',
        createUrl: urlMatch ? urlMatch[0] : null
      };
    }
    
    // Other errors (permission, network, etc.) - assume index exists
    // to avoid blocking server startup
    logger.warn(`[Indexes] Could not verify index ${name}: ${error.message}`);
    return { exists: true, error: error.message };
  }
}

/**
 * Check all required indexes and log status
 * @returns {Promise<{allExist: boolean, missing: string[], results: Object}>}
 */
async function checkAllIndexes() {
  logger.info('[Indexes] Checking Firestore indexes...');
  
  const results = {};
  const missing = [];
  
  for (const indexConfig of REQUIRED_INDEXES) {
    const result = await checkIndex(indexConfig);
    results[indexConfig.name] = result;
    
    if (!result.exists) {
      missing.push(indexConfig.name);
      
      logger.warn(`[Indexes] Missing index: ${indexConfig.name}`);
      logger.warn(`[Indexes]   Collection: ${indexConfig.collection}`);
      logger.warn(`[Indexes]   Fields: ${indexConfig.fields.join(', ')}`);
      
      if (result.createUrl) {
        logger.warn(`[Indexes]   Create URL: ${result.createUrl}`);
      }
    } else if (result.cached) {
      logger.debug(`[Indexes] Index ${indexConfig.name}: OK (cached)`);
    } else {
      logger.info(`[Indexes] Index ${indexConfig.name}: OK`);
    }
  }
  
  const allExist = missing.length === 0;
  
  if (allExist) {
    logger.info('[Indexes] All required indexes exist ✓');
  } else {
    logger.warn(`[Indexes] ${missing.length} index(es) missing. Run: firebase deploy --only firestore:indexes`);
  }
  
  return { allExist, missing, results };
}

/**
 * Initialize indexes check on server startup
 * Non-blocking - logs warnings but doesn't prevent server from starting
 */
async function initializeIndexes() {
  try {
    // Small delay to let Firestore connection stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { allExist, missing } = await checkAllIndexes();
    
    if (!allExist) {
      logger.warn('[Indexes] ⚠️  Some indexes are missing. Queries may fail or be slow.');
      logger.warn('[Indexes] Deploy indexes with: cd backend && firebase deploy --only firestore:indexes');
    }
    
    return { success: true, allExist, missing };
  } catch (error) {
    logger.error('[Indexes] Failed to check indexes:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Clear index check cache (useful for testing)
 */
function clearCache() {
  indexCheckCache.clear();
}

module.exports = {
  checkAllIndexes,
  checkIndex,
  initializeIndexes,
  clearCache,
  REQUIRED_INDEXES
};
