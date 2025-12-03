/**
 * Notification Controller
 * Handles user notification operations
 */

const { db, FieldValue } = require('../config/firebase');
const logger = require('../utils/logger');
const { createLocalizer } = require('../utils/localized-messages.util');

exports.getUserNotifications = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { unread_only = false, limit = 50 } = req.query;
    // Use user_id from query OR from auth middleware (req.userId)
    const user_id = req.query.user_id || req.userId;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    let snapshot;
    
    try {
      // Try with composite index first (faster)
      let query = db.collection('user_notifications')
        .where('userId', '==', user_id);
      
      if (unread_only === 'true') {
        query = query.where('read', '==', false);
      }
      
      query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));
      snapshot = await query.get();
    } catch (indexError) {
      // Fallback: query without orderBy, sort in memory
      // This happens when composite index is not yet created
      console.warn('[WARN] Composite index not available, using fallback query:', indexError.message);
      
      let query = db.collection('user_notifications')
        .where('userId', '==', user_id);
      
      snapshot = await query.get();
    }
    
    const now = new Date();
    
    let notifications = snapshot.docs
      .map(doc => {
        const data = doc.data();
        // Handle both Timestamp and string formats for createdAt/expiresAt
        let createdAt = data.createdAt;
        if (createdAt?.toDate) {
          createdAt = createdAt.toDate().toISOString();
        } else if (typeof createdAt === 'string') {
          createdAt = createdAt;
        }
        
        let expiresAt = data.expiresAt;
        if (expiresAt?.toDate) {
          expiresAt = expiresAt.toDate().toISOString();
        } else if (typeof expiresAt === 'string') {
          expiresAt = expiresAt;
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt,
          expiresAt
        };
      })
      .filter(notif => {
        // NOTE: Notifications are now PERMANENT - no expiry filtering
        // Only filter by read status if needed (fallback case)
        if (unread_only === 'true' && notif.read) return false;
        return true;
      });
    
    // Sort by createdAt desc (for fallback case)
    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    // Apply limit
    notifications = notifications.slice(0, parseInt(limit));
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Localize notifications based on user language
    // Keep translations object for frontend compatibility
    const localizedNotifications = notifications.map(notif => {
      // If notification has translations, use the appropriate language
      if (notif.translations && notif.translations[l.lang]) {
        return {
          ...notif,
          // Set top-level title/message for backward compatibility
          title: notif.translations[l.lang].title || notif.title,
          message: notif.translations[l.lang].message || notif.message,
          cta: notif.translations[l.lang].cta || notif.cta,
          // Keep translations object for frontend that reads from it
          translations: notif.translations
        };
      }
      return notif;
    });

    res.json({
      success: true,
      notifications: localizedNotifications,
      count: localizedNotifications.length,
      unreadCount,
      language: l.lang
    });
  } catch (error) {
    console.error('[ERROR] Get user notifications error:', error);
    logger.error('Get user notifications error', { 
      userId: req.query?.user_id,
      error: error.message, 
      stack: error.stack,
      code: error.code 
    });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    // Use user_id from body OR from auth middleware (req.userId)
    const user_id = req.body.user_id || req.userId;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const notifRef = db.collection('user_notifications').doc(id);
    const notifDoc = await notifRef.get();
    
    if (!notifDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }
    
    if (notifDoc.data().userId !== user_id) {
      return res.status(403).json({ success: false, ...l.error('forbidden') });
    }
    
    await notifRef.update({
      read: true,
      readAt: new Date()
    });
    
    const notificationId = notifDoc.data().notificationId;
    if (notificationId) {
      await db.collection('notifications').doc(notificationId).update({
        'stats.read': FieldValue.increment(1)
      });
    }
    
    res.json({
      success: true,
      message: l.t('notifications.mark_read')
    });
  } catch (error) {
    console.error('[ERROR] Mark notification as read error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

exports.markAsClicked = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    // Use user_id from body OR from auth middleware (req.userId)
    const user_id = req.body.user_id || req.userId;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const notifRef = db.collection('user_notifications').doc(id);
    const notifDoc = await notifRef.get();
    
    if (!notifDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }
    
    if (notifDoc.data().userId !== user_id) {
      return res.status(403).json({ success: false, ...l.error('forbidden') });
    }
    
    await notifRef.update({
      clicked: true,
      clickedAt: new Date()
    });
    
    const notificationId = notifDoc.data().notificationId;
    if (notificationId) {
      await db.collection('notifications').doc(notificationId).update({
        'stats.clicked': FieldValue.increment(1)
      });
    }
    
    res.json({
      success: true,
      message: l.t('success.updated')
    });
  } catch (error) {
    console.error('[ERROR] Mark notification as clicked error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Delete user notification
exports.deleteNotification = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { id } = req.params;
    // Use user_id from body, query OR from auth middleware (req.userId)
    const user_id = req.body.user_id || req.query.user_id || req.userId;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const notifRef = db.collection('user_notifications').doc(id);
    const notifDoc = await notifRef.get();
    
    if (!notifDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }
    
    if (notifDoc.data().userId !== user_id) {
      return res.status(403).json({ success: false, ...l.error('forbidden') });
    }
    
    await notifRef.delete();
    
    res.json({
      success: true,
      message: l.t('success.deleted')
    });
  } catch (error) {
    console.error('[ERROR] Delete notification error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    // Use user_id from body OR from auth middleware (req.userId)
    const user_id = req.body.user_id || req.userId;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    // Query all user notifications and filter unread in memory
    // This avoids needing composite index
    const allSnapshot = await db.collection('user_notifications')
      .where('userId', '==', user_id)
      .get();
    
    // Filter unread notifications
    const unreadDocs = allSnapshot.docs.filter(doc => doc.data().read === false);
    
    if (unreadDocs.length === 0) {
      return res.json({ success: true, message: 'No unread notifications', updated: 0 });
    }
    
    // Use unreadDocs instead of snapshot
    const snapshot = { docs: unreadDocs, empty: false, size: unreadDocs.length };
    
    const batch = db.batch();
    const now = new Date();
    const notificationIds = new Set();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true, readAt: now });
      const notifId = doc.data().notificationId;
      if (notifId) notificationIds.add(notifId);
    });
    
    await batch.commit();
    
    // Update stats for each notification
    for (const notifId of notificationIds) {
      try {
        const count = snapshot.docs.filter(d => d.data().notificationId === notifId).length;
        await db.collection('notifications').doc(notifId).update({
          'stats.read': FieldValue.increment(count)
        });
      } catch (err) {
        // Ignore if notification doesn't exist
      }
    }
    
    res.json({
      success: true,
      message: l.t('notifications.mark_all_read'),
      updated: snapshot.size
    });
  } catch (error) {
    console.error('[ERROR] Mark all as read error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    // Use user_id from query OR from auth middleware (req.userId)
    const user_id = req.query.user_id || req.userId;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    // Query all user notifications and count unread
    const snapshot = await db.collection('user_notifications')
      .where('userId', '==', user_id)
      .where('read', '==', false)
      .get();
    
    res.json({
      success: true,
      count: snapshot.size
    });
  } catch (error) {
    console.error('[ERROR] Get unread count error:', error);
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

module.exports = exports;
