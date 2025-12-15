/**
 * usePreloadRoutes Hook
 * Preloads route components on hover/focus for faster navigation
 */
import { useCallback } from 'react'

// Map of route paths to their dynamic imports
const routeImports = {
  '/': () => import('@pages/Home'),
  '/features/ai-detection': () => import('@pages/features/AIDetection'),
  '/features/humanization': () => import('@pages/features/Humanization'),
  '/features/voice-profile': () => import('@pages/features/VoiceProfile'),
  '/features/ai-workspace': () => import('@pages/features/AIWorkspace'),
  '/privacy': () => import('@pages/PrivacyPolicy'),
  '/terms': () => import('@pages/Terms'),
}

// Cache to track preloaded routes
const preloadedRoutes = new Set()

export function usePreloadRoutes() {
  const preloadRoute = useCallback((path) => {
    // Normalize path (remove language prefix if present)
    const normalizedPath = path.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/'

    // Check if already preloaded
    if (preloadedRoutes.has(normalizedPath)) return

    // Find matching import
    const importFn = routeImports[normalizedPath]
    if (importFn) {
      preloadedRoutes.add(normalizedPath)
      importFn()
    }
  }, [])

  const preloadOnHover = useCallback(
    (path) => ({
      onMouseEnter: () => preloadRoute(path),
      onFocus: () => preloadRoute(path),
    }),
    [preloadRoute]
  )

  return { preloadRoute, preloadOnHover }
}

export default usePreloadRoutes
