/**
 * useSessionExpired Hook
 * Listens for session expired events and handles re-authentication
 */

import { useEffect, useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { logError } from '../utils/errors'

/**
 * Hook to handle session expiration
 * @param {Object} options
 * @param {Function} options.onExpired - Callback when session expires
 * @param {boolean} options.autoRedirect - Auto redirect to login (default: false)
 */
export function useSessionExpired({ onExpired, autoRedirect = false } = {}) {
  const signOut = useAuthStore((state) => state.signOut)
  
  const handleSessionExpired = useCallback((event) => {
    logError(new Error('Session expired'), { 
      context: 'useSessionExpired', 
      message: event.detail?.message 
    })
    
    // Call custom handler if provided
    if (onExpired) {
      onExpired(event.detail)
    }
    
    // Sign out user
    signOut()
    
    // Auto redirect if enabled
    if (autoRedirect) {
      // For extension, we might want to show login view
      // For web app, redirect to login page
      window.location.hash = '#/login'
    }
  }, [onExpired, autoRedirect, signOut])
  
  useEffect(() => {
    // Listen for session expired events from API client
    window.addEventListener('sessionExpired', handleSessionExpired)
    
    // Listen for account locked events
    window.addEventListener('accountLocked', handleSessionExpired)
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired)
      window.removeEventListener('accountLocked', handleSessionExpired)
    }
  }, [handleSessionExpired])
}

export default useSessionExpired
