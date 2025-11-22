/**
 * Notification Controller
 * Handles user notification operations
 */

const { db, FieldValue } = require('../config/firebase');
const logger = require('../utils/logger');

exports.getUserNotifications = async (req, res) => {
  try {
    const { user_id, unread_only = false, limit = 50 } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    let query = db.collection('user_notifications')
      .where('userId', '==', user_id)
      .orderBy('createdAt', 'desc');
    
    if (unread_only === 'true') {
      query = query.where('read', '==', false);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const now = new Date();
    
    const notifications = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        expiresAt: doc.data().expiresAt?.toDate().toISOString()
      }))
      .filter(notif => {
        if (notif.expiresAt) {
          return new Date(notif.expiresAt) > now;
        }
        return true;
      });
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount
    });
  } catch (error) {
    console.error('❌ Get user notifications error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const notifRef = db.collection('user_notifications').doc(id);
    const notifDoc = await notifRef.get();
    
    if (!notifDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notifDoc.data().userId !== user_id) {
      return res.status(403).json({ error: 'Unauthorized' });
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
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.markAsClicked = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const notifRef = db.collection('user_notifications').doc(id);
    const notifDoc = await notifRef.get();
    
    if (!notifDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notifDoc.data().userId !== user_id) {
      return res.status(403).json({ error: 'Unauthorized' });
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
      message: 'Notification marked as clicked'
    });
  } catch (error) {
    console.error('❌ Mark notification as clicked error:', error);
    res.status(500).json({ error: String(error) });
  }
};

module.exports = exports;
