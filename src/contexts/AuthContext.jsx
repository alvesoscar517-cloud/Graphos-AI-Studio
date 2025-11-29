/**
 * Auth Context
 * Handles both Google (Chrome extension) and Email authentication
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { AuthError, logError } from '../utils/errors'

const AuthContext = createContext()

// API base URL - use same as main app config
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://ai-authenticator-472729326429.us-central1.run.app'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Auth Provider
 * Supports:
 * - Google authentication via Chrome extension
 * - Email/password authentication via API
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authMethod, setAuthMethod] = useState(null) // 'google' or 'email'
  const [hasGoogleLinked, setHasGoogleLinked] = useState(false)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const clearAuthStorage = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authMethod')
    localStorage.removeItem('user')
    localStorage.removeItem('sessionId')
  }

  const checkAuthentication = async () => {
    try {
      // First check for stored email auth
      const storedToken = localStorage.getItem('authToken')
      const storedMethod = localStorage.getItem('authMethod')
      
      if (storedToken && storedMethod === 'email') {
        // Verify token is still valid
        try {
          const response = await fetch(`${API_BASE_URL}/auth/email/sessions`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          })
          
          if (response.ok) {
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
              setUser(JSON.parse(storedUser))
              setIsAuthenticated(true)
              setAuthMethod('email')
              setIsLoading(false)
              return
            }
          }
        } catch {
          // Token invalid, continue to check Chrome extension
        }
        clearAuthStorage()
      }

      // Check Chrome extension authentication
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        const response = await chrome.runtime.sendMessage({ action: 'checkAuth' })
        setIsAuthenticated(response)
        
        if (response) {
          const userInfo = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
          if (userInfo && userInfo.email) {
            const userId = userInfo.id || `user_${userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
            localStorage.setItem('userId', userId)
            setUser({ ...userInfo, id: userId })
            setAuthMethod('google')
          }
        }
      }
    } catch (error) {
      logError(error, { context: 'checkAuthentication' })
      setError(error.message)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // GOOGLE AUTHENTICATION (Chrome Extension)
  // ============================================================================

  const signIn = async () => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new AuthError('Chrome extension context not available. Please use email authentication.')
      }

      const response = await chrome.runtime.sendMessage({ action: 'signIn' })
      
      if (response && response.success) {
        const userId = response.userInfo.id || `user_${response.userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
        localStorage.setItem('userId', userId)
        setIsAuthenticated(true)
        setUser({ ...response.userInfo, id: userId })
        setAuthMethod('google')
        setError(null)
        return true
      }
      
      throw new AuthError('Sign in failed')
    } catch (error) {
      logError(error, { context: 'signIn' })
      setError(error.message)
      return false
    }
  }

  const signOut = async () => {
    try {
      // If using Chrome extension, sign out from there
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && authMethod === 'google') {
        const response = await chrome.runtime.sendMessage({ action: 'signOut' })
        if (!response.success) {
          throw new AuthError('Sign out failed')
        }
      }
      
      clearAuthStorage()
      setIsAuthenticated(false)
      setUser(null)
      setAuthMethod(null)
      setHasGoogleLinked(false)
      setError(null)
      return true
    } catch (error) {
      logError(error, { context: 'signOut' })
      setError(error.message)
      return false
    }
  }

  // ============================================================================
  // EMAIL AUTHENTICATION
  // ============================================================================

  const signInWithEmail = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Login failed')
      }
      
      // Store auth data
      localStorage.setItem('userId', data.user.userId)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authMethod', 'email')
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setUser(data.user)
      setIsAuthenticated(true)
      setAuthMethod('email')
      setHasGoogleLinked(data.user.hasGoogleLinked || false)
      setError(null)
      
      return true
    } catch (error) {
      logError(error, { context: 'signInWithEmail' })
      // Network error - use error code for i18n
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new AuthError('NETWORK_ERROR')
        networkError.isNetworkError = true
        setError(networkError.message)
        throw networkError
      }
      setError(error.message)
      throw error
    }
  }

  const registerWithEmail = async (email, password, displayName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Registration failed')
      }
      
      return { pendingVerification: true }
    } catch (error) {
      logError(error, { context: 'registerWithEmail' })
      // Network error - use error code for i18n
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new AuthError('NETWORK_ERROR')
        networkError.isNetworkError = true
        throw networkError
      }
      throw error
    }
  }

  const verifyEmail = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Verification failed')
      }
      
      // Store auth data
      localStorage.setItem('userId', data.user.userId)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authMethod', 'email')
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setUser(data.user)
      setIsAuthenticated(true)
      setAuthMethod('email')
      setError(null)
      
      return true
    } catch (error) {
      logError(error, { context: 'verifyEmail' })
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new AuthError('NETWORK_ERROR')
        networkError.isNetworkError = true
        throw networkError
      }
      throw error
    }
  }

  const resendVerificationOTP = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to resend code')
      }
      
      return true
    } catch (error) {
      logError(error, { context: 'resendVerificationOTP' })
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new AuthError('NETWORK_ERROR')
        networkError.isNetworkError = true
        throw networkError
      }
      throw error
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to request reset')
      }
      
      return true
    } catch (error) {
      logError(error, { context: 'requestPasswordReset' })
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new AuthError('NETWORK_ERROR')
        networkError.isNetworkError = true
        throw networkError
      }
      throw error
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to reset password')
      }
      
      return true
    } catch (error) {
      logError(error, { context: 'resetPassword' })
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new AuthError('NETWORK_ERROR')
        networkError.isNetworkError = true
        throw networkError
      }
      throw error
    }
  }

  // ============================================================================
  // PASSWORD & ACCOUNT MANAGEMENT
  // ============================================================================

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to change password')
      }
      
      return true
    } catch (error) {
      logError(error, { context: 'changePassword' })
      throw error
    }
  }

  const deleteAccount = async (password) => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/account`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to delete account')
      }
      
      clearAuthStorage()
      setIsAuthenticated(false)
      setUser(null)
      setAuthMethod(null)
      
      return true
    } catch (error) {
      logError(error, { context: 'deleteAccount' })
      throw error
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const getActiveSessions = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/sessions`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to get sessions')
      }
      
      return data.sessions
    } catch (error) {
      logError(error, { context: 'getActiveSessions' })
      throw error
    }
  }

  const revokeSession = async (sessionId) => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to revoke session')
      }
      
      return true
    } catch (error) {
      logError(error, { context: 'revokeSession' })
      throw error
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      const currentSessionId = localStorage.getItem('sessionId')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/sessions/revoke-others`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ currentSessionId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to revoke sessions')
      }
      
      return data.revokedCount
    } catch (error) {
      logError(error, { context: 'revokeAllOtherSessions' })
      throw error
    }
  }

  const getLoginHistory = async (limit = 10) => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/login-history?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to get login history')
      }
      
      return data.history
    } catch (error) {
      logError(error, { context: 'getLoginHistory' })
      throw error
    }
  }

  // ============================================================================
  // GOOGLE LINKING
  // ============================================================================

  const linkGoogleAccount = async () => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new AuthError('Chrome extension context not available')
      }

      const googleResponse = await chrome.runtime.sendMessage({ action: 'signIn' })
      
      if (!googleResponse.success) {
        throw new AuthError('Failed to get Google credentials')
      }

      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/link-google`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ googleIdToken: googleResponse.token })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to link Google account')
      }
      
      setHasGoogleLinked(true)
      return true
    } catch (error) {
      logError(error, { context: 'linkGoogleAccount' })
      throw error
    }
  }

  const unlinkGoogleAccount = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/auth/email/unlink-google`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(data.error || 'Failed to unlink Google account')
      }
      
      setHasGoogleLinked(false)
      return true
    } catch (error) {
      logError(error, { context: 'unlinkGoogleAccount' })
      throw error
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    authMethod,
    hasGoogleLinked,
    // Google auth
    signIn,
    signOut,
    // Email auth
    signInWithEmail,
    registerWithEmail,
    verifyEmail,
    resendVerificationOTP,
    requestPasswordReset,
    resetPassword,
    // Password & account management
    changePassword,
    deleteAccount,
    // Session management
    getActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
    getLoginHistory,
    // Google linking
    linkGoogleAccount,
    unlinkGoogleAccount
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
