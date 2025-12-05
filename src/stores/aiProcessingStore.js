/**
 * AI Processing Store (Zustand)
 * Replaces AIProcessingContext with better performance
 */

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

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

// Use useShallow to prevent infinite re-renders when returning objects
export const useAIProcessingActions = () => useAIProcessingStore(
  useShallow((state) => ({
    startProcessing: state.startProcessing,
    stopProcessing: state.stopProcessing,
    setProcessing: state.setProcessing,
  }))
)

// Backward compatible hook (matches old useAIProcessing interface)
// Using useShallow to return stable reference and prevent infinite re-renders
export const useAIProcessing = () => useAIProcessingStore(
  useShallow((state) => ({
    isProcessing: state.isProcessing,
    processingType: state.processingType,
    startProcessing: state.startProcessing,
    stopProcessing: state.stopProcessing,
  }))
)

export default useAIProcessingStore
