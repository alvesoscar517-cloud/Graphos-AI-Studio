/**
 * Authentication Service for Admin Panel
 * Handles login, logout, token management
 */

import { getApiBaseUrl } from '../utils/config';

const API_BASE_URL = getApiBaseUrl();

// Token storage keys
const ACCESS_TOKEN_KEY = 'adminAccessToken';
const ADMIN_INFO_KEY = 'adminInfo';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

/**
 * Authentication API calls
 */
export const authApi = {
  /**
   * Check if initial setup is needed
   */
  checkSetup: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-setup`);
    return response.json();
  },

  /**
   * Initial setup - create first admin
   */
  setup: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return response.json();
  },

  /**
   * Login with email/password
   */
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // For cookies
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  /**
   * Legacy login with admin key
   */
  legacyLogin: async (adminKey) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/legacy-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey })
    });
    return response.json();
  },

  /**
   * Refresh access token
   */
  refresh: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // For cookies
    });
    return response.json();
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  },

  /**
   * Get current admin info
   */
  me: async () => {
    const token = getAccessToken();
    if (!token) return { success: false };

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * Change password
   */
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

/**
 * Token management
 */
export function setAuthData(accessToken, admin, expiresIn) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn));
  
  // Also set legacy key for backward compatibility with existing API calls
  localStorage.setItem('adminKey', 'jwt-auth');
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAdminInfo() {
  const info = localStorage.getItem(ADMIN_INFO_KEY);
  return info ? JSON.parse(info) : null;
}

export function isTokenExpired() {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  
  // Consider expired 1 minute before actual expiry
  return Date.now() > (parseInt(expiry) - 60000);
}

export function clearAuthData() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem('adminKey');
}

export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
}

/**
 * Auto refresh token before expiry
 */
let refreshTimer = null;

export function startTokenRefresh() {
  stopTokenRefresh();
  
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
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
          localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + result.expiresIn));
          startTokenRefresh(); // Schedule next refresh
        } else {
          // Refresh failed, clear auth
          clearAuthData();
          window.location.reload();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
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

/**
 * Get authorization header for API calls
 */
export function getAuthHeader() {
  const token = getAccessToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  
  // Fallback to legacy key
  const legacyKey = localStorage.getItem('adminKey');
  if (legacyKey && legacyKey !== 'jwt-auth') {
    return { 'X-Admin-Key': legacyKey };
  }
  
  return {};
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
