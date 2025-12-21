/**
 * Avatar Service
 * 
 * Handles avatar upload, validation, and storage for email users.
 * Google users use their Google profile picture.
 * 
 * Requirements: 8.1.4, 8.1.5, 8.1.6
 */

import { logger } from '../utils/logger'
import { kyClient } from './api/kyClient'

// Configuration
export const AVATAR_CONFIG = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  TARGET_SIZE: 200, // 200x200 pixels
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  QUALITY: 0.85
}

/**
 * Validate avatar file
 * @param {File} file - File to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAvatarFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!AVATAR_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${AVATAR_CONFIG.ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`
    }
  }

  if (file.size > AVATAR_CONFIG.MAX_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${AVATAR_CONFIG.MAX_SIZE_MB}MB`
    }
  }

  return { valid: true }
}

/**
 * Resize image to target dimensions
 * @param {File} file - Image file
 * @param {number} targetSize - Target width/height in pixels
 * @returns {Promise<string>} - Base64 encoded resized image
 */
export async function resizeImage(file, targetSize = AVATAR_CONFIG.TARGET_SIZE) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas')
        canvas.width = targetSize
        canvas.height = targetSize
        
        const ctx = canvas.getContext('2d')
        
        // Calculate crop dimensions (center crop for square)
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2
        
        // Draw resized image
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize)
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', AVATAR_CONFIG.QUALITY)
        resolve(base64)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Process and upload avatar via backend API
 * @param {File} file - Avatar file
 * @param {string} userId - User ID (not used directly, auth handled by backend)
 * @returns {Promise<{ success: boolean, avatarUrl?: string, error?: string }>}
 */
export async function uploadAvatar(file, userId) {
  try {
    // Validate
    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Resize
    const base64Avatar = await resizeImage(file)
    
    // Upload via backend API (backend uses Admin SDK to write to Firestore)
    const response = await kyClient.post('user/avatar', {
      json: { avatar: base64Avatar }
    }).json()

    if (!response.success) {
      throw new Error(response.error || 'Failed to upload avatar')
    }

    logger.log('[AvatarService] Avatar uploaded for user:', userId)
    
    return { success: true, avatarUrl: response.avatarUrl || base64Avatar }
  } catch (error) {
    logger.error('AvatarService', 'Failed to upload avatar', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove avatar via backend API
 * @param {string} userId - User ID (not used directly, auth handled by backend)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function removeAvatar(userId) {
  try {
    const response = await kyClient.delete('user/avatar').json()

    if (!response.success) {
      throw new Error(response.error || 'Failed to remove avatar')
    }

    logger.log('[AvatarService] Avatar removed for user:', userId)
    
    return { success: true }
  } catch (error) {
    logger.error('AvatarService', 'Failed to remove avatar', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get avatar for user via backend API
 * @param {string} userId - User ID (not used directly, auth handled by backend)
 * @returns {Promise<string|null>} - Avatar URL or null
 */
export async function getAvatar(userId) {
  try {
    const response = await kyClient.get('user/avatar').json()
    
    if (response.success) {
      return response.avatar || null
    }
    
    return null
  } catch (error) {
    logger.error('AvatarService', 'Failed to get avatar', error)
    return null
  }
}

export default {
  validateAvatarFile,
  resizeImage,
  uploadAvatar,
  removeAvatar,
  getAvatar,
  AVATAR_CONFIG
}
