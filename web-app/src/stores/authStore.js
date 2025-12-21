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
  initStorageCache,
  setRememberMe,
  setRememberedEmail,
} from '../utils/authStorage'
import { logError } from '../utils/errors'
import { saveCredentials, preventAutoSignIn } from '../utils/credentialManager'
import { isWebApp, isChromeExtension } from '../utils/environment'
import { signInWithGooglePopup, signOutWeb, isSignedInWithGoogle as checkGoogleSignIn, getCurrentWebUser } from '../utils/webAuth'
import { signOut as firebaseSignOut } from '../services/firebaseAuth'

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
        error: null,
        // Session persistence flag - synced with rememberMe
        _sessionPersisted: false,

        // ========================================================================
        // INTERNAL ACTIONS
        // ========================================================================
        
        _setAuth: (user, token, authMethod) => {
          set({ 
            user, 
            token, 
            isAuthenticated: !!user, 
            authMethod, 
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
            error: null,
            _sessionPersisted: false
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
            // CRITICAL: Initialize storage cache FIRST for Chrome Extension
            // This loads data from chrome.storage.local into memory for sync access
            await initStorageCache()
            
            // Migrate old localStorage/sessionStorage tokens to chrome.storage.local
            await migrateToSecureStorage()
            
            // Initialize token service for auto-refresh
            tokenService.init()
            
            // Subscribe to token events
            tokenService.subscribe((event) => {
              if (event === 'session_expired' || event === 'tokens_cleared') {
                logger.log('[AUTH] Session expired via tokenService')
                get()._clearAuth()
              }
            })
            
            // Check rememberMe preference FIRST
            const rememberMeEnabled = secureGet('rememberMe') === 'true' || secureGet('rememberMe') === true
            logger.log('[AUTH] initAuth - rememberMe:', rememberMeEnabled)
            
            // Check for stored email auth
            const storedToken = secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN)
            const storedMethod = getStorageAuthMethod()
            const storedUser = getUserData()
            
            logger.log('[AUTH] initAuth - storedToken exists:', !!storedToken)
            logger.log('[AUTH] initAuth - storedMethod:', storedMethod)
            logger.log('[AUTH] initAuth - storedUser exists:', !!storedUser)
            
            // CRITICAL: Sync check between Zustand persist and actual token storage
            // This handles the case where:
            // - rememberMe=false → tokens in sessionStorage (cleared on browser close)
            // - Zustand persist → isAuthenticated in localStorage (persists)
            // Result: Zustand says authenticated but no token exists
            const currentState = get()
            const wasSessionPersisted = currentState._sessionPersisted
            
            if (currentState.isAuthenticated && !storedToken) {
              // Check if this is expected (rememberMe was off, browser was closed)
              if (!wasSessionPersisted || !rememberMeEnabled) {
                logger.log('[AUTH] Session not persisted (rememberMe=false or _sessionPersisted=false), clearing auth silently')
              } else {
                logger.warn('Auth', 'Zustand restored auth but no token found, clearing')
              }
              get()._clearAuth()
              set({ isLoading: false })
              return
            }
            
            // If rememberMe is enabled and we have valid stored data, restore session
            if (storedToken && storedMethod === 'email' && storedUser) {
              logger.log('[AUTH] Restoring session from storage')
              
              // Set authenticated state immediately
              set({ 
                user: storedUser, 
                token: storedToken, 
                isAuthenticated: true, 
                authMethod: 'email', 
                _sessionPersisted: rememberMeEnabled // Sync with current rememberMe preference
              })
              
              // Check if token needs refresh
              if (tokenService.needsRefresh()) {
                logger.log('[AUTH] Token needs refresh, refreshing...')
                await tokenService.refreshAccessToken()
              }
              
              // Verify token in background (don't block UI)
              try {
                const validToken = await tokenService.getValidToken()
                if (validToken) {
                  const response = await fetch(`${API_BASE_URL}/auth/email/sessions`, { 
                    headers: { 'Authorization': `Bearer ${validToken}` } 
                  })
                  
                  if (response.status === 401) { 
                    logger.log('[AUTH] Token invalid on server, clearing auth')
                    get()._clearAuth() 
                  } else {
                    logger.log('[AUTH] Session verified successfully')
                  }
                }
              } catch (networkError) { 
                logger.log('[AUTH] Network error during verification, keeping session') 
              }
              
              set({ isLoading: false })
              return
            }

            // Check for existing Firebase Auth session (web app)
            if (isWebApp()) {
              const { getCurrentUser, getIdToken } = await import('../services/firebaseAuth')
              const firebaseUser = getCurrentUser()
              
              if (firebaseUser) {
                logger.log('[AUTH] initAuth - Found existing Firebase Auth session')
                
                const userInfo = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || 'User',
                  picture: firebaseUser.photoURL || ''
                }
                
                let userId = firebaseUser.uid
                
                // Try to login/register as Google user via backend
                try {
                  const firebaseIdToken = await getIdToken()
                  
                  if (firebaseIdToken) {
                    const googleLoginResponse = await fetch(`${API_BASE_URL}/auth/firebase/google-login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        firebaseIdToken,
                        email: userInfo.email,
                        name: userInfo.name,
                        picture: userInfo.picture
                      })
                    })
                    
                    const googleLoginData = await googleLoginResponse.json()
                    
                    if (googleLoginResponse.ok && googleLoginData.success) {
                      const backendUser = {
                        ...googleLoginData.user,
                        id: googleLoginData.user.userId,
                        uid: firebaseUser.uid,
                        picture: userInfo.picture || googleLoginData.user.picture
                      }
                      
                      setUserData(backendUser)
                      secureSet(AUTH_STORAGE_KEYS.USER_ID, googleLoginData.user.userId)
                      setStorageAuthMethod('google')
                      setRememberMe(true)
                      
                      tokenService.setTokens({
                        accessToken: googleLoginData.accessToken,
                        refreshToken: googleLoginData.refreshToken,
                        expiresIn: googleLoginData.expiresIn || 3600
                      })
                      
                      set({ 
                        user: backendUser, 
                        token: googleLoginData.accessToken,
                        isAuthenticated: true, 
                        authMethod: 'google',
                        _sessionPersisted: true
                      })
                      set({ isLoading: false })
                      return
                    }
                  }
                } catch (backendError) {
                  logger.log('[AUTH] initAuth - Backend Google login failed:', backendError.message)
                }
                
                // Fallback: local-only auth
                secureSet(AUTH_STORAGE_KEYS.USER_ID, userId)
                set({ 
                  user: { ...userInfo, id: userId }, 
                  isAuthenticated: true, 
                  authMethod: 'google',
                  _sessionPersisted: true
                })
                set({ isLoading: false })
                return
              }
            }

            // Check Chrome extension authentication (only in extension context)
            if (isChromeExtension()) {
              try {
                const response = await chrome.runtime.sendMessage({ action: 'checkAuth' })
                if (response) {
                  const userInfo = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
                  if (userInfo?.email) {
                    let userId = userInfo.id || `user_${userInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`
                    
                    // Use Google-only auth
                    secureSet(AUTH_STORAGE_KEYS.USER_ID, userId)
                    set({ 
                      user: { ...userInfo, id: userId }, 
                      isAuthenticated: true, 
                      authMethod: 'google',
                      _sessionPersisted: true
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
            // Import Firebase Auth service
            const { signInWithGoogle: firebaseSignIn } = await import('../services/firebaseAuth')
            
            logger.log('[AUTH] Starting Firebase Google sign-in (Web App)...')
            
            const result = await firebaseSignIn()
            
            if (!result.success) {
              if (result.error === 'User cancelled sign-in') {
                return { success: false, error: result.error, cancelled: true }
              }
              throw new Error(result.error || 'Sign in failed')
            }
            
            const { user: firebaseUser, token: firebaseIdToken, isNewUser } = result
            
            // Register/login user with backend using Firebase ID token
            try {
              const backendResponse = await fetch(`${API_BASE_URL}/auth/firebase/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  firebaseIdToken,
                  email: firebaseUser.email,
                  name: firebaseUser.name,
                  picture: firebaseUser.picture
                })
              })
              
              const backendData = await backendResponse.json()
              
              if (backendResponse.ok && backendData.success) {
                // Use backend-generated user data
                const backendUser = {
                  ...backendData.user,
                  id: backendData.user.userId,
                  uid: firebaseUser.uid,
                  picture: firebaseUser.picture || backendData.user.picture
                }
                
                // Store user and tokens
                setUserData(backendUser)
                secureSet(AUTH_STORAGE_KEYS.USER_ID, backendData.user.userId)
                setStorageAuthMethod('google')
                setRememberMe(true)
                
                // Store JWT tokens for API calls
                tokenService.setTokens({
                  accessToken: backendData.accessToken,
                  refreshToken: backendData.refreshToken,
                  expiresIn: backendData.expiresIn || 3600
                })
                
                set({ 
                  user: backendUser, 
                  token: backendData.accessToken,
                  isAuthenticated: true, 
                  authMethod: 'google',
                  error: null,
                  _sessionPersisted: true
                })
                
                logger.log('[AUTH] Google user logged in via Firebase Auth', { 
                  userId: backendData.user.userId, 
                  isNewUser: backendData.isNewUser || isNewUser
                })
                
                // Dispatch event for other parts of app
                window.dispatchEvent(new CustomEvent('auth-signin', { 
                  detail: { authMethod: 'google', isNewUser: backendData.isNewUser || isNewUser } 
                }))
                
                return { success: true, isNewUser: backendData.isNewUser || isNewUser }
              } else if (backendData.code === 'AUTH_EMAIL_EXISTS') {
                // Email exists as email user - throw error
                const error = new Error(backendData.error || 'This email is registered with password. Please sign in with email/password.')
                error.code = 'EMAIL_USER_EXISTS'
                error.i18nKey = 'auth.email.googleEmailInUse'
                throw error
              }
              
              // Backend call failed but Firebase auth succeeded
              // Fall back to local-only auth
              logger.warn('Auth', 'Backend login failed, using local auth:', backendData.error)
            } catch (backendError) {
              if (backendError.code === 'EMAIL_USER_EXISTS') {
                throw backendError
              }
              logger.warn('Auth', 'Backend Google login failed, using local auth:', backendError.message)
            }
            
            // Fallback: local-only auth (if backend call fails)
            const userId = firebaseUser.uid
            secureSet(AUTH_STORAGE_KEYS.USER_ID, userId)
            setStorageAuthMethod('google')
            
            const localUser = {
              id: userId,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.name,
              picture: firebaseUser.picture
            }
            
            setUserData(localUser)
            
            set({ 
              user: localUser, 
              token: firebaseIdToken,
              isAuthenticated: true, 
              authMethod: 'google',
              error: null,
              _sessionPersisted: true
            })
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'signInWithGoogle' })
            set({ error: error.message })
            return { success: false, error: error.message, code: error.code }
          }
        },

        // ========================================================================
        // EMAIL AUTHENTICATION
        // ========================================================================
        
        signInWithEmail: async (email, password, rememberMe = false) => {
          try {
            // Get current language from i18n
            const { default: i18n } = await import('../i18n')
            const locale = i18n.language?.split('-')[0] || 'en'
            
            const response = await fetch(`${API_BASE_URL}/auth/email/login`, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, rememberMe, locale })
            })
            
            const data = await response.json()
            
            if (!response.ok) { 
              const e = new Error(data.error || 'Login failed')
              e.code = data.code
              throw e 
            }
            
            // Sign in to Firebase Auth with custom token (for Firestore access)
            if (data.firebaseCustomToken) {
              try {
                const { signInWithCustomToken } = await import('../services/firebaseAuth')
                await signInWithCustomToken(data.firebaseCustomToken)
                logger.log('[AUTH] Firebase Auth session established for email user')
              } catch (firebaseError) {
                logger.warn('Auth', 'Firebase custom token sign-in failed (non-critical)', firebaseError.message)
                // Continue - user can still use API, just not direct Firestore
              }
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
              error: null,
              // Track if session should persist across browser restarts
              _sessionPersisted: rememberMe
            })
            
            // LUÔN lưu email để auto-fill khi đăng nhập lại (giống Google, GitHub, Facebook)
            // Đây là UX chuẩn - user không cần nhập lại email mỗi lần
            setRememberedEmail(email)
            
            // Save credentials to browser password manager
            // Browser sẽ tự hỏi user có muốn lưu password không
            saveCredentials(email, password, data.user.name || data.user.displayName)
            
            return { success: true }
          } catch (error) {
            logError(error, { context: 'signInWithEmail' })
            set({ error: error.message })
            return { success: false, error: error.message, code: error.code }
          }
        },

        registerWithEmail: async (email, password, displayName) => {
          try {
            // Get current language from i18n
            const { default: i18n } = await import('../i18n')
            const locale = i18n.language?.split('-')[0] || 'en'
            
            const response = await fetch(`${API_BASE_URL}/auth/email/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, displayName, locale })
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

            // Sign in to Firebase Auth with custom token (for Firestore access)
            if (data.firebaseCustomToken) {
              try {
                const { signInWithCustomToken } = await import('../services/firebaseAuth')
                await signInWithCustomToken(data.firebaseCustomToken)
                logger.log('[AUTH] Firebase Auth session established for new email user')
              } catch (firebaseError) {
                logger.warn('Auth', 'Firebase custom token sign-in failed (non-critical)', firebaseError.message)
              }
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

            // After email verification, default to persistent session
            // User can change this on next login with rememberMe option
            setRememberMe(true)
            
            set({ 
              user: data.user, 
              token: data.accessToken,
              isAuthenticated: true, 
              authMethod: 'email', 
              error: null,
              _sessionPersisted: true
            })

            return { success: true }
          } catch (error) {
            logError(error, { context: 'verifyEmail' })
            return { success: false, error: error.message, code: error.code }
          }
        },

        resendVerificationOTP: async (email) => {
          try {
            // Get current language from i18n
            const { default: i18n } = await import('../i18n')
            const locale = i18n.language?.split('-')[0] || 'en'
            
            const response = await fetch(`${API_BASE_URL}/auth/email/resend-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, locale })
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
            // Get current language from i18n
            const { default: i18n } = await import('../i18n')
            const locale = i18n.language?.split('-')[0] || 'en'
            
            const requestBody = JSON.stringify({ email, locale })
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
            
            // Get current language from i18n
            const { default: i18n } = await import('../i18n')
            const locale = i18n.language?.split('-')[0] || 'en'
            
            const response = await fetch(`${API_BASE_URL}/auth/email/change-password`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ currentPassword, newPassword, locale })
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
        // SIGN OUT
        // ========================================================================
        
        signOut: async () => {
          try {
            const { authMethod } = get()
            
            // Sign out from Firebase Auth
            try {
              const { signOut: firebaseSignOut } = await import('../services/firebaseAuth')
              await firebaseSignOut()
            } catch (e) {
              logger.log('[AUTH] Firebase sign out failed (may not be initialized):', e.message)
            }
            
            // Sign out from appropriate auth provider
            if (isWebApp()) {
              // Web app: Sign out from Firebase Auth
              await firebaseSignOut()
            } else if (isChromeExtension() && authMethod === 'google') {
              // Chrome Extension: Sign out via background script
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
        
        syncFromContext: ({ user, isAuthenticated, authMethod, isLoading }) => {
          // This is now a no-op since authStore is the source of truth
          // Kept for backward compatibility
          logger.warn('Auth', 'syncFromContext is deprecated - authStore is now the source of truth')
        },
      }),
      {
        name: 'auth-storage',
        // Use chrome.storage.local for Chrome Extension, localStorage for web
        storage: {
          getItem: async (name) => {
            try {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                const result = await chrome.storage.local.get(name)
                const value = result[name]
                // Zustand expects the raw string or null
                return value ?? null
              }
              return localStorage.getItem(name)
            } catch (e) {
              logger.error('Auth', 'Storage getItem failed', e)
              return null
            }
          },
          setItem: async (name, value) => {
            try {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                await chrome.storage.local.set({ [name]: value })
              } else {
                localStorage.setItem(name, typeof value === 'string' ? value : JSON.stringify(value))
              }
            } catch (e) {
              logger.error('Auth', 'Storage setItem failed', e)
            }
          },
          removeItem: async (name) => {
            try {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                await chrome.storage.local.remove(name)
              } else {
                localStorage.removeItem(name)
              }
            } catch (e) {
              logger.error('Auth', 'Storage removeItem failed', e)
            }
          },
        },
        partialize: (state) => ({ 
          user: state.user, 
          token: state.token, 
          isAuthenticated: state.isAuthenticated, 
          authMethod: state.authMethod, 
          // Sync session persistence with rememberMe preference
          _sessionPersisted: state._sessionPersisted
        }),
        // Custom merge to handle session persistence correctly
        merge: (persistedState, currentState) => {
          // @ts-ignore - Zustand persist types are complex
          const persisted = persistedState || {}
          const current = currentState || {}
          
          logger.log('[AUTH] Zustand merge - persisted.isAuthenticated:', persisted.isAuthenticated)
          logger.log('[AUTH] Zustand merge - persisted._sessionPersisted:', persisted._sessionPersisted)
          
          // If session was not persisted (rememberMe was off), clear auth
          // @ts-ignore - accessing dynamic property
          if (persisted.isAuthenticated && !persisted._sessionPersisted) {
            logger.log('[AUTH] _sessionPersisted=false, clearing persisted auth state')
            return {
              ...current,
              ...persisted,
              isAuthenticated: false,
              user: null,
              token: null,
              _sessionPersisted: false
            }
          }
          
          // Session was persisted, restore auth state
          if (persisted.isAuthenticated && persisted._sessionPersisted) {
            logger.log('[AUTH] Restoring auth state from Zustand persist')
          }
          
          return {
            ...current,
            ...persisted
          }
        }
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
    getActiveSessions: state.getActiveSessions,
    revokeSession: state.revokeSession,
    revokeAllOtherSessions: state.revokeAllOtherSessions,
    getLoginHistory: state.getLoginHistory,
  }))
)

export default useAuthStore
