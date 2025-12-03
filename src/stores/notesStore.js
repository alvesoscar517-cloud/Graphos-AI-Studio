/**
 * Notes Store (Zustand)
 * Manages current note selection state
 * Works alongside TanStack Query for data fetching
 */

import { create } from 'zustand'

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
    console.log('[SECURITY] Clearing notes store on sign out')
    useNotesStore.getState().clearCurrentNote()
  })
}

// Convenience hooks
export const useCurrentNoteId = () => useNotesStore((state) => state.currentNoteId)

export const useNotesActions = () => useNotesStore((state) => ({
  setCurrentNoteId: state.setCurrentNoteId,
  clearCurrentNote: state.clearCurrentNote,
}))

export default useNotesStore
