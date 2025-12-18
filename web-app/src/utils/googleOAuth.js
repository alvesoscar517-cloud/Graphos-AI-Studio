/**
 * Google OAuth 2.0 Module for Web App
 * 
 * Provides direct Google OAuth authentication using popup flow.
 * This replaces Firebase Auth to match Chrome Extension behavior.
 * 
 * Uses Google Identity Services (GIS) library for OAuth 2.0
 */

import { logger } from './logger'
import { secureGet, secureSet, secureRemove } from './authStorage'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.file'
].join(' ')

// Storage keys
const OAUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'google_access_token',
  TOKEN_EXPIRY: 'google_token_expiry',
  USER_INFO: 'google_user_info'
}

/**
 * Error codes for authentication failures
 */
export const AUTH_ERROR_CODES = {
  POPUP_BLOCKED: 'POPUP_BLOCKED',
  POPUP_CLOSED: 'POPUP_CLOSED',
  OAUTH_FAILED: 'OAUTH_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NO_CLIENT_ID: 'NO_CLIENT_ID'
}

let tokenClient = null
let isGsiLoaded = false

/**
 * Load Google Identity Services library
 */
function loadGoogleIdentityServices() {
  return new Promise((resolve, reject) => {
    if (isGsiLoaded && window.google?.accounts?.oauth2) {
      resolve()
      return
    }

    // Check if already loading
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          isGsiLoaded = true
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded)
        reject(new Error('Google Identity Services load timeout'))
      }, 10000)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      isGsiLoaded = true
      resolve()
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'))
    }
    
    document.head.appendChild(script)
  })
}

/**
 * Initialize token client for OAuth
 */
async function initTokenClient() {
  if (tokenClient) return tokenClient
  
  await loadGoogleIdentityServices()
  
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID not configured')
  }
  
  return new Promise((resolve) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: () => {}, // Will be set per request
    })
    resolve(tokenClient)
  })
}

/**
 * Sign in with Google using OAuth popup
 * 
 * @returns {Promise<{success: boolean, userInfo?: object, accessToken?: string, error?: string, code?: string}>}
 */
