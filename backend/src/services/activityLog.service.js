/**
 * Activity Log Service
 * Detailed activity logging with Firestore cost optimization
 * 
 * Optimization strategy:
 * 1. Batch writes to reduce write operations
 * 2. Daily aggregation to reduce document count
 * 3. TTL to automatically delete old logs
 * 4. Store only essential information
 */

let db, FieldValue;
try {
  const firebase = require('../config/firebase');
  db = firebase.db;
  FieldValue = firebase.FieldValue;
} catch (error) {
  logger.error('[WARN] Firebase not available for activity logging:', error.message);
  db = null;
  FieldValue = null;
}
const logger = require('../utils/logger');

// Activity types
const ACTIVITY_TYPES = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  VERIFY_EMAIL: 'verify_email',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
  CHANGE_PASSWORD: 'change_password',
  DELETE_ACCOUNT: 'delete_account',
  
  // Profile operations
  PROFILE_CREATE: 'profile_create',
  PROFILE_UPDATE: 'profile_update',
  PROFILE_DELETE: 'profile_delete',
  PROFILE_SAMPLE_ADD: 'profile_sample_add',
  PROFILE_FINALIZE: 'profile_finalize',
  
  // Analysis operations
  AI_DETECTION: 'ai_detection',
  TEXT_ANALYSIS: 'text_analysis',
  CHECK_HUMANIZATION: 'check_humanization',
  
  // Rewrite operations
  TEXT_REWRITE: 'text_rewrite',
  HUMANIZE: 'humanize',
  ITERATIVE_HUMANIZE: 'iterative_humanize',
  
  // Chat operations
  CHAT_MESSAGE: 'chat_message',
  CHAT_HUMANIZED: 'chat_humanized',
  CONVERSATION_SUMMARIZE: 'conversation_summarize',
  
  // Translation
  TRANSLATION: 'translation',
  
  // File operations
  FILE_UPLOAD: 'file_upload',
  
  // Credit operations
  CREDIT_PURCHASE: 'credit_purchase',
  CREDIT_DEDUCT: 'credit_deduct',
  CREDIT_BONUS: 'credit_bonus',
  CREDITS_ADDED: 'credits_added',
  
  // Account operations
  ACCOUNT_UPDATE: 'account_update',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  
  // Notification
  NOTIFICATION_RECEIVED: 'notification_received'
};

// Buffer for batch write
let logBuffer = [];
let flushTimeout = null;
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL = 5000; // 5 seconds

/**
 * Log activity with buffering for optimized writes
 */
async function logActivity(userId, type, data = {}) {
  try {
    const activity = {
      userId,
      type,
      timestamp: new Date(),
      ...sanitizeData(data)
    };
    
    logBuffer.push(activity);
    
    // Flush if buffer is full
    if (logBuffer.length >= BUFFER_SIZE) {
      await flushBuffer();
    } else if (!flushTimeout) {
      // Set timeout to flush after a period of time
      flushTimeout = setTimeout(flushBuffer, FLUSH_INTERVAL);
    }
    
    return true;
  } catch (error) {
    logger.error('Error logging activity', { userId, type, error: error.message });
    return false;
  }
}

/**
 * Flush buffer to Firestore
 */
