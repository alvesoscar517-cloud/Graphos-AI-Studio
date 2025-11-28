/**
 * Share Controller
 * Handles sharing of notes and conversations
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');
const { createLocalizer } = require('../utils/localized-messages.util');

/**
 * Create a shareable link for content
 */
exports.createShare = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { type, title, content, messages, metadata } = req.body;

    if (!type || !title) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    if (type === 'note' && !content) {
      return res.status(400).json({ success: false, ...l.error('invalid_input'), details: 'Content is required for notes' });
    }

    if (type === 'conversation' && (!messages || !Array.isArray(messages))) {
      return res.status(400).json({ success: false, ...l.error('invalid_input'), details: 'Messages array is required for conversations' });
    }

    // Generate unique share ID
    const shareId = uuidv4();
    
    // Create share document
    const shareData = {
      shareId,
      type, // 'note' or 'conversation'
      title,
      content: type === 'note' ? content : null,
      messages: type === 'conversation' ? messages : null,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      viewCount: 0,
      expiresAt: null // Can be set for temporary shares
    };

    // Save to Firestore
    await db.collection('shares').doc(shareId).set(shareData);

    console.log(`[SUCCESS] Share created: ${shareId} (${type})`);

    // Return share URL
    const shareUrl = `${process.env.EXTENSION_URL || 'https://chromewebstore.google.com/detail/your-extension-id'}?share=${shareId}`;

    res.json({
      success: true,
      shareId,
      shareUrl,
      type,
      title,
      message: l.t('success.created')
    });

  } catch (error) {
    console.error('[ERROR] Share creation error:', error);
    res.status(500).json({ 
      success: false,
      ...l.error('server_error'),
      details: error.message 
    });
  }
};

/**
 * Get shared content by ID
 */
exports.getShare = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    // Get share document
    const shareDoc = await db.collection('shares').doc(shareId).get();

    if (!shareDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const shareData = shareDoc.data();

    // Check if expired
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, ...l.error('not_found'), details: 'Share has expired' });
    }

    // Increment view count
    await db.collection('shares').doc(shareId).update({
      viewCount: (shareData.viewCount || 0) + 1,
      lastViewedAt: new Date().toISOString()
    });

    console.log(`[SUCCESS] Share accessed: ${shareId} (views: ${shareData.viewCount + 1})`);

    // Return share data
    res.json({
      success: true,
      shareId: shareData.shareId,
      type: shareData.type,
      title: shareData.title,
      content: shareData.content,
      messages: shareData.messages,
      metadata: shareData.metadata,
      createdAt: shareData.createdAt
    });

  } catch (error) {
    console.error('[ERROR] Share retrieval error:', error);
    res.status(500).json({ 
      success: false,
      ...l.error('server_error'),
      details: error.message 
    });
  }
};

/**
 * Delete a share
 */
exports.deleteShare = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    await db.collection('shares').doc(shareId).delete();

    console.log(`[SUCCESS] Share deleted: ${shareId}`);

    res.json({ success: true, message: l.t('success.deleted') });

  } catch (error) {
    console.error('[ERROR] Share deletion error:', error);
    res.status(500).json({ 
      success: false,
      ...l.error('server_error'),
      details: error.message 
    });
  }
};

module.exports = exports;
