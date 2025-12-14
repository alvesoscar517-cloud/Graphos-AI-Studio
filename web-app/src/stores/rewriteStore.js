/**
 * Rewrite Store (Zustand)
 * Replaces RewriteContext with better performance
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const useRewriteStore = create(
  persist(
    (set, get) => ({
      // State
      selectedModel: 'gemini-2.5-flash',
      writingPreferences: {
        // Original preferences
        useVocabularyPreferences: true,
        useKeyCharacteristics: true,
        useSentencePatterns: true,
        useRewriteInstructions: true,
        // Humanization preferences
        useAntiAIDetection: true,
        useIterativeRefinement: false,
        targetAIProbability: 35,
      },

      // Actions
      setSelectedModel: (model) => set({ selectedModel: model }),

      setWritingPreferences: (preferences) => set((state) => ({
        writingPreferences: typeof preferences === 'function'
          ? preferences(state.writingPreferences)
          : { ...state.writingPreferences, ...preferences }
      })),

      updatePreference: (key, value) => set((state) => ({
        writingPreferences: { ...state.writingPreferences, [key]: value }
      })),

      resetPreferences: () => set({
        writingPreferences: {
          useVocabularyPreferences: true,
          useKeyCharacteristics: true,
          useSentencePatterns: true,
          useRewriteInstructions: true,
          useAntiAIDetection: true,
          useIterativeRefinement: false,
          targetAIProbability: 35,
        }
      }),

      // Getters
      getPreference: (key) => get().writingPreferences[key],
    }),
    {
      name: 'rewrite-storage',
      version: 1, // Increment when schema changes
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        writingPreferences: state.writingPreferences,
      }),
      // Migrate old model names to new ones
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migrate from gemini-2.0 to gemini-2.5
          if (persistedState.selectedModel?.includes('2.0')) {
            persistedState.selectedModel = 'gemini-2.5-flash'
          }
        }
        return persistedState
      },
    }
  )
)

// Convenience hooks
export const useSelectedModel = () => useRewriteStore((state) => state.selectedModel)
export const useWritingPreferences = () => useRewriteStore((state) => state.writingPreferences)

// Use useShallow to prevent infinite re-renders when returning objects
export const useRewriteActions = () => useRewriteStore(
  useShallow((state) => ({
    setSelectedModel: state.setSelectedModel,
    setWritingPreferences: state.setWritingPreferences,
    updatePreference: state.updatePreference,
    resetPreferences: state.resetPreferences,
  }))
)

// Backward compatible hook (matches old useRewrite interface)
// Using useShallow to return stable reference and prevent infinite re-renders
export const useRewrite = () => useRewriteStore(
  useShallow((state) => ({
    selectedModel: state.selectedModel,
    writingPreferences: state.writingPreferences,
    setSelectedModel: state.setSelectedModel,
    setWritingPreferences: state.setWritingPreferences,
  }))
)

export default useRewriteStore
