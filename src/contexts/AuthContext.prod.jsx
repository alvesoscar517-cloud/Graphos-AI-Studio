import { createContext, useContext, useState, useEffect } from 'react'
import { AuthError, logError } from '../utils/errors'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Production Auth Provider
 * Uses Chrome extension authentication
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
        setIsAuthenticated(false)
        setUser(null)
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

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