async function flushBuffer() {
  if (logBuffer.length === 0) return;
  
  // Skip if Firestore not available
  if (!db) {
    logBuffer = [];
    return;
  }
  
  const logsToWrite = [...logBuffer];
  logBuffer = [];
  
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
  
  try {
    const batch = db.batch();
    
    for (const log of logsToWrite) {
      const logRef = db.collection('user_activity_logs').doc();
      batch.set(logRef, {
        ...log,
        createdAt: FieldValue.serverTimestamp()
      });
      
      // Update daily aggregation
      const dateStr = log.timestamp.toISOString().split('T')[0];
      const aggRef = db.collection('activity_aggregations').doc(`${log.userId}_${dateStr}`);
      
      batch.set(aggRef, {
        userId: log.userId,
        date: dateStr,
        [`counts.${log.type}`]: FieldValue.increment(1),
        [`credits.${log.type}`]: FieldValue.increment(log.creditsUsed || 0),
        totalActivities: FieldValue.increment(1),
        totalCreditsUsed: FieldValue.increment(log.creditsUsed || 0),
        lastActivity: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    
    await batch.commit();
    logger.info('Activity logs flushed', { count: logsToWrite.length });
  } catch (error) {
    logger.error('Error flushing activity logs', { error: error.message });
    // Re-add to buffer on failure
    logBuffer = [...logsToWrite, ...logBuffer];
  }
}

/**
 * Sanitize data to store only essential information
 */
function sanitizeData(data) {
  const sanitized = {};
  
  // Store only important fields
  const allowedFields = [
    'creditsUsed', 'creditsBefore', 'creditsAfter',
    'feature', 'model', 'wordCount', 'sentenceCount',
    'profileId', 'profileName', 'sampleCount', 'sampleId',
    'inputLength', 'outputLength',
    'success', 'error', 'duration',
    'ip', 'userAgent', 'source',
    // Additional fields for detailed tracking
    'aiProbability', 'isAuthentic', 'voiceCompatibility',
    'iterations', 'reachedTarget', 'streaming',
    'endpoint', 'method', 'theme',
    // Translation fields
    'sourceLang', 'targetLang',
    // File upload fields
    'fileId', 'fileName', 'mimeType', 'fileType', 'hasExtractedText',
    // Summarize fields
    'messagesCount', 'summarizedCount',
    // Check humanization fields
    'overallRisk',
    // Payment fields
    'orderId', 'packageId', 'packageName', 'price', 'priceFormatted',
    // Admin action fields
    'reason', 'adminId', 'humanized'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }
  
  // Truncate long strings
  if (sanitized.error && sanitized.error.length > 200) {
    sanitized.error = sanitized.error.substring(0, 200) + '...';
  }
  
  return sanitized;
}

/**
 * Log credit usage with details
 */
async function logCreditUsage(userId, feature, creditsUsed, metadata = {}) {
  return logActivity(userId, ACTIVITY_TYPES.CREDIT_DEDUCT, {
    feature,
    creditsUsed,
    ...metadata
  });
}

/**
 * Log feature usage
 */
async function logFeatureUsage(userId, featureType, data = {}) {
  const typeMap = {
    'ai_detection': ACTIVITY_TYPES.AI_DETECTION,
    'text_analysis': ACTIVITY_TYPES.TEXT_ANALYSIS,
    'text_rewrite': ACTIVITY_TYPES.TEXT_REWRITE,
    'humanize': ACTIVITY_TYPES.HUMANIZE,
    'iterative_humanize': ACTIVITY_TYPES.ITERATIVE_HUMANIZE,
    'chat_message': ACTIVITY_TYPES.CHAT_MESSAGE,
    'chat_humanized': ACTIVITY_TYPES.CHAT_HUMANIZED,
    'translation': ACTIVITY_TYPES.TRANSLATION,
    'file_upload': ACTIVITY_TYPES.FILE_UPLOAD,
    'profile_create': ACTIVITY_TYPES.PROFILE_CREATE,
    'profile_sample_add': ACTIVITY_TYPES.PROFILE_SAMPLE_ADD,
    'profile_finalize': ACTIVITY_TYPES.PROFILE_FINALIZE,
    'conversation_summarize': ACTIVITY_TYPES.CONVERSATION_SUMMARIZE,
    'check_humanization': ACTIVITY_TYPES.CHECK_HUMANIZATION,
    'credit_purchase': ACTIVITY_TYPES.CREDIT_PURCHASE,
    'account_locked': ACTIVITY_TYPES.ACCOUNT_LOCKED,
    'account_unlocked': ACTIVITY_TYPES.ACCOUNT_UNLOCKED
  };
  
  const activityType = typeMap[featureType] || featureType;
  return logActivity(userId, activityType, data);
}

/**
 * Get user activity logs with pagination
 */
async function getUserActivityLogs(userId, options = {}) {
  if (!db) {
    return { logs: [], hasMore: false };
  }
  
  const {
    limit = 50,
    offset = 0,
    type = null,
    startDate = null,
    endDate = null,
    orderBy = 'timestamp',
    orderDir = 'desc'
  } = options;
  
  try {
    let query = db.collection('user_activity_logs')
      .where('userId', '==', userId);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate));
    }
    
    query = query.orderBy(orderBy, orderDir)
      .offset(offset)
      .limit(limit);
    
    const snapshot = await query.get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
    }));
    
    return { logs, hasMore: logs.length === limit };
  } catch (error) {
    logger.error('Error getting user activity logs', { userId, error: error.message });
    throw error;
  }
}

/**
 * Get user activity summary (aggregated)
 */
