/**
 * App Store (Zustand)
 * Global application state management
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const useAppStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ============================================
      // App State
      // ============================================
      isInitialized: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      version: '1.0.0',

      // ============================================
      // Feature Flags
      // ============================================
      features: {
        darkMode: true,
        notifications: true,
        analytics: false,
        betaFeatures: false,
      },

      // ============================================
      // Active States
      // ============================================
      activeProfileId: null,
      activeConversationId: null,
      activeView: 'main', // 'main' | 'analysis' | 'rewrite' | 'settings'

      // ============================================
      // Search State
      // ============================================
      searchQuery: '',
      searchFilters: {},
      searchResults: [],

      // ============================================
      // Actions - App
      // ============================================
      initialize: () => {
        set({ isInitialized: true })
      },

      setOnline: (isOnline) => set({ isOnline }),

      // ============================================
      // Actions - Features
      // ============================================
      setFeature: (feature, enabled) => {
        set((state) => ({
          features: { ...state.features, [feature]: enabled },
        }))
      },

      toggleFeature: (feature) => {
        set((state) => ({
          features: { ...state.features, [feature]: !state.features[feature] },
        }))
      },

      // ============================================
      // Actions - Active States
      // ============================================
      setActiveProfile: (profileId) => {
        set({ activeProfileId: profileId })
        if (profileId) {
          localStorage.setItem('activeProfileId', profileId)
        } else {
          localStorage.removeItem('activeProfileId')
        }
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId })
      },

      setActiveView: (view) => set({ activeView: view }),

      // ============================================
      // Actions - Search
      // ============================================
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSearchFilters: (filters) => set({ searchFilters: filters }),

      setSearchResults: (results) => set({ searchResults: results }),

      clearSearch: () => set({
        searchQuery: '',
        searchFilters: {},
        searchResults: [],
      }),

      // ============================================
      // Selectors
      // ============================================
      getActiveProfile: () => get().activeProfileId,
      getActiveView: () => get().activeView,
      isFeatureEnabled: (feature) => get().features[feature] ?? false,

      // ============================================
      // Reset
      // ============================================
      reset: () => {
        set({
          activeProfileId: null,
          activeConversationId: null,
          activeView: 'main',
          searchQuery: '',
          searchFilters: {},
          searchResults: [],
        })
      },
    })),
    { name: 'app-store' }
  )
)

// ============================================
// Convenience Hooks (using useShallow to prevent infinite re-renders)
// ============================================

export const useActiveProfile = () => useAppStore(
  useShallow((state) => ({
    activeProfileId: state.activeProfileId,
    setActiveProfile: state.setActiveProfile,
  }))
)

export const useActiveView = () => useAppStore(
  useShallow((state) => ({
    activeView: state.activeView,
    setActiveView: state.setActiveView,
  }))
)

export const useSearch = () => useAppStore(
  useShallow((state) => ({
    searchQuery: state.searchQuery,
    searchFilters: state.searchFilters,
    searchResults: state.searchResults,
    setSearchQuery: state.setSearchQuery,
    setSearchFilters: state.setSearchFilters,
    setSearchResults: state.setSearchResults,
    clearSearch: state.clearSearch,
  }))
)

export const useFeatures = () => useAppStore(
  useShallow((state) => ({
    features: state.features,
    setFeature: state.setFeature,
    toggleFeature: state.toggleFeature,
    isFeatureEnabled: state.isFeatureEnabled,
  }))
)

export const useAppStatus = () => useAppStore(
  useShallow((state) => ({
    isInitialized: state.isInitialized,
    isOnline: state.isOnline,
    version: state.version,
  }))
)

// ============================================
// Online/Offline Listener
// ============================================
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnline(true)
  })

  window.addEventListener('offline', () => {
    useAppStore.getState().setOnline(false)
  })
}

export default useAppStore
