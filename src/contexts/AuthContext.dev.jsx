import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Development Auth Provider
 * Auto-authenticates with test user for development
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    console.log('[SETTINGS] DEV MODE: Auto-authenticating...')
    
    const devUserId = 'dev_user_123'
    localStorage.setItem('userId', devUserId)
    
    setIsAuthenticated(true)
    setUser({
      id: devUserId,
      email: 'dev@example.com',
      name: 'Development User',
      picture: null
    })
    
    setIsLoading(false)
  }

  const signIn = async () => {
    console.log('[SETTINGS] DEV MODE: Sign in')
    return true
  }

  const signOut = async () => {
    console.log('[SETTINGS] DEV MODE: Sign out')
    localStorage.removeItem('userId')
    setIsAuthenticated(false)
    setUser(null)
    return true
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
