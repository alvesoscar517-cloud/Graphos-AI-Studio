/**
 * Theme Store (Zustand)
 * Replaces ThemeContext with better performance
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Resolve actual dark mode from theme mode
const resolveDarkMode = (themeMode) => {
  if (themeMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return themeMode === 'dark'
}

// Apply dark class to document
const applyTheme = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      themeMode: 'system', // 'light' | 'dark' | 'system'
      isDarkMode: resolveDarkMode('system'),

      // Actions
      setTheme: (mode) => {
        const isDark = resolveDarkMode(mode)
        applyTheme(isDark)
        set({ themeMode: mode, isDarkMode: isDark })
      },

      toggleTheme: () => {
        const { themeMode } = get()
        const newMode = themeMode === 'dark' ? 'light' : 'dark'
        const isDark = newMode === 'dark'
        applyTheme(isDark)
        set({ themeMode: newMode, isDarkMode: isDark })
      },

      // Initialize theme on app start
      initTheme: () => {
        const { themeMode } = get()
        const isDark = resolveDarkMode(themeMode)
        applyTheme(isDark)
        set({ isDarkMode: isDark })
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ themeMode: state.themeMode }),
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration
        if (state) {
          const isDark = resolveDarkMode(state.themeMode)
          applyTheme(isDark)
          state.isDarkMode = isDark
        }
      },
    }
  )
)

// Listen for system preference changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    const state = useThemeStore.getState()
    if (state.themeMode === 'system') {
      applyTheme(e.matches)
      useThemeStore.setState({ isDarkMode: e.matches })
    }
  })
}

// Hook for backward compatibility with useTheme()
export const useTheme = () => {
  const { isDarkMode, themeMode, setTheme, toggleTheme } = useThemeStore()
  return { isDarkMode, themeMode, setTheme, toggleTheme }
}

export default useThemeStore
