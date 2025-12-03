/**
 * Rewrite Store (Zustand)
 * Replaces RewriteContext with better performance
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        writingPreferences: state.writingPreferences,
      }),
    }
  )
)

// Convenience hooks
export const useSelectedModel = () => useRewriteStore((state) => state.selectedModel)
export const useWritingPreferences = () => useRewriteStore((state) => state.writingPreferences)

export const useRewriteActions = () => useRewriteStore((state) => ({
  setSelectedModel: state.setSelectedModel,
  setWritingPreferences: state.setWritingPreferences,
  updatePreference: state.updatePreference,
  resetPreferences: state.resetPreferences,
}))

// Backward compatible hook (matches old useRewrite interface)
export const useRewrite = () => {
  const selectedModel = useRewriteStore((state) => state.selectedModel)
  const writingPreferences = useRewriteStore((state) => state.writingPreferences)
  const setSelectedModel = useRewriteStore((state) => state.setSelectedModel)
  const setWritingPreferences = useRewriteStore((state) => state.setWritingPreferences)

  return { selectedModel, setSelectedModel, writingPreferences, setWritingPreferences }
}

export default useRewriteStore
