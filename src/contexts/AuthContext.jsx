/**
 * Auth Context - Thin Wrapper for Backward Compatibility
 * 
 * IMPORTANT: This context now delegates to authStore (Zustand).
 * authStore is the SINGLE SOURCE OF TRUTH for authentication.
 * 
 * New code should use authStore directly:
 * import { useAuthStore, useAuthActions } from '@/stores/authStore'
 * 
 * This context is maintained for backward compatibility with existing components.
 */

import { createContext, useContext, useEffect } from 'react'
import { useAuthStore, useAuthActions } from '../stores/authStore'

const AuthContext = createContext()

/**
 * useAuth hook - delegates to authStore
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Auth Provider - Thin wrapper around authStore
 * Initializes auth on mount and provides context for backward compatibility
 */
export const AuthProvider = ({ children }) => {
  // Get state from Zustand store
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const authMethod = useAuthStore((state) => state.authMethod)
  const hasGoogleLinked = useAuthStore((state) => state.hasGoogleLinked)
  
  // Get actions from Zustand store
  const actions = useAuthActions()

  // Initialize auth on mount
  useEffect(() => {
    actions.initAuth()
  }, [])

  // Build context value from store state and actions
  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    authMethod,
    hasGoogleLinked,
    
    // Google auth
    signIn: actions.signInWithGoogle,
    signOut: actions.signOut,
    
    // Email auth
    signInWithEmail: actions.signInWithEmail,
    registerWithEmail: actions.registerWithEmail,
    verifyEmail: actions.verifyEmail,
    resendVerificationOTP: actions.resendVerificationOTP,
    requestPasswordReset: actions.requestPasswordReset,
    resetPassword: actions.resetPassword,
    
    // Password & account management
    changePassword: actions.changePassword,
    deleteAccount: actions.deleteAccount,
    
    // Session management
    getActiveSessions: actions.getActiveSessions,
    revokeSession: actions.revokeSession,
    revokeAllOtherSessions: actions.revokeAllOtherSessions,
    getLoginHistory: actions.getLoginHistory,
    
    // Google linking
    linkGoogleAccount: actions.linkGoogleAccount,
    unlinkGoogleAccount: actions.unlinkGoogleAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