export async function signInWithGoogleOAuth() {
  try {
    if (!GOOGLE_CLIENT_ID) {
      logger.error('GoogleOAuth', 'Google Client ID not configured')
      return {
        success: false,
        error: 'Google Client ID not configured. Please check VITE_GOOGLE_CLIENT_ID in .env',
        code: AUTH_ERROR_CODES.NO_CLIENT_ID
      }
    }

    logger.log('[GoogleOAuth] Starting Google sign-in...')
    
    await initTokenClient()
    
    return new Promise((resolve) => {
      tokenClient.callback = async (tokenResponse) => {
        if (tokenResponse.error) {
          logger.error('GoogleOAuth', 'Token error', tokenResponse)
          
          let code = AUTH_ERROR_CODES.OAUTH_FAILED
          let message = tokenResponse.error_description || tokenResponse.error
          
          if (tokenResponse.error === 'popup_closed_by_user') {
            code = AUTH_ERROR_CODES.POPUP_CLOSED
            message = 'Sign-in was cancelled.'
          } else if (tokenResponse.error === 'popup_blocked_by_browser') {
            code = AUTH_ERROR_CODES.POPUP_BLOCKED
            message = 'Popup was blocked. Please allow popups for this site.'
          }
          
          resolve({
            success: false,
            error: message,
            code
          })
          return
        }
        
        const accessToken = tokenResponse.access_token
        const expiresIn = tokenResponse.expires_in || 3600
        
        // Store token
        const expiryTime = Date.now() + expiresIn * 1000
        secureSet(OAUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        secureSet(OAUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
        
        // Get user info
        try {
          const userInfo = await fetchGoogleUserInfo(accessToken)
          secureSet(OAUTH_STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
          
          logger.log('[GoogleOAuth] Sign-in successful:', userInfo.email)
          
          resolve({
            success: true,
            userInfo,
            accessToken
          })
        } catch (error) {
          logger.error('GoogleOAuth', 'Failed to get user info', error)
          resolve({
            success: false,
            error: 'Failed to get user information',
            code: AUTH_ERROR_CODES.NETWORK_ERROR
          })
        }
      }
      
      // Request access token (opens popup)
      tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  } catch (error) {
    logger.error('GoogleOAuth', 'Sign-in failed', error)
    return {
      success: false,
      error: error.message,
      code: AUTH_ERROR_CODES.UNKNOWN_ERROR
    }
  }
}

/**
 * Fetch Google user info using access token
 */
async function fetchGoogleUserInfo(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.status}`)
  }
  
  const data = await response.json()
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    emailVerified: data.verified_email
  }
}

/**
 * Get stored Google access token (if valid)
 * 
 * @returns {string|null} Access token or null if expired/not found
 */
export function getStoredGoogleToken() {
  const token = secureGet(OAUTH_STORAGE_KEYS.ACCESS_TOKEN)
  const expiry = secureGet(OAUTH_STORAGE_KEYS.TOKEN_EXPIRY)
  
  if (!token || !expiry) return null
  
  const expiryTime = parseInt(expiry, 10)
  // Token valid if more than 5 minutes remaining
  if (Date.now() < expiryTime - 5 * 60 * 1000) {
    return token
  }
  
  // Token expired, clear it
  clearGoogleAuth()
  return null
}

/**
 * Get Google access token for API calls
 * Returns stored token if valid, otherwise throws NEED_GOOGLE_AUTH
 * 
 * @returns {Promise<string>} Access token
 * @throws {Error} NEED_GOOGLE_AUTH if no valid token
 */
export async function getGoogleAccessToken() {
  const token = getStoredGoogleToken()
  if (token) return token
  
  throw new Error('NEED_GOOGLE_AUTH')
}

/**
 * Request fresh Google authorization (for Drive access etc.)
 * 
 * @returns {Promise<string>} Access token
 */
export async function requestGoogleAuth() {
  const result = await signInWithGoogleOAuth()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to get Google authorization')
  }
  
  return result.accessToken
}

/**
 * Get stored user info
 * 
 * @returns {object|null} User info or null
 */
export function getStoredUserInfo() {
  const userInfoStr = secureGet(OAUTH_STORAGE_KEYS.USER_INFO)
  if (!userInfoStr) return null
  
  try {
    return JSON.parse(userInfoStr)
  } catch {
    return null
  }
}

/**
 * Clear all Google OAuth data
 */
export function clearGoogleAuth() {
  secureRemove(OAUTH_STORAGE_KEYS.ACCESS_TOKEN)
  secureRemove(OAUTH_STORAGE_KEYS.TOKEN_EXPIRY)
  secureRemove(OAUTH_STORAGE_KEYS.USER_INFO)
  
  // Revoke token if Google API is loaded
  if (window.google?.accounts?.oauth2) {
    const token = secureGet(OAUTH_STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      window.google.accounts.oauth2.revoke(token, () => {
        logger.log('[GoogleOAuth] Token revoked')
      })
    }
  }
  
  logger.log('[GoogleOAuth] Auth cleared')
}

/**
 * Sign out from Google
 */
export async function signOutGoogle() {
  clearGoogleAuth()
  return { success: true }
}

/**
 * Check if user is signed in with Google
 */
export function isSignedInWithGoogle() {
  return !!getStoredGoogleToken()
}

export default {
  signInWithGoogleOAuth,
  getGoogleAccessToken,
  requestGoogleAuth,
  getStoredGoogleToken,
  getStoredUserInfo,
  clearGoogleAuth,
  signOutGoogle,
  isSignedInWithGoogle,
  AUTH_ERROR_CODES,
  OAUTH_STORAGE_KEYS
}
