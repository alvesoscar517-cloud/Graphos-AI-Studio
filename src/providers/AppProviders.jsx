/**
 * AppProviders - Composed Provider Pattern
 * 
 * Reduces provider nesting by composing all providers into a single component.
 * This improves readability and makes it easier to manage provider order.
 */

import { QueryProvider } from './QueryProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { PaymentProvider } from '../contexts/PaymentContext'
import { NotesProvider } from '../contexts/NotesContext'
import { ProfileProvider } from '../contexts/ProfileContext'
import { WorkspaceProvider } from '../contexts/WorkspaceContext'

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
 * Note: AIProcessingProvider and RewriteProvider are deprecated
 * and now use Zustand stores directly, so they're removed from the tree.
 */
const providers = [
  QueryProvider,
  AuthProvider,
  NotificationProvider, // Must be after Auth to access user state
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
    <AuthProvider>
      <NotificationProvider>
        <PaymentProvider>
          <NotesProvider>
            <ProfileProvider>
              <WorkspaceProvider>
                {children}
              </WorkspaceProvider>
            </ProfileProvider>
          </NotesProvider>
        </PaymentProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryProvider>
)

export default AppProviders
