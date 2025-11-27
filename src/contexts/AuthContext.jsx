/**
 * Auth Context - Environment-aware
 * Automatically uses dev or prod version based on NODE_ENV
 */

// Import both versions
import * as DevAuth from './AuthContext.dev.jsx'
import * as ProdAuth from './AuthContext.prod.jsx'

// Use dev version in development, prod version in production
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development'

// Select the appropriate version
const AuthModule = isDev ? DevAuth : ProdAuth

// Log which version is being used
if (isDev) {
  console.log('[SETTINGS] Using Development Auth Provider')
} else {
  console.log('[LAUNCH] Using Production Auth Provider')
}

// Export from selected module
export const { useAuth, AuthProvider } = AuthModule
