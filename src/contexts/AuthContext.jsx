import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      // Check if running in Chrome extension context
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          const response = await chrome.runtime.sendMessage({ action: 'checkAuth' })
          setIsAuthenticated(response)
          
          if (response) {
            const userInfo = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
            if (userInfo && userInfo.email) {
              setUser(userInfo)
            }
          }
        } catch (chromeError) {
          console.warn('Chrome extension context not available:', chromeError)
          // Fallback to dev mode
          setIsAuthenticated(true)
          setUser({
            email: 'dev@example.com',
            name: 'Development User',
            picture: null
          })
        }
      } else {
        // Running in regular browser - skip auth for development
        console.log('⚠️ Running in browser mode - Auth disabled for development')
        setIsAuthenticated(true)
        setUser({
          email: 'dev@example.com',
          name: 'Development User',
          picture: null
        })
      }
    } catch (error) {
      console.error('❌ Auth check error:', error)
      // Fallback to authenticated for development
      setIsAuthenticated(true)
      setUser({
        email: 'dev@example.com',
        name: 'Development User',
        picture: null
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          const response = await chrome.runtime.sendMessage({ action: 'signIn' })
          
          if (response && response.success) {
            setIsAuthenticated(true)
            setUser(response.userInfo)
            return true
          }
          return false
        } catch (chromeError) {
          console.warn('Chrome extension context not available:', chromeError)
          // Fallback to dev mode
          setIsAuthenticated(true)
          setUser({
            email: 'dev@example.com',
            name: 'Development User',
            picture: null
          })
          return true
        }
      } else {
        // Browser mode - simulate sign in
        setIsAuthenticated(true)
        setUser({
          email: 'dev@example.com',
          name: 'Development User',
          picture: null
        })
        return true
      }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      // Fallback to authenticated for development
      setIsAuthenticated(true)
      setUser({
        email: 'dev@example.com',
        name: 'Development User',
        picture: null
      })
      return true
    }
  }

  const signOut = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          const response = await chrome.runtime.sendMessage({ action: 'signOut' })
          
          if (response.success) {
            setIsAuthenticated(false)
            setUser(null)
            return true
          }
          return false
        } catch (chromeError) {
          console.warn('Chrome extension context not available:', chromeError)
          setIsAuthenticated(false)
          setUser(null)
          return true
        }
      } else {
        // Browser mode
        setIsAuthenticated(false)
        setUser(null)
        return true
      }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      return false
    }
  }

  const switchAccount = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          const response = await chrome.runtime.sendMessage({ action: 'switchAccount' })
          
          if (response.success) {
            setIsAuthenticated(false)
            setUser(null)
            return true
          }
          return false
        } catch (chromeError) {
          console.warn('Chrome extension context not available:', chromeError)
          setIsAuthenticated(false)
          setUser(null)
          return true
        }
      } else {
        // Browser mode
        setIsAuthenticated(false)
        setUser(null)
        return true
      }
    } catch (error) {
      console.error('❌ Switch account error:', error)
      return false
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    switchAccount
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
