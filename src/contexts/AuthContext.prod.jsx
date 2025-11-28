import { createContext, useContext, useState, useEffect } from 'react'
import { AuthError, logError } from '../utils/errors'

const AuthContext = createContext()

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Production Auth Provider
 * Uses Chrome extension authentication for Google
 * Uses API for email/password authentication
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

  const checkAuthentication = async () => {
    try {
      // Check if running in Chrome extension context
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new AuthError('Chrome extension context not available')
      }

      const response = await chrome.runtime.sendMessage({ action: 'checkAuth' })
      setIsAuthenticated(response)
      
      if (response) {
        const userInfo = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
        if (userInfo && userInfo.email) {
          // Generate userId from email if not exists
          const userId = userInfo.id || `user_${userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
          localStorage.setItem('userId', userId)
          setUser({ ...userInfo, id: userId })
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

  const signIn = async () => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new AuthError('Chrome extension context not available')
      }

      const response = await chrome.runtime.sendMessage({ action: 'signIn' })
      
      if (response && response.success) {
        const userId = response.userInfo.id || `user_${response.userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
        localStorage.setItem('userId', userId)
        setIsAuthenticated(true)
        setUser({ ...response.userInfo, id: userId })
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
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new AuthError('Chrome extension context not available')
      }

      const response = await chrome.runtime.sendMessage({ action: 'signOut' })
      
      if (response.success) {
        localStorage.removeItem('userId')
        localStorage.removeItem('authToken')
        localStorage.removeItem('authMethod')
        setIsAuthenticated(false)
        setUser(null)
        setAuthMethod(null)
        setHasGoogleLinked(false)
        setError(null)
        return true
      }
      
      throw new AuthError('Sign out failed')
    } catch (error) {
      logError(error, { context: 'signOut' })
      setError(error.message)
      return false
    }
  }

  // ============================================================================
  // EMAIL AUTHENTICATION METHODS
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
      
      setUser(data.user)
      setIsAuthenticated(true)
      setAuthMethod('email')
      setHasGoogleLinked(data.user.hasGoogleLinked || false)
      setError(null)
      
      return true
    } catch (error) {
      logError(error, { context: 'signInWithEmail' })
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
      
      setUser(data.user)
      setIsAuthenticated(true)
      setAuthMethod('email')
      setError(null)
      
      return true
    } catch (error) {
      logError(error, { context: 'verifyEmail' })
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
      throw error
    }
  }

  // ============================================================================
  // GOOGLE LINKING METHODS
  // ============================================================================

  const linkGoogleAccount = async () => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new AuthError('Chrome extension context not available')
      }

      // Get Google token via Chrome identity
      const googleResponse = await chrome.runtime.sendMessage({ action: 'signIn' })
      
      if (!googleResponse.success) {
        throw new AuthError('Failed to get Google credentials')
      }

      // Get stored auth token
      const authToken = localStorage.getItem('authToken')
      
      // Link to backend
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
    // Google linking
    linkGoogleAccount,
    unlinkGoogleAccount
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
