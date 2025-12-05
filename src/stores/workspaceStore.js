/**
 * Workspace Store (Zustand)
 * Manages current conversation and model settings
 * Works alongside TanStack Query for data fetching
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // Current conversation state
      currentConversationId: null,
      
      // Model settings
      modelSettings: {
        model: 'gemini-2.0-flash-exp',
        temperature: 0.7,
        maxTokens: 2048,
        writingPreferences: {
          useVocabularyPreferences: true,
          useKeyCharacteristics: true,
          useSentencePatterns: true,
          useRewriteInstructions: true,
        },
        chatSettings: {
          humanizeResponse: false,
          useAntiAIDetection: false,
        },
      },

      // UI state
      isLoading: false,
      error: null,

      // Actions - Conversation
      setCurrentConversation: (id) => set({ currentConversationId: id }),
      clearCurrentConversation: () => set({ currentConversationId: null }),

      // Actions - Model Settings
      updateModelSettings: (settings) => set((state) => ({
        modelSettings: { ...state.modelSettings, ...settings }
      })),

      setModel: (model) => set((state) => ({
        modelSettings: { ...state.modelSettings, model }
      })),

      setTemperature: (temperature) => set((state) => ({
        modelSettings: { ...state.modelSettings, temperature }
      })),

      updateWritingPreferences: (preferences) => set((state) => ({
        modelSettings: {
          ...state.modelSettings,
          writingPreferences: { ...state.modelSettings.writingPreferences, ...preferences }
        }
      })),

      updateChatSettings: (settings) => set((state) => ({
        modelSettings: {
          ...state.modelSettings,
          chatSettings: { ...state.modelSettings.chatSettings, ...settings }
        }
      })),

      // Actions - Loading/Error
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset
      reset: () => set({
        currentConversationId: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        modelSettings: state.modelSettings,
      }),
    }
  )
)

// Convenience hooks
export const useCurrentConversationId = () => useWorkspaceStore((state) => state.currentConversationId)
export const useModelSettings = () => useWorkspaceStore((state) => state.modelSettings)
export const useWorkspaceLoading = () => useWorkspaceStore((state) => state.isLoading)
export const useWorkspaceError = () => useWorkspaceStore((state) => state.error)

// Use useShallow to prevent infinite re-renders when returning objects
export const useWorkspaceActions = () => useWorkspaceStore(
  useShallow((state) => ({
    setCurrentConversation: state.setCurrentConversation,
    clearCurrentConversation: state.clearCurrentConversation,
    updateModelSettings: state.updateModelSettings,
    setModel: state.setModel,
    setTemperature: state.setTemperature,
    updateWritingPreferences: state.updateWritingPreferences,
    updateChatSettings: state.updateChatSettings,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    reset: state.reset,
  }))
)

// Listen for sign out event to clear state
if (typeof window !== 'undefined') {
  window.addEventListener('auth-signout', () => {
    console.log('[SECURITY] Clearing workspace store on sign out')
    useWorkspaceStore.getState().reset()
  })
}

export default useWorkspaceStore
