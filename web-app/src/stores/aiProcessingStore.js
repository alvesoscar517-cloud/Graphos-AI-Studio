/**
 * AI Processing Store (Zustand)
 * Replaces AIProcessingContext with better performance
 */

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export const useAIProcessingStore = create((set) => ({
  // State
  isProcessing: false,
  isStreaming: false, // true when streaming response is being received
  processingType: null, // 'detect' | 'analyze' | 'rewrite' | 'chat' | 'humanize' | null
  
  // Humanize progress state (for iterative refinement)
  humanizeProgress: null, // { currentStep, currentIteration, totalIterations, aiProbability }

  // Actions
  startProcessing: (type) => set({ 
    isProcessing: true, 
    isStreaming: false, 
    processingType: type,
    humanizeProgress: type === 'humanize' ? { currentStep: 'queued' } : null
  }),
  startStreaming: () => set({ isStreaming: true }), // Call when first chunk received
  stopProcessing: () => set({ 
    isProcessing: false, 
    isStreaming: false, 
    processingType: null,
    humanizeProgress: null
  }),
  
  // Update humanize progress
  setHumanizeProgress: (progress) => set({ humanizeProgress: progress }),

  // Convenience setters
  setProcessing: (isProcessing, type = null) => set({ 
    isProcessing, 
    isStreaming: false,
    processingType: isProcessing ? type : null,
    humanizeProgress: null
  }),
}))

// Convenience hooks for selective subscriptions
export const useIsProcessing = () => useAIProcessingStore((state) => state.isProcessing)
export const useIsStreaming = () => useAIProcessingStore((state) => state.isStreaming)
export const useProcessingType = () => useAIProcessingStore((state) => state.processingType)
export const useHumanizeProgress = () => useAIProcessingStore((state) => state.humanizeProgress)

// Use useShallow to prevent infinite re-renders when returning objects
export const useAIProcessingActions = () => useAIProcessingStore(
  useShallow((state) => ({
    startProcessing: state.startProcessing,
    startStreaming: state.startStreaming,
    stopProcessing: state.stopProcessing,
    setProcessing: state.setProcessing,
    setHumanizeProgress: state.setHumanizeProgress,
  }))
)

// Backward compatible hook (matches old useAIProcessing interface)
// Using useShallow to return stable reference and prevent infinite re-renders
export const useAIProcessing = () => useAIProcessingStore(
  useShallow((state) => ({
    isProcessing: state.isProcessing,
    isStreaming: state.isStreaming,
    processingType: state.processingType,
    humanizeProgress: state.humanizeProgress,
    startProcessing: state.startProcessing,
    startStreaming: state.startStreaming,
    stopProcessing: state.stopProcessing,
    setHumanizeProgress: state.setHumanizeProgress,
  }))
)

export default useAIProcessingStore
