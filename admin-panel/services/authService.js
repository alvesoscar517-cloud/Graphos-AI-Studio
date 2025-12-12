/**
 * Authentication Service for Admin Panel (Simplified)
 * 
 * Features:
 * - JWT token management with auto-refresh
 * - Encrypted storage (consistent with main app)
 * - Single source of truth for admin auth
 */

import logger from '../lib/logger'
import { getApiBaseUrl } from '../utils/config';

const API_BASE_URL = getApiBaseUrl();

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  ADMIN_INFO: 'admin_info',
  TOKEN_EXPIRY: 'admin_token_expiry'
};

// ============================================================================
// SIMPLE ENCRYPTION (consistent with main app)
// ============================================================================

const getEncryptionKey = () => {
  const fingerprint = [
    navigator.userAgent.slice(0, 20),
    navigator.language,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

function encrypt(data) {
  if (!data) return null;
  try {
    const key = getEncryptionKey();
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    let encrypted = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encodeURIComponent(encrypted));
  } catch {
    return null;
  }
}

function decrypt(encryptedData) {
  if (!encryptedData) return null;
  try {
    const key = getEncryptionKey();
    const encrypted = decodeURIComponent(atob(encryptedData));
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch {
    return null;
  }
}

// ============================================================================
// SECURE STORAGE
// ============================================================================

function secureSet(key, value) {
  try {
    const encrypted = key === STORAGE_KEYS.ACCESS_TOKEN ? encrypt(value) : value;
    localStorage.setItem(key, typeof encrypted === 'object' ? JSON.stringify(encrypted) : encrypted);
    return true;
  } catch {
    return false;
  }
}

function secureGet(key) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    if (key === STORAGE_KEYS.ACCESS_TOKEN) {
      return decrypt(value);
    }
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch {
    return null;
  }
}

function secureRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  checkSetup: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-setup`);
    return response.json();
  },

  setup: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  refresh: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  },

  me: async () => {
    const token = getAccessToken();
    if (!token) return { success: false };

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  changePassword: async (currentPassword, newPassword) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.json();
  }
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export function setAuthData(accessToken, admin, expiresIn) {
  secureSet(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  secureSet(STORAGE_KEYS.ADMIN_INFO, admin);
  secureSet(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + expiresIn));
}

export function getAccessToken() {
  return secureGet(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getAdminInfo() {
  return secureGet(STORAGE_KEYS.ADMIN_INFO);
}

export function isTokenExpired() {
  const expiry = secureGet(STORAGE_KEYS.TOKEN_EXPIRY);
  if (!expiry) return true;
  // Consider expired 1 minute before actual expiry
  return Date.now() > (parseInt(expiry) - 60000);
}

export function clearAuthData() {
  secureRemove(STORAGE_KEYS.ACCESS_TOKEN);
  secureRemove(STORAGE_KEYS.ADMIN_INFO);
  secureRemove(STORAGE_KEYS.TOKEN_EXPIRY);
}

export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
}

// ============================================================================
// AUTO REFRESH
// ============================================================================

let refreshTimer = null;

export function startTokenRefresh() {
  stopTokenRefresh();
  
  const expiry = secureGet(STORAGE_KEYS.TOKEN_EXPIRY);
  if (!expiry) return;
  
  const expiryTime = parseInt(expiry);
  const now = Date.now();
  
  // Refresh 2 minutes before expiry
  const refreshTime = expiryTime - now - (2 * 60 * 1000);
  
  if (refreshTime > 0) {
    refreshTimer = setTimeout(async () => {
      try {
        const result = await authApi.refresh();
        if (result.success && result.accessToken) {
          secureSet(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
          secureSet(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + result.expiresIn));
          startTokenRefresh();
        } else {
          // Refresh failed - clear auth and stop (don't reload to avoid loop)
          logger.log('Token refresh failed, clearing auth data');
          clearAuthData();
          stopTokenRefresh();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // On error, clear auth and stop
        clearAuthData();
        stopTokenRefresh();
      }
    }, refreshTime);
  }
}

export function stopTokenRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

// ============================================================================
// AUTH HEADER
// ============================================================================

export function getAuthHeader() {
  const token = getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export default {
  authApi,
  setAuthData,
  getAccessToken,
  getAdminInfo,
  isTokenExpired,
  clearAuthData,
  isAuthenticated,
  startTokenRefresh,
  stopTokenRefresh,
  getAuthHeader
};



