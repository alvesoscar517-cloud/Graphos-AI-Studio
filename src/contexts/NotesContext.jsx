/**
 * Notes Context (Refactored to use TanStack Query)
 * 
 * This context now uses TanStack Query hooks internally for better caching.
 * New code should import directly from '@/hooks/queries/useNotes'
 */

import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { 
  useNotes as useNotesQuery, 
  useCreateNote, 
  useUpdateNote, 
  useDeleteNote,
  useSyncNotes,
} from '../hooks/queries/useNotes'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from '../stores/authStore'
import { useNotesStore } from '../stores/notesStore'
import { logError } from '../utils/errors'

const NotesContext = createContext()

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider')
  }
  return context
}

const MAX_VISIBLE_NOTES = 5

// Check if note has meaningful content
const hasContent = (note) => {
  if (!note) return false
  const content = note.content?.trim() || ''
  const title = note.title?.trim() || ''
  return content.length > 0 || (title.length > 0 && title !== 'Untitled')
}

export const NotesProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const prevUserRef = useRef(null)
  
  // Current note state - sync with Zustand store
  const [currentNoteId, setCurrentNoteIdLocal] = useState(null)
  const [needsReauth, setNeedsReauth] = useState(false)
  
  // Get store action once - stable reference
  const setStoreNoteId = useNotesStore.getState().setCurrentNoteId
  
  // Wrapper to sync both local state and Zustand store
  const setCurrentNoteId = useCallback((id) => {
    setCurrentNoteIdLocal(id)
    setStoreNoteId(id)
  }, [setStoreNoteId])
  
  // TanStack Query hooks
  const { data: notes = [], isLoading: loading, refetch } = useNotesQuery({
    enabled: !authLoading && isAuthenticated,
  })
  
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()
  const syncNotesMutation = useSyncNotes()

  // Current note derived from notes list
  const currentNote = useMemo(() => {
    if (!currentNoteId) return null
    return notes.find(n => n.id === currentNoteId) || null
  }, [currentNoteId, notes])

  // Clear notes when user changes or logs out
  useEffect(() => {
    if (authLoading) return

    const prevUser = prevUserRef.current
    const currentUserId = user?.email || user?.id
    const prevUserId = prevUser?.email || prevUser?.id

    // Detect user change
    if (prevUserId && prevUserId !== currentUserId) {
      console.log('[SECURITY] User changed, clearing notes data...')
      setCurrentNoteId(null)
      setNeedsReauth(false)
      queryClient.removeQueries({ queryKey: queryKeys.notes.all })
    }

    // User logged out
    if (!isAuthenticated && prevUser) {
      console.log('[INFO] User logged out, clearing notes')
      setCurrentNoteId(null)
      setNeedsReauth(false)
      queryClient.removeQueries({ queryKey: queryKeys.notes.all })
    }

    prevUserRef.current = user
  }, [user, isAuthenticated, authLoading, queryClient])

  // Create note
  const createNote = useCallback(() => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      type: 'Chat prompt',
      updated: new Date(),
      titleGenerated: false,
      userEditedTitle: false,
    }
    
    // Optimistically add to cache
    queryClient.setQueryData(queryKeys.notes.list(), (old = []) => [...old, newNote])
    setCurrentNoteId(newNote.id)
    
    return newNote
  }, [queryClient])

  // Update note
  const updateNote = useCallback((id, updates, isUserTitleEdit = false) => {
    updateNoteMutation.mutate({ noteId: id, data: updates, isUserTitleEdit })
  }, [updateNoteMutation])

  // Delete note
  const deleteNote = useCallback(async (id) => {
    await deleteNoteMutation.mutateAsync(id)
    
    if (currentNoteId === id) {
      const remaining = notes.filter(n => n.id !== id && hasContent(n))
      setCurrentNoteId(remaining.length > 0 ? remaining[0].id : null)
    }
  }, [deleteNoteMutation, currentNoteId, notes])

  // Load note
  const loadNote = useCallback((id) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      setCurrentNoteId(id)
    }
  }, [notes])

  // Get visible notes
  const getVisibleNotes = useCallback(() => {
    return notes
      .filter(n => hasContent(n))
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, MAX_VISIBLE_NOTES)
  }, [notes])

  // Sync notes from Drive
  const syncNotes = useCallback(async () => {
    try {
      await syncNotesMutation.mutateAsync()
      return true
    } catch (error) {
      logError(error, { context: 'syncNotes' })
      if (error.message === 'NEED_REAUTH') {
        setNeedsReauth(true)
      }
      throw error
    }
  }, [syncNotesMutation])



  const value = useMemo(() => ({
    notes,
    currentNote,
    loading,
    needsReauth,
    createNote,
    updateNote,
    deleteNote,
    loadNote,
    getVisibleNotes,
    syncNotes,
    // Expose mutation states
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    isSyncing: syncNotesMutation.isPending,
  }), [
    notes,
    currentNote,
    loading,
    needsReauth,
    createNote,
    updateNote,
    deleteNote,
    loadNote,
    getVisibleNotes,
    syncNotes,
    createNoteMutation.isPending,
    updateNoteMutation.isPending,
    deleteNoteMutation.isPending,
    syncNotesMutation.isPending,
  ])

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}
