/**
 * Check Locked Middleware
 * Prevents locked users from accessing the system
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Middleware to check if user account is locked
 * Must be used AFTER authenticate middleware
 */
async function checkLocked(req, res, next) {
  try {
    const userId = req.userId;
    
    // Skip check for service accounts or if no userId
    if (!userId || req.user?.isService) {
      return next();
    }
    
    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    // User not found - let it pass, will be handled by route handler
    if (!userDoc.exists) {
      logger.warn('User document not found during locked check', { userId });
      return next();
    }
    
    const userData = userDoc.data();
    
    // Check if account is deleted
    if (userData.deleted === true) {
      logger.warn('Deleted user attempted access', { 
        userId, 
        deletedAt: userData.deletedAt,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        error: 'Account deleted',
        code: 'ACCOUNT_DELETED',
        message: 'Your account has been deleted and no longer exists.',
        deleted: true,
        contactSupport: true
      });
    }
    
    // Check if account is locked
    if (userData.locked === true) {
      logger.warn('Locked user attempted access', { 
        userId, 
        reason: userData.lockReason,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        error: 'Account locked',
        code: 'ACCOUNT_LOCKED',
        message: 'Your account has been locked and cannot access the system.',
        reason: userData.lockReason || 'Please contact support for more information.',
        locked: true,
        contactSupport: true
      });
    }
    
    // Attach user data to request for later use (optional optimization)
    req.userData = userData;
    
    next();
  } catch (error) {
    logger.error('Check locked middleware error', { 
      error: error.message,
      userId: req.userId,
      path: req.path
    });
    
    // Don't block on error - fail open for availability
    // But this should be monitored
    next();
  }
}

/**
 * Optional: Check locked for specific routes only
 * Use this if you want some routes to be accessible even when locked
 */
function checkLockedOptional(req, res, next) {
  checkLocked(req, res, (err) => {
    if (err) {
      // If locked, still continue but mark it
      req.isLocked = true;
    }
    next();
  });
}

module.exports = {
  checkLocked,
  checkLockedOptional
};
