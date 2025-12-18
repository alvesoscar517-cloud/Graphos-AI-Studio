/**
 * Google Drive Service for Web App
 * 
 * Provides Google Drive integration using direct OAuth 2.0.
 * This matches Chrome Extension behavior (chrome.identity).
 * 
 * Requirements: 5.1, 5.2, 8.3
 */

import { logger } from '../utils/logger'
import { secureGet, secureSet, secureRemove } from '../utils/authStorage'
import { 
  getGoogleAccessToken as getOAuthToken, 
  requestGoogleAuth as requestOAuth
} from '../utils/googleOAuth'

// Storage keys for Drive-specific data
const DRIVE_STORAGE_KEYS = {
  FOLDER_ID: 'drive_folder_id',
  CONVERSATIONS_FOLDER_ID: 'drive_conversations_folder_id'
}

// Drive folder names
const NOTES_FOLDER_NAME = 'Graphos AI Studio'
const CONVERSATIONS_FOLDER_NAME = 'Graphos AI Workspace'

/**
 * Get Google access token for Drive operations
 * Uses direct OAuth (same token as sign-in, includes Drive scope)
 * 
 * @returns {Promise<string>} Access token
 * @throws {Error} NEED_GOOGLE_AUTH if no token available
 */
export async function getGoogleAccessTokenWeb() {
  return getOAuthToken()
}

/**
 * Request Google authorization for Drive access
 * Opens OAuth popup to get Drive permissions
 * 
 * @returns {Promise<string>} Access token
 */
export async function requestGoogleAuthWeb() {
  logger.log('[DriveWeb] Requesting Google authorization...')
  const token = await requestOAuth()
  logger.log('[DriveWeb] Google authorization successful')
  return token
}


/**
 * Clear Drive folder IDs from storage
 * Note: OAuth tokens are managed by googleOAuth module
 */
export function clearDriveTokens() {
  secureRemove(DRIVE_STORAGE_KEYS.FOLDER_ID)
  secureRemove(DRIVE_STORAGE_KEYS.CONVERSATIONS_FOLDER_ID)
}

/**
 * Get or create app folder in Google Drive
 * 
 * @returns {Promise<string>} Folder ID
 */
export async function getOrCreateAppFolderWeb() {
  try {
    let token
    try {
      token = await getGoogleAccessTokenWeb()
    } catch {
      token = await requestGoogleAuthWeb()
    }

    // Check cached folder ID
    const cachedFolderId = secureGet(DRIVE_STORAGE_KEYS.FOLDER_ID)
    if (cachedFolderId) {
      return cachedFolderId
    }

    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${NOTES_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!searchResponse.ok) {
      if (searchResponse.status === 403 || searchResponse.status === 401) {
        clearDriveTokens()
        throw new Error('NEED_REAUTH')
      }
      throw new Error(`Failed to search folder: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id
      secureSet(DRIVE_STORAGE_KEYS.FOLDER_ID, folderId)
      return folderId
    }

    // Create new folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: NOTES_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.status}`)
    }

    const createData = await createResponse.json()
    secureSet(DRIVE_STORAGE_KEYS.FOLDER_ID, createData.id)

    return createData.id
  } catch (error) {
    logger.error('DriveWeb', 'Error with Drive folder', error)
    throw error
  }
}

/**
 * Get or create workspace conversations folder
 * 
 * @returns {Promise<string>} Folder ID
 */
export async function getOrCreateConversationsFolderWeb() {
  try {
    let token
    try {
      token = await getGoogleAccessTokenWeb()
    } catch {
      token = await requestGoogleAuthWeb()
    }

    // Check cached folder ID
    const cachedFolderId = secureGet(DRIVE_STORAGE_KEYS.CONVERSATIONS_FOLDER_ID)
    if (cachedFolderId) {
      return cachedFolderId
    }

    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${CONVERSATIONS_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!searchResponse.ok) {
      if (searchResponse.status === 403 || searchResponse.status === 401) {
        clearDriveTokens()
        throw new Error('NEED_REAUTH')
      }
      throw new Error(`Failed to search folder: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id
      secureSet(DRIVE_STORAGE_KEYS.CONVERSATIONS_FOLDER_ID, folderId)
      return folderId
    }

    // Create new folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: CONVERSATIONS_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.status}`)
    }

    const createData = await createResponse.json()
    secureSet(DRIVE_STORAGE_KEYS.CONVERSATIONS_FOLDER_ID, createData.id)

    return createData.id
  } catch (error) {
    logger.error('DriveWeb', 'Error with Workspace folder', error)
    throw error
  }
}

export default {
  getGoogleAccessTokenWeb,
  requestGoogleAuthWeb,
  clearDriveTokens,
  getOrCreateAppFolderWeb,
  getOrCreateConversationsFolderWeb,
  DRIVE_STORAGE_KEYS
}
