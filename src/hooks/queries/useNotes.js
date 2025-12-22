/**
 * Notes Query Hooks
 * 
 * Re-exports from Firestore hooks for backward compatibility.
 * New code should use NotesContext or import directly from db/hooks.
 */

import { useNotes as useNotesFirestore, useNoteMutations } from '../../db/hooks'
import { useAuth } from '../../stores/authStore'
import { useMemo } from 'react'

const MAX_VISIBLE_NOTES = 5

// Check if note has meaningful content
const hasContent = (note) => {
  if (!note) return false
  const content = note.content?.trim() || ''
  const title = note.title?.trim() || ''
  return content.length > 0 || (title.length > 0 && title !== 'Untitled')
}

/**
 * Fetch all notes for current user
 */
export function useNotes(options = {}) {
  const { user } = useAuth()
  const userId = user?.userId || user?.uid || user?.id
  const { notes, loading, error } = useNotesFirestore(userId)
  
  return {
    data: notes,
    isLoading: loading,
    error,
    refetch: () => {} // Firestore auto-updates
  }
}

/**
 * Get visible notes (most recent with content)
 */
export function useVisibleNotes() {
  const { data: notes = [], isLoading, error } = useNotes()
  
  const visibleNotes = useMemo(() => {
    return notes
      .filter(n => hasContent(n))
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, MAX_VISIBLE_NOTES)
  }, [notes])
  
  return { data: visibleNotes, notes, isLoading, error }
}

/**
 * Create note mutation
 */
export function useCreateNote() {
  const { user } = useAuth()
  const userId = user?.userId || user?.uid || user?.id
  const { createNote } = useNoteMutations()
  
  return {
    mutateAsync: async (noteData = {}) => {
      return await createNote(userId, noteData)
    },
    mutate: (noteData = {}) => {
      createNote(userId, noteData)
    }
  }
}

/**
 * Update note mutation
 */
export function useUpdateNote() {
  const { updateNote } = useNoteMutations()
  
  return {
    mutateAsync: async ({ noteId, data }) => {
      return await updateNote(noteId, data)
    },
    mutate: ({ noteId, data }) => {
      updateNote(noteId, data)
    }
  }
}

/**
 * Delete note mutation
 */
export function useDeleteNote() {
  const { deleteNote } = useNoteMutations()
  
  return {
    mutateAsync: async ({ noteId }) => {
      return await deleteNote(noteId)
    },
    mutate: ({ noteId }) => {
      deleteNote(noteId)
    }
  }
}

/**
 * Sync notes - no-op with Firestore (auto-syncs)
 */
export function useSyncNotes() {
  return {
    mutateAsync: async () => {},
    mutate: () => {}
  }
}

export { hasContent }