async function getUserActivitySummary(userId, days = 30) {
  if (!db) {
    return { totalActivities: 0, totalCreditsUsed: 0, byType: {}, byDate: {}, dailyAverage: 0 };
  }
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const snapshot = await db.collection('activity_aggregations')
      .where('userId', '==', userId)
      .where('date', '>=', startDateStr)
      .orderBy('date', 'desc')
      .get();
    
    const summary = {
      totalActivities: 0,
      totalCreditsUsed: 0,
      byType: {},
      byDate: {},
      dailyAverage: 0
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      summary.totalActivities += data.totalActivities || 0;
      summary.totalCreditsUsed += data.totalCreditsUsed || 0;
      
      // Aggregate by type
      if (data.counts) {
        for (const [type, count] of Object.entries(data.counts)) {
          summary.byType[type] = (summary.byType[type] || 0) + count;
        }
      }
      
      // Daily data
      summary.byDate[data.date] = {
        activities: data.totalActivities || 0,
        credits: data.totalCreditsUsed || 0
      };
    });
    
    summary.dailyAverage = summary.totalActivities / Math.max(days, 1);
    
    return summary;
  } catch (error) {
    logger.error('Error getting user activity summary', { userId, error: error.message });
    throw error;
  }
}

/**
 * Get all users activity for admin (with pagination)
 */
async function getAllUsersActivity(options = {}) {
  if (!db) {
    return { logs: [], hasMore: false };
  }
  
  const {
    limit = 100,
    offset = 0,
    type = null,
    startDate = null,
    endDate = null,
    userId = null
  } = options;
  
  try {
    let query = db.collection('user_activity_logs');
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate));
    }
    
    query = query.orderBy('timestamp', 'desc')
      .offset(offset)
      .limit(limit);
    
    const snapshot = await query.get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
    }));
    
    return { logs, hasMore: logs.length === limit };
  } catch (error) {
    logger.error('Error getting all users activity', { error: error.message });
    throw error;
  }
}

/**
 * Get activity statistics for admin dashboard
 */
async function getActivityStatistics(days = 7) {
  if (!db) {
    return { totalActivities: 0, totalCreditsUsed: 0, uniqueUsers: 0, byType: {}, byDate: {}, topUsers: [] };
  }
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const snapshot = await db.collection('activity_aggregations')
      .where('date', '>=', startDateStr)
      .get();
    
    const stats = {
      totalActivities: 0,
      totalCreditsUsed: 0,
      uniqueUsers: new Set(),
      byType: {},
      byDate: {},
      topUsers: {}
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.totalActivities += data.totalActivities || 0;
      stats.totalCreditsUsed += data.totalCreditsUsed || 0;
      stats.uniqueUsers.add(data.userId);
      
      // By type
      if (data.counts) {
        for (const [type, count] of Object.entries(data.counts)) {
          stats.byType[type] = (stats.byType[type] || 0) + count;
        }
      }
      
      // By date
      if (!stats.byDate[data.date]) {
        stats.byDate[data.date] = { activities: 0, credits: 0, users: new Set() };
      }
      stats.byDate[data.date].activities += data.totalActivities || 0;
      stats.byDate[data.date].credits += data.totalCreditsUsed || 0;
      stats.byDate[data.date].users.add(data.userId);
      
      // Top users
      if (!stats.topUsers[data.userId]) {
        stats.topUsers[data.userId] = { activities: 0, credits: 0 };
      }
      stats.topUsers[data.userId].activities += data.totalActivities || 0;
      stats.topUsers[data.userId].credits += data.totalCreditsUsed || 0;
    });
    
    // Convert Sets to counts
    stats.uniqueUsers = stats.uniqueUsers.size;
    for (const date in stats.byDate) {
      stats.byDate[date].users = stats.byDate[date].users.size;
    }
    
    // Sort top users
    stats.topUsers = Object.entries(stats.topUsers)
      .sort((a, b) => b[1].activities - a[1].activities)
      .slice(0, 10)
      .map(([userId, data]) => ({ userId, ...data }));
    
    return stats;
  } catch (error) {
    logger.error('Error getting activity statistics', { error: error.message });
    throw error;
  }
}

/**
 * Cleanup old logs (runs periodically)
 */
async function cleanupOldLogs(daysToKeep = 90) {
  if (!db) {
    return { deleted: 0 };
  }
  
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const snapshot = await db.collection('user_activity_logs')
      .where('timestamp', '<', cutoffDate)
      .limit(500)
      .get();
    
    if (snapshot.empty) {
      return { deleted: 0 };
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    logger.info('Old activity logs cleaned up', { deleted: snapshot.size });
    return { deleted: snapshot.size };
  } catch (error) {
    logger.error('Error cleaning up old logs', { error: error.message });
    throw error;
  }
}

// Flush buffer khi process exit
process.on('beforeExit', async () => {
  await flushBuffer();
});

module.exports = {
  ACTIVITY_TYPES,
  logActivity,
  logCreditUsage,
  logFeatureUsage,
  getUserActivityLogs,
  getUserActivitySummary,
  getAllUsersActivity,
  getActivityStatistics,
  cleanupOldLogs,
  flushBuffer
};
