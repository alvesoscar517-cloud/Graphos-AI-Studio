/**
 * Rewrite Context (Deprecated - Use Zustand store instead)
 * 
 * This context now uses Zustand store internally for better performance.
 * New code should import directly from '@/stores/rewriteStore'
 * 
 * @deprecated Use useRewrite from '@/stores' instead
 */

import { createContext, useContext } from 'react'
import { useRewriteStore } from '../stores/rewriteStore'

const RewriteContext = createContext()

/**
 * @deprecated Use useRewrite from '@/stores' instead
 */
export const useRewrite = () => {
  // Use Zustand store directly for better performance
  const selectedModel = useRewriteStore((state) => state.selectedModel)
  const writingPreferences = useRewriteStore((state) => state.writingPreferences)
  const setSelectedModel = useRewriteStore((state) => state.setSelectedModel)
  const setWritingPreferences = useRewriteStore((state) => state.setWritingPreferences)

  return { selectedModel, setSelectedModel, writingPreferences, setWritingPreferences }
}

/**
 * @deprecated Provider kept for backward compatibility, but state is managed by Zustand
 */
export const RewriteProvider = ({ children }) => {
  // Provider is now a pass-through - state is managed by Zustand
  return (
    <RewriteContext.Provider value={null}>
      {children}
    </RewriteContext.Provider>
  )
}
