/**
 * Auth Store (Zustand) - SINGLE SOURCE OF TRUTH
 * 
 * This is the primary authentication state manager.
 * AuthContext is now a thin wrapper for backward compatibility.
 * 
 * Features:
 * - Automatic token refresh via tokenService
 * - Secure token storage via authStorage
 * - Session management
 * - Google + Email authentication
 */

import { logger } from '../utils/logger'
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { tokenService } from '../services/tokenService'
import {
  clearAuthStorage,
  setUserData,
  getUserData,
  setAuthMethod as setStorageAuthMethod,
  getAuthMethod as getStorageAuthMethod,
  setActiveProfile,
  clearActiveProfile,
  secureSet,
  secureGet,
  AUTH_STORAGE_KEYS,
  migrateToSecureStorage,
  setRememberMe,
} from '../utils/authStorage'
import { logError } from '../utils/errors'
import { saveCredentials, preventAutoSignIn } from '../utils/credentialManager'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://graphosai-472729326429.us-central1.run.app'

export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ========================================================================
        // STATE
        // ========================================================================
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        authMethod: null, // 'google' | 'email'
        hasGoogleLinked: false,
        error: null,

        // ========================================================================
        // INTERNAL ACTIONS
        // ========================================================================
        
        _setAuth: (user, token, authMethod, hasGoogleLinked = false) => {
          set({ 
            user, 
            token, 
            isAuthenticated: !!user, 
            authMethod, 
            hasGoogleLinked, 
            error: null 
          })
        },
        
        _clearAuth: () => {
          clearAuthStorage()
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            authMethod: null, 
            hasGoogleLinked: false, 
            error: null 
          })
        },

        // ========================================================================
        // PUBLIC ACTIONS - State Setters
        // ========================================================================
        
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),
        setAuthMethod: (method) => {
          setStorageAuthMethod(method)
          set({ authMethod: method })
        },
        setHasGoogleLinked: (linked) => set({ hasGoogleLinked: linked }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
        updateUser: (updates) => set((state) => {
          const updatedUser = state.user ? { ...state.user, ...updates } : null
          if (updatedUser) {
            setUserData(updatedUser)
          }
          return { user: updatedUser }
        }),

        // ========================================================================
        // INITIALIZATION
        // ========================================================================
        
        initAuth: async () => {
          set({ isLoading: true })
          
          try {
            // Migrate old unencrypted tokens
            migrateToSecureStorage()
            
            // Initialize token service for auto-refresh
            tokenService.init()
            
            // Subscribe to token events
            tokenService.subscribe((event) => {
              if (event === 'session_expired' || event === 'tokens_cleared') {
                logger.log('[AUTH] Session expired via tokenService')
                get()._clearAuth()
              }
            })
            
            // Check for stored email auth
            const storedToken = secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN)
            const storedMethod = getStorageAuthMethod()
            const storedUser = getUserData()
            
            // If Zustand restored isAuthenticated but no token, clear auth
            // This prevents inconsistent state
            const currentState = get()
            if (currentState.isAuthenticated && !storedToken) {
              logger.warn('Auth', 'Zustand restored auth but no token found, clearing')
              get()._clearAuth()
              set({ isLoading: false })
              return
            }
            
            if (storedToken && storedMethod === 'email' && storedUser) {
              // Set authenticated state immediately
              set({ 
                user: storedUser, 
                token: storedToken, 
                isAuthenticated: true, 
                authMethod: 'email', 
                hasGoogleLinked: storedUser.hasGoogleLinked || false 
              })
              
              // Check if token needs refresh
              if (tokenService.needsRefresh()) {
                logger.log('[AUTH] Token needs refresh, refreshing...')
                await tokenService.refreshAccessToken()
              }
              
              // Verify token in background (don't block UI)
              try {
                const validToken = await tokenService.getValidToken()
                const response = await fetch(`${API_BASE_URL}/auth/email/sessions`, { 
                  headers: { 'Authorization': `Bearer ${validToken}` } 
                })
                
                if (response.status === 401) { 
                  logger.log('[AUTH] Token invalid')
                  get()._clearAuth() 
                }
              } catch (networkError) { 
                logger.log('[AUTH] Network error, keeping session') 
              }
              
              set({ isLoading: false })
              return
            }

            // Check Chrome extension authentication
            if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
              try {
                const response = await chrome.runtime.sendMessage({ action: 'checkAuth' })
                if (response) {
                  const userInfo = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
                  if (userInfo?.email) {
                    const userId = userInfo.id || `user_${userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
                    secureSet(AUTH_STORAGE_KEYS.USER_ID, userId)
                    set({ 
                      user: { ...userInfo, id: userId }, 
                      isAuthenticated: true, 
                      authMethod: 'google' 
                    })
                  }
                }
              } catch (e) { 
                logger.log('[AUTH] Chrome check failed:', e.message) 
              }
            }
          } catch (error) {
            logError(error, { context: 'initAuth' })
            set({ error: error.message })
          } finally {
            set({ isLoading: false })
          }
        },

        // ========================================================================
        // GOOGLE AUTHENTICATION
        // ========================================================================
        
        signInWithGoogle: async () => {
          try {
            if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
              throw new Error('Chrome extension not available')
            }
            
            const response = await chrome.runtime.sendMessage({ action: 'signIn' })
            
            if (response?.success) {
              const userId = response.userInfo.id || `user_${response.userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
              secureSet(AUTH_STORAGE_KEYS.USER_ID, userId)
              
              set({ 
                user: { ...response.userInfo, id: userId }, 
                isAuthenticated: true, 
                authMethod: 'google', 
                error: null 
              })
              
              return { success: true }
            }
            
            throw new Error('Sign in failed')
          } catch (error) {
            logError(error, { context: 'signInWithGoogle' })
            set({ error: error.message })
            return { success: false, error: error.message }
          }
        },

        // ========================================================================
        // EMAIL AUTHENTICATION
        // ========================================================================
        
        signInWithEmail: async (email, password, rememberMe = false) => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/email/login`, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, rememberMe })
            })
            
            const data = await response.json()
            
            if (!response.ok) { 
              const e = new Error(data.error || 'Login failed')
              e.code = data.code
              throw e 
            }
            
            // Store user info securely
            setUserData(data.user)
            secureSet(AUTH_STORAGE_KEYS.USER_ID, data.user.userId)
            setStorageAuthMethod('email')
            
            // Store remember me preference FIRST (determines which storage to use)
            setRememberMe(rememberMe)
            
            // Use tokenService for token management
            // Backend now handles expiry based on rememberMe
            tokenService.setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn || 3600
            })
            
            set({ 
              user: data.user, 
              token: data.accessToken, 
              isAuthenticated: true, 
              authMethod: 'email', 
              hasGoogleLinked: data.user.hasGoogleLinked || false, 
              error: null 
            })
            
            // Save credentials to browser password manager if rememberMe
            if (rememberMe) {
              saveCredentials(email, password, data.user.name || data.user.displayName)
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'signInWithEmail' })
            set({ error: error.message })
            return { success: false, error: error.message, code: error.code }
          }
        },

        registerWithEmail: async (email, password, displayName) => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/email/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, displayName })
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              const e = new Error(data.error || 'Registration failed')
              e.code = data.code
              throw e
            }
            
            return { success: true, pendingVerification: true }
          } catch (error) {
            logError(error, { context: 'registerWithEmail' })
            return { success: false, error: error.message, code: error.code }
          }
        },

        verifyEmail: async (email, otp) => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/email/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp })
            })

            const data = await response.json()

            if (!response.ok) {
              const e = new Error(data.error || 'Verification failed')
              e.code = data.code
              throw e
            }

            if (data.needsLogin) {
              return { needsLogin: true, message: data.message }
            }

            // Store auth data
            setUserData(data.user)
            secureSet(AUTH_STORAGE_KEYS.USER_ID, data.user.userId)
            setStorageAuthMethod('email')
            
            tokenService.setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn || 3600
            })

            set({ 
              user: data.user, 
              token: data.accessToken,
              isAuthenticated: true, 
              authMethod: 'email', 
              error: null 
            })

            return { success: true }
          } catch (error) {
            logError(error, { context: 'verifyEmail' })
            return { success: false, error: error.message, code: error.code }
          }
        },

        resendVerificationOTP: async (email) => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/email/resend-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to resend code')
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'resendVerificationOTP' })
            return { success: false, error: error.message }
          }
        },

        requestPasswordReset: async (email) => {
          try {
            const requestBody = JSON.stringify({ email })
            logger.log('[AUTH] requestPasswordReset - email:', email)
            logger.log('[AUTH] requestPasswordReset - body:', requestBody)
            logger.log('[AUTH] requestPasswordReset - URL:', `${API_BASE_URL}/auth/email/forgot-password`)
            
            const response = await fetch(`${API_BASE_URL}/auth/email/forgot-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: requestBody
            })
            
            logger.log('[AUTH] requestPasswordReset - response status:', response.status)
            
            const data = await response.json()
            logger.log('[AUTH] requestPasswordReset - response data:', data)
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to request reset')
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'requestPasswordReset' })
            return { success: false, error: error.message }
          }
        },

        resetPassword: async (email, otp, newPassword) => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/email/reset-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp, newPassword })
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to reset password')
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'resetPassword' })
            return { success: false, error: error.message }
          }
        },

        // ========================================================================
        // PASSWORD & ACCOUNT MANAGEMENT
        // ========================================================================

        changePassword: async (currentPassword, newPassword) => {
          try {
            const authToken = await tokenService.getValidToken()
            
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
              throw new Error(data.error || 'Failed to change password')
            }
            
            // If backend signals requireRelogin, force logout
            // This is industry standard - all sessions are revoked after password change
            if (data.requireRelogin) {
              logger.log('[AUTH] Password changed, forcing re-login (all sessions revoked)')
              // Clear tokens and auth state
              tokenService.clearTokens()
              get()._clearAuth()
            }
            
            return { success: true, requireRelogin: data.requireRelogin }
          } catch (error) {
            logError(error, { context: 'changePassword' })
            return { success: false, error: error.message }
          }
        },

        deleteAccount: async (password) => {
          try {
            const authToken = await tokenService.getValidToken()
            
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
              throw new Error(data.error || 'Failed to delete account')
            }
            
            get()._clearAuth()
            return { success: true }
          } catch (error) {
            logError(error, { context: 'deleteAccount' })
            return { success: false, error: error.message }
          }
        },

        // ========================================================================
        // SESSION MANAGEMENT
        // ========================================================================

        getActiveSessions: async () => {
          try {
            const authToken = await tokenService.getValidToken()
            
            const response = await fetch(`${API_BASE_URL}/auth/email/sessions`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to get sessions')
            }
            
            return { success: true, sessions: data.sessions }
          } catch (error) {
            logError(error, { context: 'getActiveSessions' })
            return { success: false, error: error.message, sessions: [] }
          }
        },

        revokeSession: async (sessionId) => {
          try {
            const authToken = await tokenService.getValidToken()
            
            const response = await fetch(`${API_BASE_URL}/auth/email/sessions/${sessionId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${authToken}` }
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to revoke session')
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'revokeSession' })
            return { success: false, error: error.message }
          }
        },

        revokeAllOtherSessions: async () => {
          try {
            const authToken = await tokenService.getValidToken()
            const currentSessionId = secureGet(AUTH_STORAGE_KEYS.SESSION_ID)
            
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
              throw new Error(data.error || 'Failed to revoke sessions')
            }
            
            return { success: true, revokedCount: data.revokedCount }
          } catch (error) {
            logError(error, { context: 'revokeAllOtherSessions' })
            return { success: false, error: error.message }
          }
        },

        revokeAllSessions: async () => {
          try {
            const authToken = await tokenService.getValidToken()
            
            const response = await fetch(`${API_BASE_URL}/auth/email/sessions/revoke-all`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to revoke all sessions')
            }
            
            // Clear local auth state since current session is also revoked
            logger.log('[AUTH] All sessions revoked, signing out locally')
            tokenService.clearTokens()
            get()._clearAuth()
            
            return { success: true, revokedCount: data.revokedCount }
          } catch (error) {
            logError(error, { context: 'revokeAllSessions' })
            return { success: false, error: error.message }
          }
        },

        getLoginHistory: async (limit = 10) => {
          try {
            const authToken = await tokenService.getValidToken()
            
            const response = await fetch(`${API_BASE_URL}/auth/email/login-history?limit=${limit}`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to get login history')
            }
            
            return { success: true, history: data.history }
          } catch (error) {
            logError(error, { context: 'getLoginHistory' })
            return { success: false, error: error.message, history: [] }
          }
        },

        // ========================================================================
        // GOOGLE LINKING
        // ========================================================================

        linkGoogleAccount: async () => {
          try {
            if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
              throw new Error('Chrome extension context not available')
            }

            const googleResponse = await chrome.runtime.sendMessage({ action: 'signIn' })
            
            if (!googleResponse.success) {
              throw new Error('Failed to get Google credentials')
            }

            const authToken = await tokenService.getValidToken()
            const storageResult = await chrome.storage.local.get(['accessToken'])
            const googleAccessToken = storageResult.accessToken
            
            const response = await fetch(`${API_BASE_URL}/auth/email/link-google`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ 
                googleAccessToken,
                googleEmail: googleResponse.userInfo?.email,
                googleName: googleResponse.userInfo?.name
              })
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              // Map error codes to i18n keys for better UX
              const errorCode = data.code || ''
              let errorKey = 'auth.email.linkFailed'
              if (errorCode === 'AUTH_GOOGLE_EMAIL_IN_USE') {
                errorKey = 'auth.email.googleEmailInUse'
              } else if (errorCode === 'AUTH_GOOGLE_EMAIL_HAS_ACCOUNT') {
                errorKey = 'auth.email.googleEmailHasAccount'
              } else if (errorCode === 'AUTH_GOOGLE_ALREADY_LINKED') {
                errorKey = 'auth.email.googleAlreadyLinked'
              }
              const error = new Error(data.error || 'Failed to link Google account')
              error.i18nKey = errorKey
              error.code = errorCode
              throw error
            }
            
            // Update state
            set({ hasGoogleLinked: true })
            
            // Update stored user
            const currentUser = get().user
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                hasGoogleLinked: true,
                googleLinked: { googleEmail: googleResponse.userInfo?.email },
                picture: googleResponse.userInfo?.picture || currentUser.picture
              }
              setUserData(updatedUser)
              set({ user: updatedUser })
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'linkGoogleAccount' })
            return { success: false, error: error.message }
          }
        },

        unlinkGoogleAccount: async () => {
          try {
            const authToken = await tokenService.getValidToken()
            
            const response = await fetch(`${API_BASE_URL}/auth/email/unlink-google`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to unlink Google account')
            }
            
            // Clear Google OAuth token
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              await chrome.storage.local.remove(['accessToken', 'userInfo', 'driveFolderId'])
            }
            
            set({ hasGoogleLinked: false })
            
            // Update stored user
            const currentUser = get().user
            if (currentUser) {
              const updatedUser = { ...currentUser, hasGoogleLinked: false }
              delete updatedUser.googleLinked
              setUserData(updatedUser)
              set({ user: updatedUser })
            }
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'unlinkGoogleAccount' })
            return { success: false, error: error.message }
          }
        },

        // ========================================================================
        // SIGN OUT
        // ========================================================================
        
        signOut: async () => {
          try {
            const { authMethod } = get()
            
            if (typeof chrome !== 'undefined' && chrome.runtime?.id && authMethod === 'google') {
              await chrome.runtime.sendMessage({ action: 'signOut' })
            }
            
            // Clear tokens via tokenService
            tokenService.clearTokens()
            
            // Clear all auth storage (includes localStorage cleanup)
            get()._clearAuth()
            
            // Prevent browser from auto-filling credentials on next visit
            preventAutoSignIn()
            
            // Dispatch event for other parts of app to clear their data
            window.dispatchEvent(new CustomEvent('auth-signout'))
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'signOut' })
            set({ error: error.message })
            return { success: false, error: error.message }
          }
        },

        // ========================================================================
        // GETTERS (for backward compatibility)
        // ========================================================================
        
        getUser: () => get().user,
        getToken: () => get().token,
        isLoggedIn: () => get().isAuthenticated,

        // ========================================================================
        // DEPRECATED - for backward compatibility with AuthContext
        // ========================================================================
        
        syncFromContext: ({ user, isAuthenticated, authMethod, hasGoogleLinked, isLoading }) => {
          // This is now a no-op since authStore is the source of truth
          // Kept for backward compatibility
          logger.warn('Auth', 'syncFromContext is deprecated - authStore is now the source of truth')
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          token: state.token, 
          isAuthenticated: state.isAuthenticated, 
          authMethod: state.authMethod, 
          hasGoogleLinked: state.hasGoogleLinked 
        }),
      }
    )
  )
)

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthMethod = () => useAuthStore((state) => state.authMethod)
export const useHasGoogleLinked = () => useAuthStore((state) => state.hasGoogleLinked)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

