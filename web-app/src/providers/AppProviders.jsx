/**
 * AppProviders - Composed Provider Pattern
 * 
 * Reduces provider nesting by composing all providers into a single component.
 * This improves readability and makes it easier to manage provider order.
 * 
 * OPTIMIZED: AuthContext removed - using authStore (Zustand) directly
 * NotificationContext removed - using notificationStore (Zustand) directly
 */

import { useEffect } from 'react'
import { QueryProvider } from './QueryProvider'
import { PaymentProvider } from '../contexts/PaymentContext'
import { NotesProvider } from '../contexts/NotesContext'
import { ProfileProvider } from '../contexts/ProfileContext'
import { WorkspaceProvider } from '../contexts/WorkspaceContext'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

/**
 * AuthInitializer - Initializes auth on mount (replaces AuthProvider)
 */
const AuthInitializer = ({ children }) => {
  const initAuth = useAuthStore((state) => state.initAuth)
  
  useEffect(() => {
    initAuth()
  }, [initAuth])
  
  return children
}

/**
 * NotificationInitializer - Initializes notifications on auth (replaces NotificationProvider)
 */
const NotificationInitializer = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const init = useNotificationStore((state) => state.init)
  const cleanup = useNotificationStore((state) => state.cleanup)
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.userId || user.uid || user.id || localStorage.getItem('userId')
      if (userId) {
        init(userId)
      }
    } else {
      cleanup()
    }
  }, [isAuthenticated, user, init, cleanup])
  
  // Listen for auth signout event
  useEffect(() => {
    const handleSignout = () => cleanup()
    window.addEventListener('auth-signout', handleSignout)
    return () => window.removeEventListener('auth-signout', handleSignout)
  }, [cleanup])
  
  return children
}

/**
 * Compose multiple providers into a single component
 * @param {Array} providers - Array of provider components
 * @returns {Function} - Composed provider component
 */
function composeProviders(providers) {
  return providers.reduce(
    (AccumulatedProviders, CurrentProvider) => {
      return ({ children }) => (
        <AccumulatedProviders>
          <CurrentProvider>{children}</CurrentProvider>
        </AccumulatedProviders>
      )
    },
    ({ children }) => <>{children}</>
  )
}

/**
 * All app providers in correct order
 * Order matters: Auth must come before providers that depend on user state
 * 
 * OPTIMIZED:
 * - AuthProvider → AuthInitializer (Zustand)
 * - NotificationProvider → NotificationInitializer (Zustand)
 */
const providers = [
  QueryProvider,
  AuthInitializer,
  NotificationInitializer,
  PaymentProvider,
  NotesProvider,
  ProfileProvider,
  WorkspaceProvider,
]

/**
 * Composed AppProviders component
 * Usage: <AppProviders><App /></AppProviders>
 */
export const AppProviders = composeProviders(providers)

/**
 * Alternative: Manual composition for more control
 * Use this if you need to pass props to specific providers
 */
export const AppProvidersManual = ({ children }) => (
  <QueryProvider>
    <AuthInitializer>
      <NotificationInitializer>
        <PaymentProvider>
          <NotesProvider>
            <ProfileProvider>
              <WorkspaceProvider>
                {children}
              </WorkspaceProvider>
            </ProfileProvider>
          </NotesProvider>
        </PaymentProvider>
      </NotificationInitializer>
    </AuthInitializer>
  </QueryProvider>
)

export default AppProviders
