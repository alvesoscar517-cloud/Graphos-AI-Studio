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
  
  // Reasoning state for realtime display
  reasoning: {
    isActive: false,
    content: '',
    isComplete: false,
    startTime: null,
  },

  // Actions
  startProcessing: (type) => set({ 
    isProcessing: true, 
    isStreaming: false, 
    processingType: type,
    humanizeProgress: type === 'humanize' ? { currentStep: 'queued' } : null,
    // Only enable reasoning for rewrite and humanize (AI Studio features)
    reasoning: (type === 'rewrite' || type === 'humanize') 
      ? { isActive: true, content: '', isComplete: false, startTime: Date.now() }
      : { isActive: false, content: '', isComplete: false, startTime: null }
  }),
  startStreaming: () => set({ isStreaming: true }), // Call when first chunk received
  stopProcessing: () => set({ 
    isProcessing: false, 
    isStreaming: false, 
    processingType: null,
    humanizeProgress: null,
    reasoning: { isActive: false, content: '', isComplete: false, startTime: null }
  }),
  
  // Update humanize progress
  setHumanizeProgress: (progress) => set({ humanizeProgress: progress }),
  
  // Reasoning actions
  appendReasoning: (chunk) => set((state) => ({
    reasoning: {
      ...state.reasoning,
      content: state.reasoning.content + chunk
    }
  })),
  completeReasoning: () => set((state) => ({
    reasoning: {
      ...state.reasoning,
      isComplete: true
    }
  })),
  clearReasoning: () => set({
    reasoning: { isActive: false, content: '', isComplete: false, startTime: null }
  }),

  // Convenience setters
  setProcessing: (isProcessing, type = null) => set({ 
    isProcessing, 
    isStreaming: false,
    processingType: isProcessing ? type : null,
    humanizeProgress: null,
    reasoning: { isActive: false, content: '', isComplete: false, startTime: null }
  }),
}))

// Convenience hooks for selective subscriptions
export const useIsProcessing = () => useAIProcessingStore((state) => state.isProcessing)
export const useIsStreaming = () => useAIProcessingStore((state) => state.isStreaming)
export const useProcessingType = () => useAIProcessingStore((state) => state.processingType)
export const useHumanizeProgress = () => useAIProcessingStore((state) => state.humanizeProgress)
export const useReasoning = () => useAIProcessingStore((state) => state.reasoning)

// Use useShallow to prevent infinite re-renders when returning objects
export const useAIProcessingActions = () => useAIProcessingStore(
  useShallow((state) => ({
    startProcessing: state.startProcessing,
    startStreaming: state.startStreaming,
    stopProcessing: state.stopProcessing,
    setProcessing: state.setProcessing,
    setHumanizeProgress: state.setHumanizeProgress,
    appendReasoning: state.appendReasoning,
    completeReasoning: state.completeReasoning,
    clearReasoning: state.clearReasoning,
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
    reasoning: state.reasoning,
    startProcessing: state.startProcessing,
    startStreaming: state.startStreaming,
    stopProcessing: state.stopProcessing,
    setHumanizeProgress: state.setHumanizeProgress,
    appendReasoning: state.appendReasoning,
    completeReasoning: state.completeReasoning,
    clearReasoning: state.clearReasoning,
  }))
)

export default useAIProcessingStore
