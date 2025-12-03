/**
 * AI Processing Context (Deprecated - Use Zustand store instead)
 * 
 * This context now uses Zustand store internally for better performance.
 * New code should import directly from '@/stores/aiProcessingStore'
 * 
 * @deprecated Use useAIProcessing from '@/stores' instead
 */

import { createContext, useContext } from 'react'
import { useAIProcessingStore } from '../stores/aiProcessingStore'

const AIProcessingContext = createContext()

/**
 * @deprecated Use useAIProcessing from '@/stores' instead
 */
export const useAIProcessing = () => {
  // Use Zustand store directly for better performance
  const isProcessing = useAIProcessingStore((state) => state.isProcessing)
  const processingType = useAIProcessingStore((state) => state.processingType)
  const startProcessing = useAIProcessingStore((state) => state.startProcessing)
  const stopProcessing = useAIProcessingStore((state) => state.stopProcessing)

  return { isProcessing, processingType, startProcessing, stopProcessing }
}

/**
 * @deprecated Provider kept for backward compatibility, but state is managed by Zustand
 */
export const AIProcessingProvider = ({ children }) => {
  // Provider is now a pass-through - state is managed by Zustand
  return (
    <AIProcessingContext.Provider value={null}>
      {children}
    </AIProcessingContext.Provider>
  )
}
