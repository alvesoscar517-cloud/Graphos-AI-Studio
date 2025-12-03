/**
 * Query Provider
 * Wraps app with TanStack Query provider
 */

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

export function QueryProvider({ children }) {
  // Clear all query cache on sign out to prevent data leakage
  useEffect(() => {
    const handleSignOut = () => {
      console.log('[SECURITY] Clearing query cache on sign out')
      queryClient.clear()
    }
    
    window.addEventListener('auth-signout', handleSignOut)
    return () => window.removeEventListener('auth-signout', handleSignOut)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider
