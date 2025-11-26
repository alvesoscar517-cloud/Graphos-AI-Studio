/**
 * Activity Log Service
 * Ghi log chi tiết hoạt động người dùng với tối ưu chi phí Firestore
 * 
 * Chiến lược tối ưu:
 * 1. Batch writes để giảm số lần ghi
 * 2. Aggregation theo ngày để giảm số documents
 * 3. TTL để tự động xóa logs cũ
 * 4. Chỉ lưu thông tin cần thiết
 */

const { db, FieldValue } = require('../config/firebase');
const logger = require('../utils/logger');

// Activity types
const ACTIVITY_TYPES = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Profile operations
  PROFILE_CREATE: 'profile_create',
  PROFILE_UPDATE: 'profile_update',
  PROFILE_DELETE: 'profile_delete',
  PROFILE_SAMPLE_ADD: 'profile_sample_add',
  PROFILE_FINALIZE: 'profile_finalize',
  
  // Analysis operations
  AI_DETECTION: 'ai_detection',
  TEXT_ANALYSIS: 'text_analysis',
  
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
  
  // Account operations
  ACCOUNT_UPDATE: 'account_update',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked'
};

// Buffer để batch write
let logBuffer = [];
let flushTimeout = null;
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL = 5000; // 5 seconds

/**
 * Log activity với buffering để tối ưu writes
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
    
    // Flush nếu buffer đầy
    if (logBuffer.length >= BUFFER_SIZE) {
      await flushBuffer();
    } else if (!flushTimeout) {
      // Set timeout để flush sau một khoảng thời gian
      flushTimeout = setTimeout(flushBuffer, FLUSH_INTERVAL);
    }
    
    return true;
  } catch (error) {
    logger.error('Error logging activity', { userId, type, error: error.message });
    return false;
  }
}

/**
 * Flush buffer vào Firestore
 */
async function flushBuffer() {
  if (logBuffer.length === 0) return;
  
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
 * Sanitize data để chỉ lưu thông tin cần thiết
 */
function sanitizeData(data) {
  const sanitized = {};
  
  // Chỉ lưu các fields quan trọng
  const allowedFields = [
    'creditsUsed', 'creditsBefore', 'creditsAfter',
    'feature', 'model', 'wordCount', 'sentenceCount',
    'profileId', 'profileName', 'sampleCount',
    'inputLength', 'outputLength',
    'success', 'error', 'duration',
    'ip', 'userAgent', 'source'
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
 * Log credit usage với chi tiết
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
    'profile_finalize': ACTIVITY_TYPES.PROFILE_FINALIZE
  };
  
  const activityType = typeMap[featureType] || featureType;
  return logActivity(userId, activityType, data);
}

/**
 * Get user activity logs với pagination
 */
async function getUserActivityLogs(userId, options = {}) {
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
 * Cleanup old logs (chạy định kỳ)
 */
async function cleanupOldLogs(daysToKeep = 90) {
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
