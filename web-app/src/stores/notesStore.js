/**
 * Notes Store (Zustand)
 * Manages current note selection state
 * Works alongside TanStack Query for data fetching
 */

import { logger } from '../utils/logger'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export const useNotesStore = create((set) => ({
  // Current note ID
  currentNoteId: null,

  // Actions
  setCurrentNoteId: (id) => set({ currentNoteId: id }),
  clearCurrentNote: () => set({ currentNoteId: null }),
}))

// Listen for sign out event to clear state
if (typeof window !== 'undefined') {
  window.addEventListener('auth-signout', () => {
    logger.log('[SECURITY] Clearing notes store on sign out')
    useNotesStore.getState().clearCurrentNote()
  })
}

// Convenience hooks
export const useCurrentNoteId = () => useNotesStore((state) => state.currentNoteId)

// Use useShallow to prevent infinite re-renders when returning objects
export const useNotesActions = () => useNotesStore(
  useShallow((state) => ({
    setCurrentNoteId: state.setCurrentNoteId,
    clearCurrentNote: state.clearCurrentNote,
  }))
)

export default useNotesStore
