/**
 * Admin API Service
 * Handles all admin panel API calls
 */

import { cache } from '../utils/cache';
import { getApiBaseUrl } from '../utils/config';
import { getAuthHeader, getAccessToken, clearAuthData } from './authService';

const API_BASE_URL = getApiBaseUrl();

// Helper function for API calls with auth
async function apiCall(endpoint, options = {}) {
  const authHeaders = getAuthHeader();
  
  console.log('[adminApi] Making API call:', {
    endpoint,
    method: options.method || 'GET',
    hasAuth: !!authHeaders['Authorization'] || !!authHeaders['X-Admin-Key']
  });
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  console.log('[adminApi] Response received:', {
    endpoint,
    status: response.status,
    ok: response.ok
  });

  // Handle 401 - clear auth and redirect
  if (response.status === 401) {
    console.error('[adminApi] Unauthorized - clearing auth');
    clearAuthData();
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    console.error('[adminApi] API error:', error);
    throw new Error(error.error?.message || error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('[adminApi] Success:', { endpoint, data });
  return data;
}

// Helper to create clean query params (filters out undefined/null/empty values)
function createQueryParams(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  return new URLSearchParams(cleanParams);
}

// ============================================================================
// AUTHENTICATION (Legacy - kept for backward compatibility)
// ============================================================================

export const adminAuth = {
  setAdminKey: (key) => {
    localStorage.setItem('adminKey', key);
  },
  
  getAdminKey: () => {
    return localStorage.getItem('adminKey');
  },
  
  clearAdminKey: () => {
    clearAuthData();
  },
  
  isAuthenticated: () => {
    return !!getAccessToken() || !!localStorage.getItem('adminKey');
  }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notificationsApi = {
  // Get all notifications
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/api/notifications?${params}`);
  },

  // Create notification
  create: async (notification) => {
    return apiCall('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  // Update notification
  update: async (id, updates) => {
    return apiCall(`/api/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete notification
  delete: async (id) => {
    return apiCall(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Send notification immediately
  send: async (id) => {
    return apiCall(`/api/notifications/${id}/send`, {
      method: 'POST',
    });
  },

  // Schedule notification for later
  schedule: async (id, scheduledAt) => {
    return apiCall(`/api/notifications/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt }),
    });
  },

  // Get notification stats
  getStats: async (id) => {
    return apiCall(`/api/notifications/${id}/stats`);
  },

  // Process scheduled notifications (admin trigger)
  processScheduled: async () => {
    return apiCall('/api/notifications/process-scheduled', {
      method: 'POST',
    });
  },

  // Cleanup expired notifications
  cleanupExpired: async () => {
    return apiCall('/api/notifications/cleanup-expired', {
      method: 'POST',
    });
  },

  // Send auto notification (for system events)
  sendAutoNotification: async (templateType, data = {}, targetSegments = []) => {
    return apiCall('/api/notifications/auto-send', {
      method: 'POST',
      body: JSON.stringify({ templateType, data, targetSegments }),
    });
  },
};

// ============================================================================
// USERS
// ============================================================================

export const usersApi = {
  // Get all users (basic)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const cacheKey = `users_${queryParams.toString()}`;
    
    return cache.getOrFetch(
      cacheKey,
      () => apiCall(`/api/admin/users?${queryParams}`),
      2 * 60 * 1000 // 2 minutes
    );
  },

  // Get all users with pagination, search, filters
  getAllAdvanced: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/users/advanced?${queryParams}`);
  },

  // Get user details
  getById: async (id) => {
    const cacheKey = `user_${id}`;
    
    return cache.getOrFetch(
      cacheKey,
      () => apiCall(`/api/admin/users/${id}`),
      2 * 60 * 1000
    );
  },

  // Get user logs
  getLogs: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/users/${id}/logs?${queryParams}`);
  },

  // Get user profiles
  getProfiles: async (id) => {
    return apiCall(`/api/admin/users/${id}/profiles`);
  },

  // Update user info
  update: async (id, data) => {
    cache.delete(`user_${id}`);
    return apiCall(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Lock/Unlock user
  toggleLock: async (id, locked, reason = null) => {
    cache.delete(`user_${id}`);
    return apiCall(`/api/admin/users/${id}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ locked, reason }),
    });
  },

  // Adjust user credits
  adjustCredits: async (id, amount, type, reason) => {
    cache.delete(`user_${id}`);
    return apiCall(`/api/admin/users/${id}/credits`, {
      method: 'PUT',
      body: JSON.stringify({ amount, type, reason }),
    });
  },

  // Delete user
  delete: async (id) => {
    cache.clear();
    return apiCall(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Delete user profile
  deleteProfile: async (userId, profileId) => {
    cache.delete(`user_${userId}`);
    return apiCall(`/api/admin/users/${userId}/profiles/${profileId}`, {
      method: 'DELETE',
    });
  },

  // Send notification to user
  sendNotification: async (id, notification) => {
    return apiCall(`/api/admin/users/${id}/notification`, {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  // Export users
  export: async (format = 'json') => {
    return apiCall(`/api/admin/users/export?format=${format}`);
  },

  // Bulk lock/unlock users
  bulkLock: async (userIds, locked, reason = null) => {
    cache.clear();
    return apiCall('/api/admin/bulk/lock', {
      method: 'POST',
      body: JSON.stringify({ userIds, locked, reason }),
    });
  },

  // Bulk delete users
  bulkDelete: async (userIds) => {
    cache.clear();
    return apiCall('/api/admin/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ userIds, confirm: 'DELETE' }),
    });
  },
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const analyticsApi = {
  // Get overview
  getOverview: async () => {
    return apiCall('/api/admin/analytics/overview');
  },
};

// ============================================================================
// ORDERS & PAYMENTS
// ============================================================================

export const ordersApi = {
  // Get all orders
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/orders?${queryParams}`);
  },

  // Get order details
  getById: async (id) => {
    return apiCall(`/api/admin/orders/${id}`);
  },

  // Get subscriptions
  getSubscriptions: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/subscriptions?${queryParams}`);
  },

  // Get revenue stats
  getRevenueStats: async (days = 30) => {
    return apiCall(`/api/admin/revenue?days=${days}`);
  },
};

// ============================================================================
// SETTINGS
// ============================================================================

export const settingsApi = {
  // Get settings
  get: async () => {
    return apiCall('/api/admin/settings');
  },

  // Update settings
  update: async (settings) => {
    return apiCall('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// ============================================================================
// TRANSLATION
// ============================================================================

export const translationApi = {
  // Auto-translate text using Gemini
  // sourceLang defaults to 'en' (English as default source)
  translate: async (text, sourceLang = 'en', targetLang = 'vi') => {
    try {
      const result = await apiCall('/api/admin/translate', {
        method: 'POST',
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang
        }),
      });

      return {
        translations: result.translations || { [targetLang]: text }
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },
};

// ============================================================================
// ADVANCED ANALYTICS
// ============================================================================

export const advancedAnalyticsApi = {
  // Get user analytics
  getUserAnalytics: async (days = 30) => {
    return apiCall(`/api/admin/analytics/users?days=${days}`);
  },

  // Get usage analytics
  getUsageAnalytics: async () => {
    return apiCall('/api/admin/analytics/usage');
  },
};

// ============================================================================
// SYSTEM LOGS
// ============================================================================

export const logsApi = {
  // Get all logs
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/logs?${queryParams}`);
  },

  // Clear logs
  clear: async (olderThan = null) => {
    const params = olderThan ? `?olderThan=${olderThan}` : '';
    return apiCall(`/api/admin/logs${params}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// USER ACTIVITY LOGS
// ============================================================================

export const activityLogsApi = {
  // Get all activity logs (admin overview)
  getAll: async (params = {}) => {
    const queryParams = createQueryParams(params);
    return apiCall(`/api/admin/activity-logs?${queryParams}`);
  },

  // Get activity statistics
  getStatistics: async (days = 7) => {
    return apiCall(`/api/admin/activity-logs/statistics?days=${days}`);
  },

  // Get user activity logs
  getUserLogs: async (userId, params = {}) => {
    const queryParams = createQueryParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}?${queryParams}`);
  },

  // Get user activity summary
  getUserSummary: async (userId, params = {}) => {
    const queryParams = createQueryParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}/summary?${queryParams}`);
  },

  // Get user credit transactions
  getUserCredits: async (userId, params = {}) => {
    const queryParams = createQueryParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}/credits?${queryParams}`);
  },

  // Get user feature usage
  getUserFeatures: async (userId, params = {}) => {
    const queryParams = createQueryParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}/features?${queryParams}`);
  },

  // Cleanup old logs
  cleanup: async (daysToKeep = 90) => {
    return apiCall('/api/admin/activity-logs/cleanup', {
      method: 'POST',
      body: JSON.stringify({ daysToKeep }),
    });
  },

  // Debug endpoint to check collection status
  debug: async () => {
    return apiCall('/api/admin/activity-logs/debug');
  },
};

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export const supportApi = {
  // Get all tickets
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const cacheKey = `support_${queryParams.toString()}`;
    
    return cache.getOrFetch(
      cacheKey,
      () => apiCall(`/api/support?${queryParams}`),
      1 * 60 * 1000 // 1 minute
    );
  },

  // Get ticket details
  getById: async (id) => {
    const cacheKey = `support_ticket_${id}`;
    
    return cache.getOrFetch(
      cacheKey,
      () => apiCall(`/api/support/${id}`),
      1 * 60 * 1000
    );
  },

  // Get statistics
  getStatistics: async () => {
    return cache.getOrFetch(
      'support_statistics',
      () => apiCall('/api/support/statistics'),
      2 * 60 * 1000
    );
  },

  // Update ticket status
  updateStatus: async (id, status) => {
    const result = await apiCall(`/api/support/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    
    // Invalidate cache
    cache.delete(`support_ticket_${id}`);
    cache.clear(); // Clear all support cache
    
    return result;
  },

  // Reply to ticket
  reply: async (id, data) => {
    const result = await apiCall(`/api/support/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalidate cache
    cache.delete(`support_ticket_${id}`);
    
    return result;
  },

  // Delete ticket
  delete: async (id) => {
    const result = await apiCall(`/api/support/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate cache
    cache.clear();
    
    return result;
  },
};

// ============================================================================
// EMAIL CONFIGURATION API
// ============================================================================

export const emailConfigApi = {
  // Get email configuration
  get: async () => {
    return apiCall('/api/admin/email-config');
  },
  
  // Save email configuration
  save: async (config) => {
    return apiCall('/api/admin/email-config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
  
  // Test email
  test: async (testEmail) => {
    return apiCall('/api/admin/test-email', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  },
};

// Legacy alias for backward compatibility
export const debugApi = {
  testEmail: async (testEmail = null) => {
    return emailConfigApi.test(testEmail);
  },
};

// ============================================================================
// ENVIRONMENT CONFIGURATION API
// ============================================================================

export const envConfigApi = {
  // Get environment variable definitions
  getDefinitions: async () => {
    return apiCall('/api/admin/env-config/definitions');
  },
  
  // Get all environment configs
  getAll: async () => {
    return apiCall('/api/admin/env-config');
  },
  
  // Get environment config by type
  get: async (type) => {
    return apiCall(`/api/admin/env-config/${type}`);
  },
  
  // Save environment config
  save: async (type, variables) => {
    return apiCall(`/api/admin/env-config/${type}`, {
      method: 'PUT',
      body: JSON.stringify({ variables }),
    });
  },
  
  // Get custom variables
  getCustomVariables: async () => {
    return apiCall('/api/admin/env-config/custom/variables');
  },
  
  // Add custom variable
  addCustomVariable: async (variable) => {
    return apiCall('/api/admin/env-config/custom/variables', {
      method: 'POST',
      body: JSON.stringify(variable),
    });
  },
  
  // Delete custom variable
  deleteCustomVariable: async (target, key) => {
    return apiCall(`/api/admin/env-config/custom/variables/${target}/${key}`, {
      method: 'DELETE',
    });
  },
  
  // Export all configs
  exportAll: async () => {
    return apiCall('/api/admin/env-config/export/all');
  },
  
  // Refresh main backend config
  refreshMainBackend: async () => {
    // This is handled automatically when saving, but can be called manually
    return apiCall('/api/admin/env-config/refresh-main-backend', {
      method: 'POST',
    });
  },
};

// ============================================================================
// BACKUP API
// ============================================================================

export const backupApi = {
  // Create backup now
  create: async () => {
    return apiCall('/api/backup/create', {
      method: 'POST',
    });
  },

  // List all backups
  list: async () => {
    return apiCall('/api/backup/list');
  },

  // Get download URL for a backup
  getDownloadUrl: async (filename) => {
    return apiCall(`/api/backup/download-url/${filename}`);
  },

  // Download backup directly
  download: async (filename) => {
    const authHeaders = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/backup/download/${filename}`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  // Import backup
  import: async (backupData) => {
    return apiCall('/api/backup/import', {
      method: 'POST',
      body: JSON.stringify({ backupData }),
    });
  },

  // Cleanup old backups
  cleanup: async (keepCount = 10) => {
    return apiCall(`/api/backup/cleanup?keep=${keepCount}`, {
      method: 'DELETE',
    });
  },

  // Get storage statistics
  getStorageStats: async () => {
    return apiCall('/api/backup/storage-stats');
  },
};
