/**
 * Admin API Service
 * Handles all admin panel API calls
 */

import { cache } from '../utils/cache';

const API_BASE_URL = 'https://ai-authenticator-472729326429.us-central1.run.app';

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
    return apiCall(`/api/admin/notifications?${params}`);
  },

  // Create notification
  create: async (notification) => {
    return apiCall('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  // Update notification
  update: async (id, updates) => {
    return apiCall(`/api/admin/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete notification
  delete: async (id) => {
    return apiCall(`/api/admin/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Send notification
  send: async (id) => {
    return apiCall(`/api/admin/notifications/${id}/send`, {
      method: 'POST',
    });
  },

  // Get notification stats
  getStats: async (id) => {
    return apiCall(`/api/admin/notifications/${id}/stats`);
  },
};

// ============================================================================
// USERS
// ============================================================================

export const usersApi = {
  // Get all users
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const cacheKey = `users_${queryParams.toString()}`;
    
    return cache.getOrFetch(
      cacheKey,
      () => apiCall(`/api/admin/users?${queryParams}`),
      2 * 60 * 1000 // 2 minutes
    );
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

  // Lock/Unlock user
  toggleLock: async (id, locked, reason = null) => {
    return apiCall(`/api/admin/users/${id}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ locked, reason }),
    });
  },

  // Delete user
  delete: async (id) => {
    return apiCall(`/api/admin/users/${id}`, {
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
      const response = await fetch('https://ai-authenticator-472729326429.us-central1.run.app/api/translate', {
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