/**
 * useAuth - Drop-in replacement for AuthContext's useAuth hook
 * Returns the same interface as the old AuthContext for backward compatibility
 */
export const useAuth = () => {
  // Use useShallow to prevent unnecessary re-renders
  const state = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
      isLoading: s.isLoading,
      error: s.error,
      authMethod: s.authMethod,
      hasGoogleLinked: s.hasGoogleLinked,
    }))
  )
  
  // Get actions from store directly - stable references
  const store = useAuthStore.getState()

  return {
    // State
    ...state,
    
    // Google auth
    signIn: store.signInWithGoogle,
    signOut: store.signOut,
    
    // Email auth
    signInWithEmail: store.signInWithEmail,
    registerWithEmail: store.registerWithEmail,
    verifyEmail: store.verifyEmail,
    resendVerificationOTP: store.resendVerificationOTP,
    requestPasswordReset: store.requestPasswordReset,
    resetPassword: store.resetPassword,
    
    // Password & account management
    changePassword: store.changePassword,
    deleteAccount: store.deleteAccount,
    
    // Session management
    getActiveSessions: store.getActiveSessions,
    revokeSession: store.revokeSession,
    revokeAllOtherSessions: store.revokeAllOtherSessions,
    revokeAllSessions: store.revokeAllSessions,
    getLoginHistory: store.getLoginHistory,
    
    // Google linking
    linkGoogleAccount: store.linkGoogleAccount,
    unlinkGoogleAccount: store.unlinkGoogleAccount,
  }
}

export const useAuthActions = () => useAuthStore(
  useShallow((state) => ({
    initAuth: state.initAuth,
    signInWithGoogle: state.signInWithGoogle,
    signInWithEmail: state.signInWithEmail,
    registerWithEmail: state.registerWithEmail,
    verifyEmail: state.verifyEmail,
    resendVerificationOTP: state.resendVerificationOTP,
    requestPasswordReset: state.requestPasswordReset,
    resetPassword: state.resetPassword,
    changePassword: state.changePassword,
    deleteAccount: state.deleteAccount,
    signOut: state.signOut,
    setUser: state.setUser,
    updateUser: state.updateUser,
    linkGoogleAccount: state.linkGoogleAccount,
    unlinkGoogleAccount: state.unlinkGoogleAccount,
    getActiveSessions: state.getActiveSessions,
    revokeSession: state.revokeSession,
    revokeAllOtherSessions: state.revokeAllOtherSessions,
    getLoginHistory: state.getLoginHistory,
  }))
)

export default useAuthStore
