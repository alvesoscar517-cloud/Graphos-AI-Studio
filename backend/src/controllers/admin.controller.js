/**
 * Admin Controller
 * Handles admin panel operations
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const geminiService = require('../services/gemini.service');
const logger = require('../utils/logger');

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
      status: doc.data().status
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

// Get overview analytics
exports.getOverview = async (req, res) => {
  try {
    const [usersSnapshot, profilesSnapshot] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('voice_profiles').count().get()
    ]);
    
    res.json({
      success: true,
      overview: {
        totalUsers: usersSnapshot.data().count,
        totalProfiles: profilesSnapshot.data().count,
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
    const allUsersSnapshot = await db.collection('users').get();
    const tierDistribution = { free: 0, premium: 0, enterprise: 0 };
    
    allUsersSnapshot.docs.forEach(doc => {
      const tier = doc.data().tier || 'free';
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });
    
    res.json({
      success: true,
      analytics: {
        tierDistribution,
        totalUsers: allUsersSnapshot.size
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
    const usersSnapshot = await db.collection('users').get();
    
    let totalProfiles = 0;
    let totalAnalyses = 0;
    let totalRewrites = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const usage = doc.data().usage || {};
      totalProfiles += usage.profilesCount || 0;
      totalAnalyses += usage.analysesCount || 0;
      totalRewrites += usage.rewritesCount || 0;
    });
    
    res.json({
      success: true,
      analytics: {
        totalProfiles,
        totalAnalyses,
        totalRewrites
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

module.exports = exports;
