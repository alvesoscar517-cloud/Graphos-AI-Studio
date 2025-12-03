/**
 * AI Processing Store (Zustand)
 * Replaces AIProcessingContext with better performance
 */

import { create } from 'zustand'

export const useAIProcessingStore = create((set) => ({
  // State
  isProcessing: false,
  processingType: null, // 'detect' | 'analyze' | 'rewrite' | 'chat' | null

  // Actions
  startProcessing: (type) => set({ isProcessing: true, processingType: type }),
  stopProcessing: () => set({ isProcessing: false, processingType: null }),

  // Convenience setters
  setProcessing: (isProcessing, type = null) => set({ 
    isProcessing, 
    processingType: isProcessing ? type : null 
  }),
}))

// Convenience hooks for selective subscriptions
export const useIsProcessing = () => useAIProcessingStore((state) => state.isProcessing)
export const useProcessingType = () => useAIProcessingStore((state) => state.processingType)

export const useAIProcessingActions = () => useAIProcessingStore((state) => ({
  startProcessing: state.startProcessing,
  stopProcessing: state.stopProcessing,
  setProcessing: state.setProcessing,
}))

// Backward compatible hook (matches old useAIProcessing interface)
export const useAIProcessing = () => {
  const isProcessing = useAIProcessingStore((state) => state.isProcessing)
  const processingType = useAIProcessingStore((state) => state.processingType)
  const startProcessing = useAIProcessingStore((state) => state.startProcessing)
  const stopProcessing = useAIProcessingStore((state) => state.stopProcessing)

  return { isProcessing, processingType, startProcessing, stopProcessing }
}

export default useAIProcessingStore
