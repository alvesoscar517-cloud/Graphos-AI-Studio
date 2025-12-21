/**
 * Avatar Controller
 * Handles avatar upload and removal for users
 * 
 * Requirements: 8.1.4, 8.1.5, 8.1.6
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger');
const { createLocalizer } = require('../utils/localized-messages.util');

// Configuration
const AVATAR_CONFIG = {
  MAX_SIZE_BYTES: 500 * 1024, // 500KB (base64 encoded image after resize)
  ALLOWED_PREFIXES: ['data:image/jpeg', 'data:image/png', 'data:image/gif', 'data:image/webp']
};

/**
 * Validate base64 avatar data
 */
function validateAvatarData(base64Data) {
  if (!base64Data) {
    return { valid: false, error: 'No avatar data provided' };
  }

  if (typeof base64Data !== 'string') {
    return { valid: false, error: 'Invalid avatar data format' };
  }

  // Check if it's a valid base64 image
  const isValidPrefix = AVATAR_CONFIG.ALLOWED_PREFIXES.some(prefix => 
    base64Data.startsWith(prefix)
  );

  if (!isValidPrefix) {
    return { valid: false, error: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP' };
  }

  // Check size (base64 string length)
  if (base64Data.length > AVATAR_CONFIG.MAX_SIZE_BYTES * 1.37) { // base64 is ~37% larger
    return { valid: false, error: 'Avatar too large. Maximum size: 500KB' };
  }

  return { valid: true };
}

/**
 * Upload/Update avatar
 * POST /api/user/avatar
 */
exports.uploadAvatar = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const userId = req.userId;
    const { avatar } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Validate avatar data
    const validation = validateAvatarData(avatar);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
    }

    // Update user document with avatar
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    await userRef.update({
      avatar: avatar,
      avatarUpdatedAt: new Date().toISOString()
    });

    logger.info('Avatar uploaded', { userId });

    res.json({
      success: true,
      avatarUrl: avatar,
      message: 'Avatar updated successfully'
    });
  } catch (error) {
    logger.error('Upload avatar error', { error: error.message, userId: req.userId });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload avatar' 
    });
  }
};

/**
 * Remove avatar
 * DELETE /api/user/avatar
 */
exports.removeAvatar = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Update user document to remove avatar
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    await userRef.update({
      avatar: null,
      avatarUpdatedAt: new Date().toISOString()
    });

    logger.info('Avatar removed', { userId });

    res.json({
      success: true,
      message: 'Avatar removed successfully'
    });
  } catch (error) {
    logger.error('Remove avatar error', { error: error.message, userId: req.userId });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove avatar' 
    });
  }
};

/**
 * Get avatar
 * GET /api/user/avatar
 */
exports.getAvatar = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      avatar: userData.avatar || null,
      avatarUpdatedAt: userData.avatarUpdatedAt || null
    });
  } catch (error) {
    logger.error('Get avatar error', { error: error.message, userId: req.userId });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get avatar' 
    });
  }
};
