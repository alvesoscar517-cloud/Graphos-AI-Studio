/**
 * System Logger
 * Logs system activities to Firestore
 */

const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class SystemLogger {
  /**
   * Log levels
   */
  static LEVELS = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  };

  /**
   * Log an event
   */
  static async log(level, action, message, metadata = {}) {
    try {
      const logId = uuidv4();
      
      await db.collection('system_logs').doc(logId).set({
        level,
        action,
        message,
        user: metadata.user || 'system',
        ip: metadata.ip || 'internal',
        metadata: metadata.data || {},
        timestamp: new Date()
      });
      
      // Also log to console
      const emoji = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      
      console.log(`${emoji[level] || '📝'} [${level.toUpperCase()}] ${action}: ${message}`);
    } catch (error) {
      console.error('Failed to write system log:', error);
    }
  }

  /**
   * Log info
   */
  static info(action, message, metadata = {}) {
    return this.log(this.LEVELS.INFO, action, message, metadata);
  }

  /**
   * Log success
   */
  static success(action, message, metadata = {}) {
    return this.log(this.LEVELS.SUCCESS, action, message, metadata);
  }

  /**
   * Log warning
   */
  static warning(action, message, metadata = {}) {
    return this.log(this.LEVELS.WARNING, action, message, metadata);
  }

  /**
   * Log error
   */
  static error(action, message, metadata = {}) {
    return this.log(this.LEVELS.ERROR, action, message, metadata);
  }

  /**
   * Log user activity
   */
  static async logUserActivity(userId, action, details = {}) {
    try {
      await db.collection('activity_logs').add({
        userId,
        action,
        details,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }

  /**
   * Clean old logs
   */
  static async cleanOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const snapshot = await db.collection('system_logs')
        .where('timestamp', '<', cutoffDate)
        .get();
      
      if (snapshot.empty) {
        console.log('No old logs to clean');
        return 0;
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`✅ Cleaned ${snapshot.size} old logs`);
      return snapshot.size;
    } catch (error) {
      console.error('Failed to clean old logs:', error);
      return 0;
    }
  }
}

module.exports = SystemLogger;
