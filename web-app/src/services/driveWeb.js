/**
 * Google Drive Service for Web App
 * 
 * Provides Google Drive integration using OAuth 2.0 popup flow.
 * This replaces chrome.identity API used in the Chrome Extension.
 * 
 * Requirements: 5.1, 5.2, 8.3
 */

import { logger } from '../utils/logger'
import { secureGet, secureSet, secureRemove } from '../utils/authStorage'
import { getFirebaseAuth, getGoogleProvider, initializeFirebase } from '../config/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

// Storage keys for Drive tokens
const DRIVE_STORAGE_KEYS = {
  ACCESS_TOKEN: 'drive_access_token',
  TOKEN_EXPIRY: 'drive_token_expiry',
  FOLDER_ID: 'drive_folder_id',
  CONVERSATIONS_FOLDER_ID: 'drive_conversations_folder_id'
}

// Drive folder names
const NOTES_FOLDER_NAME = 'Graphos AI Studio'
const CONVERSATIONS_FOLDER_NAME = 'Graphos AI Workspace'

/**
 * Get Google access token for Drive operations
 * Uses Firebase Auth to get OAuth token with Drive scope
 * 
 * @returns {Promise<string>} Access token
 * @throws {Error} NEED_GOOGLE_AUTH if no token available
 */
export async function getGoogleAccessTokenWeb() {
  // Check for cached token
  const cachedToken = secureGet(DRIVE_STORAGE_KEYS.ACCESS_TOKEN)
  const tokenExpiry = secureGet(DRIVE_STORAGE_KEYS.TOKEN_EXPIRY)
  
  if (cachedToken && tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry, 10)
    // Token valid if more than 5 minutes remaining
    if (Date.now() < expiryTime - 5 * 60 * 1000) {
      return cachedToken
    }
  }
  
  // Need to get fresh token via Firebase Auth
  throw new Error('NEED_GOOGLE_AUTH')
}

/**
 * Request Google authorization for Drive access
 * Opens OAuth popup to get Drive permissions
 * 
 * @returns {Promise<string>} Access token
 */
export async function requestGoogleAuthWeb() {
  try {
    initializeFirebase()
    const auth = getFirebaseAuth()
    
    // Create provider with Drive scope
    const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/drive.file')
    provider.addScope('profile')
    provider.addScope('email')
    
    logger.log('[DriveWeb] Requesting Google authorization...')
    
    const result = await signInWithPopup(auth, provider)
    
    // Get the OAuth access token
    // @ts-ignore - _tokenResponse is internal but contains the OAuth token
    const tokenResponse = result._tokenResponse || {}
    const accessToken = tokenResponse.oauthAccessToken
    
    if (!accessToken) {
      throw new Error('Failed to get Google access token')
    }
    
    // Cache the token (expires in 1 hour typically)
    const expiryTime = Date.now() + 3600 * 1000
    secureSet(DRIVE_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    secureSet(DRIVE_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
    
    logger.log('[DriveWeb] Google authorization successful')
    
    return accessToken
  } catch (error) {
    logger.error('DriveWeb', 'Failed to get Google auth', error)
    throw error
  }
}


/**
 * Clear Drive tokens from storage
 */
export function clearDriveTokens() {
  secureRemove(DRIVE_STORAGE_KEYS.ACCESS_TOKEN)
  secureRemove(DRIVE_STORAGE_KEYS.TOKEN_EXPIRY)
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
