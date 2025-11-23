/**
 * Admin Controller
 * Handles admin panel operations
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const geminiService = require('../services/gemini.service');
const logger = require('../utils/logger');
const SystemLogger = require('../utils/systemLogger');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const snapshot = await db.collection('users').limit(parseInt(limit)).get();
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));
    
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDoc = await db.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const profilesSnapshot = await db.collection('voice_profiles')
      .where('userId', '==', id)
      .get();
    
    const profiles = profilesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      status: doc.data().status,
      samplesCount: doc.data().samples?.length || 0
    }));
    
    res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate().toISOString(),
        profiles
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get user logs
exports.getUserLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, type } = req.query;
    
    let query = db.collection('activity_logs')
      .where('userId', '==', id)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));
    
    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error('❌ Get user logs error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Lock/Unlock user
exports.toggleUserLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { locked, reason } = req.body;
    
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.collection('users').doc(id).update({
      locked: locked || false,
      lockReason: reason || null,
      updatedAt: new Date()
    });
    
    // Log activity
    await db.collection('activity_logs').add({
      userId: id,
      type: 'account_status',
      action: locked ? 'locked' : 'unlocked',
      reason: reason || null,
      timestamp: new Date()
    });
    
    // System log
    await SystemLogger.warning(
      'user_lock_toggle',
      `User ${locked ? 'locked' : 'unlocked'}: ${id}`,
      { user: 'admin', data: { userId: id, locked, reason } }
    );
    
    res.json({ 
      success: true, 
      message: locked ? 'User locked successfully' : 'User unlocked successfully' 
    });
  } catch (error) {
    console.error('❌ Toggle user lock error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user's profiles
    const profilesSnapshot = await db.collection('voice_profiles')
      .where('userId', '==', id)
      .get();
    
    const batch = db.batch();
    profilesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user's notifications
    const notifsSnapshot = await db.collection('user_notifications')
      .where('userId', '==', id)
      .get();
    
    notifsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user
    batch.delete(db.collection('users').doc(id));
    
    await batch.commit();
    
    // Log activity
    await db.collection('activity_logs').add({
      userId: id,
      type: 'account_status',
      action: 'deleted',
      timestamp: new Date()
    });
    
    // System log
    await SystemLogger.error(
      'user_deleted',
      `User deleted: ${id}`,
      { user: 'admin', data: { userId: id } }
    );
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Send notification to user
exports.sendUserNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, priority, translations } = req.body;
    
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notificationId = uuidv4();
    const now = new Date();
    
    await db.collection('user_notifications').doc(notificationId).set({
      userId: id,
      notificationId: null,
      type: type || 'info',
      priority: priority || 'medium',
      translations: translations || {},
      read: false,
      clicked: false,
      createdAt: now
    });
    
    // Log activity
    await db.collection('activity_logs').add({
      userId: id,
      type: 'notification',
      action: 'sent',
      notificationId,
      timestamp: now
    });
    
    res.json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('❌ Send user notification error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get overview analytics
exports.getOverview = async (req, res) => {
  try {
    const [usersSnapshot, profilesSnapshot, notificationsSnapshot] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('voice_profiles').count().get(),
      db.collection('notifications').count().get()
    ]);
    
    // Get recent activities
    const activitiesSnapshot = await db.collection('activity_logs')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const recentActivities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));
    
    // Calculate new users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', sevenDaysAgo)
      .count()
      .get();
    
    res.json({
      success: true,
      overview: {
        totalUsers: usersSnapshot.data().count,
        totalProfiles: profilesSnapshot.data().count,
        totalNotifications: notificationsSnapshot.data().count,
        newUsers: newUsersSnapshot.data().count,
        recentActivities,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    
    const allUsersSnapshot = await db.collection('users').get();
    const tierDistribution = { free: 0, premium: 0, enterprise: 0 };
    const userGrowth = [];
    
    // Calculate tier distribution
    allUsersSnapshot.docs.forEach(doc => {
      const tier = doc.data().tier || 'free';
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });
    
    // Calculate user growth from actual user creation dates
    const usersByDate = {};
    
    allUsersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      const createdAt = userData.created_at || userData.createdAt;
      
      if (createdAt) {
        let dateStr;
        if (createdAt.toDate) {
          // Firestore Timestamp
          dateStr = createdAt.toDate().toISOString().split('T')[0];
        } else if (typeof createdAt === 'string') {
          dateStr = new Date(createdAt).toISOString().split('T')[0];
        } else {
          dateStr = new Date(createdAt).toISOString().split('T')[0];
        }
        
        // Only count users within the date range
        const userDate = new Date(dateStr);
        if (userDate >= daysAgo) {
          usersByDate[dateStr] = (usersByDate[dateStr] || 0) + 1;
        }
      }
    });
    
    // Fill in all dates in range (including dates with 0 users)
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      userGrowth.push({
        date: dateStr,
        count: usersByDate[dateStr] || 0
      });
    }
    
    res.json({
      success: true,
      analytics: {
        tierDistribution,
        totalUsers: allUsersSnapshot.size,
        userGrowth,
        newUsers: userGrowth.reduce((sum, day) => sum + day.count, 0)
      }
    });
  } catch (error) {
    console.error('❌ User analytics error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get usage analytics
exports.getUsageAnalytics = async (req, res) => {
  try {
    const [usersSnapshot, profilesSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('voice_profiles').get()
    ]);
    
    let totalProfiles = 0;
    let totalAnalyses = 0;
    let totalRewrites = 0;
    let readyProfiles = 0;
    let pendingProfiles = 0;
    
    // Count from users
    usersSnapshot.docs.forEach(doc => {
      const usage = doc.data().usage || {};
      totalProfiles += usage.profilesCount || 0;
      totalAnalyses += usage.analysesCount || 0;
      totalRewrites += usage.rewritesCount || 0;
    });
    
    // Count profile status
    profilesSnapshot.docs.forEach(doc => {
      const status = doc.data().status;
      if (status === 'ready') readyProfiles++;
      else if (status === 'pending') pendingProfiles++;
    });
    
    const totalUsers = usersSnapshot.size || 1;
    
    res.json({
      success: true,
      analytics: {
        totalProfiles,
        totalAnalyses,
        totalRewrites,
        avgProfilesPerUser: (totalProfiles / totalUsers).toFixed(2),
        avgAnalysesPerUser: (totalAnalyses / totalUsers).toFixed(2),
        profilesByStatus: {
          ready: readyProfiles,
          pending: pendingProfiles
        }
      }
    });
  } catch (error) {
    console.error('❌ Usage analytics error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const settingsDoc = await db.collection('system_settings').doc('settings').get();
    
    const settings = settingsDoc.exists ? settingsDoc.data() : {
      notifications: { enabled: true, defaultLanguage: 'vi' }
    };
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    await db.collection('system_settings').doc('settings').set(settings, { merge: true });
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Translate text
exports.translateText = async (req, res) => {
  try {
    const { text, sourceLang = 'vi', targetLangs = ['en', 'ja'] } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const model = geminiService.vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const translations = {};
    
    for (const targetLang of targetLangs) {
      const prompt = `Translate from ${sourceLang} to ${targetLang}. Return JSON: {"translation": "text"}.\n\n${text}`;
      
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.candidates[0].content.parts[0].text.trim();
        const parsed = JSON.parse(responseText);
        translations[targetLang] = parsed.translation;
      } catch (err) {
        translations[targetLang] = text;
      }
    }
    
    res.json({ success: true, translations });
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Notification management
exports.getNotifications = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let query = db.collection('notifications').orderBy('createdAt', 'desc');
    
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));
    
    res.json({ success: true, notifications, count: notifications.length });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { type, priority, translations, target } = req.body;
    
    const notificationId = uuidv4();
    const now = new Date();
    
    const notification = {
      type: type || 'info',
      priority: priority || 'medium',
      translations: translations || {},
      target: target || { type: 'all' },
      status: 'draft',
      stats: { sent: 0, delivered: 0, read: 0, clicked: 0 },
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection('notifications').doc(notificationId).set(notification);
    
    res.status(201).json({
      success: true,
      notificationId,
      notification: { id: notificationId, ...notification }
    });
  } catch (error) {
    console.error('❌ Create notification error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    await db.collection('notifications').doc(id).update({
      ...updates,
      updatedAt: new Date()
    });
    
    res.json({ success: true, message: 'Notification updated' });
  } catch (error) {
    console.error('❌ Update notification error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.collection('notifications').doc(id).delete();
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notifDoc = await db.collection('notifications').doc(id).get();
    if (!notifDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = notifDoc.data();
    
    // Get target users
    const usersSnapshot = await db.collection('users').get();
    const targetUserIds = usersSnapshot.docs.map(doc => doc.id);
    
    // Create user notifications
    const batch = db.batch();
    const now = new Date();
    
    targetUserIds.forEach(userId => {
      const userNotifId = uuidv4();
      const userNotifRef = db.collection('user_notifications').doc(userNotifId);
      
      batch.set(userNotifRef, {
        userId,
        notificationId: id,
        type: notification.type,
        priority: notification.priority,
        translations: notification.translations,
        read: false,
        clicked: false,
        createdAt: now
      });
    });
    
    batch.update(db.collection('notifications').doc(id), {
      status: 'sent',
      sentAt: now,
      'stats.sent': targetUserIds.length,
      updatedAt: now
    });
    
    await batch.commit();
    
    // System log
    await SystemLogger.success(
      'notification_sent',
      `Notification sent to ${targetUserIds.length} users`,
      { user: 'admin', data: { notificationId: id, recipients: targetUserIds.length } }
    );
    
    res.json({
      success: true,
      message: `Notification sent to ${targetUserIds.length} users`,
      stats: { sent: targetUserIds.length }
    });
  } catch (error) {
    console.error('❌ Send notification error:', error);
    res.status(500).json({ error: String(error) });
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userNotifsSnapshot = await db.collection('user_notifications')
      .where('notificationId', '==', id)
      .get();
    
    let delivered = 0, read = 0, clicked = 0;
    
    userNotifsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      delivered++;
      if (data.read) read++;
      if (data.clicked) clicked++;
    });
    
    res.json({
      success: true,
      stats: {
        delivered,
        read,
        clicked,
        readRate: delivered > 0 ? ((read / delivered) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('❌ Get notification stats error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Get system logs
exports.getSystemLogs = async (req, res) => {
  try {
    const { level, limit = 100 } = req.query;
    
    let query = db.collection('system_logs')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));
    
    if (level && level !== 'all') {
      query = query.where('level', '==', level);
    }
    
    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error('❌ Get system logs error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Clear system logs
exports.clearSystemLogs = async (req, res) => {
  try {
    const { olderThan } = req.query;
    
    let query = db.collection('system_logs');
    
    if (olderThan) {
      const date = new Date(olderThan);
      query = query.where('timestamp', '<', date);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({ success: true, message: 'No logs to clear', deleted: 0 });
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    res.json({ 
      success: true, 
      message: `Cleared ${snapshot.size} logs`,
      deleted: snapshot.size
    });
  } catch (error) {
    console.error('❌ Clear system logs error:', error);
    res.status(500).json({ error: String(error) });
  }
};

module.exports = exports;
