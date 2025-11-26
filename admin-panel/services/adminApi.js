/**
 * Admin API Service
 * Handles all admin panel API calls
 */

import { cache } from '../utils/cache';

const API_BASE_URL = 'https://ai-backend-admin-472729326429.us-central1.run.app';

// Get admin key from localStorage or environment
const getAdminKey = () => {
  return localStorage.getItem('adminKey') || '';
};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const adminKey = getAdminKey();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const adminAuth = {
  setAdminKey: (key) => {
    localStorage.setItem('adminKey', key);
  },
  
  getAdminKey: () => {
    return localStorage.getItem('adminKey');
  },
  
  clearAdminKey: () => {
    localStorage.removeItem('adminKey');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('adminKey');
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
  translate: async (text, sourceLang = 'vi', targetLang = 'en') => {
    try {
      // Use Gemini for translation
      const response = await fetch('https://ai-backend-admin-472729326429.us-central1.run.app/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source_lang: sourceLang,
          target_lang: targetLang
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return {
        translations: {
          [targetLang]: data.translated_text
        }
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
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/activity-logs?${queryParams}`);
  },

  // Get activity statistics
  getStatistics: async (days = 7) => {
    return apiCall(`/api/admin/activity-logs/statistics?days=${days}`);
  },

  // Get user activity logs
  getUserLogs: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}?${queryParams}`);
  },

  // Get user activity summary
  getUserSummary: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}/summary?${queryParams}`);
  },

  // Get user credit transactions
  getUserCredits: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}/credits?${queryParams}`);
  },

  // Get user feature usage
  getUserFeatures: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/activity-logs/user/${userId}/features?${queryParams}`);
  },

  // Cleanup old logs
  cleanup: async (daysToKeep = 90) => {
    return apiCall('/api/admin/activity-logs/cleanup', {
      method: 'POST',
      body: JSON.stringify({ daysToKeep }),
    });
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
      () => apiCall(`/api/admin/support?${queryParams}`),
      1 * 60 * 1000 // 1 minute
    );
  },

  // Get ticket details
  getById: async (id) => {
    const cacheKey = `support_ticket_${id}`;
    
    return cache.getOrFetch(
      cacheKey,
      () => apiCall(`/api/admin/support/${id}`),
      1 * 60 * 1000
    );
  },

  // Get statistics
  getStatistics: async () => {
    return cache.getOrFetch(
      'support_statistics',
      () => apiCall('/api/admin/support/statistics'),
      2 * 60 * 1000
    );
  },

  // Update ticket status
  updateStatus: async (id, status) => {
    const result = await apiCall(`/api/admin/support/${id}/status`, {
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
    const result = await apiCall(`/api/admin/support/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalidate cache
    cache.delete(`support_ticket_${id}`);
    
    return result;
  },

  // Delete ticket
  delete: async (id) => {
    const result = await apiCall(`/api/admin/support/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate cache
    cache.clear();
    
    return result;
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
    const adminKey = getAdminKey();
    const response = await fetch(`${API_BASE_URL}/api/backup/download/${filename}`, {
      headers: {
        'X-Admin-Key': adminKey,
      },
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
};
