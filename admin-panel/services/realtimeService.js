/**
 * Firestore Realtime Service for Admin Panel
 * Provides real-time data synchronization to reduce API calls
 */

import { cache } from '../utils/cache';

const API_BASE_URL = 'https://ai-backend-admin-472729326429.us-central1.run.app';

// Get admin key from localStorage
const getAdminKey = () => localStorage.getItem('adminKey') || '';

// Store for active listeners and their callbacks
const listeners = new Map();
const callbacks = new Map();

// EventSource connections
let statsEventSource = null;
let supportEventSource = null;

// Reconnection settings
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

/**
 * Initialize realtime connection for admin stats
 * Uses Server-Sent Events (SSE) for real-time updates
 */
export function subscribeToStats(onUpdate) {
  const adminKey = getAdminKey();
  if (!adminKey) {
    console.warn('No admin key found, skipping realtime subscription');
    return () => {};
  }

  // Close existing connection if any
  if (statsEventSource) {
    statsEventSource.close();
  }

  const url = `${API_BASE_URL}/api/admin/realtime/stats?adminKey=${encodeURIComponent(adminKey)}`;
  
  try {
    statsEventSource = new EventSource(url);
    
    statsEventSource.onopen = () => {
      console.log('✅ Realtime stats connection established');
      reconnectAttempts = 0;
    };

    statsEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update cache with new data
        if (data.type === 'stats_update') {
          cache.set('realtime_stats', data.stats, 5 * 60 * 1000);
          onUpdate(data.stats);
        }
      } catch (err) {
        console.error('Error parsing realtime data:', err);
      }
    };

    statsEventSource.onerror = (error) => {
      console.error('Realtime stats connection error:', error);
      statsEventSource.close();
      
      // Attempt reconnection
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => subscribeToStats(onUpdate), RECONNECT_DELAY);
      }
    };

    // Store callback for later use
    callbacks.set('stats', onUpdate);
    
  } catch (err) {
    console.error('Failed to create EventSource:', err);
  }

  // Return unsubscribe function
  return () => {
    if (statsEventSource) {
      statsEventSource.close();
      statsEventSource = null;
    }
    callbacks.delete('stats');
  };
}

/**
 * Subscribe to support ticket updates
 */
export function subscribeToSupport(onUpdate) {
  const adminKey = getAdminKey();
  if (!adminKey) return () => {};

  if (supportEventSource) {
    supportEventSource.close();
  }

  const url = `${API_BASE_URL}/api/admin/realtime/support?adminKey=${encodeURIComponent(adminKey)}`;
  
  try {
    supportEventSource = new EventSource(url);
    
    supportEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'support_update') {
          cache.set('realtime_support', data, 5 * 60 * 1000);
          onUpdate(data);
        }
      } catch (err) {
        console.error('Error parsing support data:', err);
      }
    };

    supportEventSource.onerror = () => {
      supportEventSource.close();
      setTimeout(() => subscribeToSupport(onUpdate), RECONNECT_DELAY);
    };

    callbacks.set('support', onUpdate);
  } catch (err) {
    console.error('Failed to create support EventSource:', err);
  }

  return () => {
    if (supportEventSource) {
      supportEventSource.close();
      supportEventSource = null;
    }
    callbacks.delete('support');
  };
}

/**
 * Get cached stats or null if not available
 */
export function getCachedStats() {
  return cache.get('realtime_stats');
}

/**
 * Get cached support data or null
 */
export function getCachedSupport() {
  return cache.get('realtime_support');
}

/**
 * Close all realtime connections
 */
export function closeAllConnections() {
  if (statsEventSource) {
    statsEventSource.close();
    statsEventSource = null;
  }
  if (supportEventSource) {
    supportEventSource.close();
    supportEventSource = null;
  }
  callbacks.clear();
  listeners.clear();
}

/**
 * Check if realtime is connected
 */
export function isConnected() {
  return (statsEventSource && statsEventSource.readyState === EventSource.OPEN) ||
         (supportEventSource && supportEventSource.readyState === EventSource.OPEN);
}

export default {
  subscribeToStats,
  subscribeToSupport,
  getCachedStats,
  getCachedSupport,
  closeAllConnections,
  isConnected
};
