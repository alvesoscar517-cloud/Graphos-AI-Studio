/**
 * Auth Context - DEPRECATED
 * 
 * This file is kept for backward compatibility only.
 * All functionality has been moved to authStore (Zustand).
 * 
 * New code should import from authStore directly:
 * import { useAuth, useAuthStore, useAuthActions } from '@/stores/authStore'
 * 
 * @deprecated Use stores/authStore.js instead
 */

// Re-export from authStore for backward compatibility
import { useAuth as useAuthFromStore } from '../stores/authStore'

export { 
  useAuth,
  useAuthStore,
  useAuthActions,
  useUser,
  useIsAuthenticated,
  useAuthMethod,
  useHasGoogleLinked,
  useAuthLoading,
  useAuthError,
} from '../stores/authStore'

// Legacy AuthProvider - now a no-op wrapper
export const AuthProvider = ({ children }) => children

export default { AuthProvider, useAuth: useAuthFromStore }
