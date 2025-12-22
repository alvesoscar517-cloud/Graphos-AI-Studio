/**
 * Notes Context with Firestore
 * 
 * Notes management using Firestore for real-time sync.
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '../stores/authStore'
import { useNotesStore } from '../stores/notesStore'
import { useNotes as useNotesFirestore, useNoteMutations } from '../db/hooks'

const NotesContext = createContext(null)

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider')
  }
  return context
}

// Check if note has meaningful content
const hasContent = (note) => {
  if (!note) return false
  let content = note.content?.trim() || ''
  const plainText = content.replace(/<[^>]*>/g, '').trim()
  const title = note.title?.trim() || ''
  return plainText.length > 0 || (title.length > 0 && title !== 'Untitled')
}

export const NotesProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const prevUserRef = useRef(null)
  
  // Get userId - prefer Firebase Auth uid for Firestore compatibility
  const userId = user?.uid || user?.userId || user?.id
  
  // Get notes from Firestore (reactive)
  const { notes: firestoreNotes, loading: notesLoading } = useNotesFirestore(userId)
  const { createNote, updateNote, saveNote, deleteNote: removeNote, deleteNotes } = useNoteMutations()
  
  // Current note state
  const [currentNoteId, setCurrentNoteIdLocal] = useState(null)
  
  // Sync with Zustand store
  const setStoreNoteId = useNotesStore.getState().setCurrentNoteId
  
  const setCurrentNoteId = useCallback((id) => {
    setCurrentNoteIdLocal(id)
    setStoreNoteId(id)
  }, [setStoreNoteId])

  // Current note derived from notes list
  const currentNote = useMemo(() => {
    if (!currentNoteId) return null
    return firestoreNotes.find(n => n.id === currentNoteId) || null
  }, [currentNoteId, firestoreNotes])

  // Clear notes when user changes
  useEffect(() => {
    if (authLoading) return

    const prevUserId = prevUserRef.current
    
    if (prevUserId && prevUserId !== userId) {
      logger.log('[SECURITY] User changed, clearing notes data...')
      setCurrentNoteId(null)
    }

    if (!isAuthenticated && prevUserRef.current) {
      setCurrentNoteId(null)
    }

    prevUserRef.current = userId
  }, [userId, isAuthenticated, authLoading, setCurrentNoteId])

  // Create new note
  const createNewNote = useCallback(async (noteData = {}) => {
    if (!userId) return null
    
    try {
      const newNote = await createNote(userId, {
        title: noteData.title || 'Untitled',
        content: noteData.content || '',
        tags: noteData.tags || [],
        folder: noteData.folder || null,
        isPinned: false,
        isArchived: false
      })
      
      if (!newNote) {
        logger.warn('Notes', 'Failed to create note')
        return null
      }
      
      setCurrentNoteId(newNote.id)
      logger.log('[NOTES] Created new note:', newNote.id)
      return newNote
    } catch (err) {
      logger.error('Notes', 'Failed to create note', err)
      return null
    }
  }, [userId, createNote, setCurrentNoteId])

  // Update note
  const updateNoteContent = useCallback(async (noteId, updates) => {
    if (!noteId) return
    
    try {
      await updateNote(noteId, updates)
      logger.log('[NOTES] Updated note:', noteId)
    } catch (err) {
      logger.error('Notes', 'Failed to update note', err)
    }
  }, [updateNote])

  // Save note (upsert)
  const saveNoteData = useCallback(async (noteData) => {
    if (!userId) return null
    
    try {
      const saved = await saveNote(userId, noteData)
      if (!saved) {
        logger.warn('Notes', 'Failed to save note')
        return null
      }
      logger.log('[NOTES] Saved note:', saved.id)
      return saved
    } catch (err) {
      logger.error('Notes', 'Failed to save note', err)
      return null
    }
  }, [userId, saveNote])

  // Delete note
  const deleteNoteById = useCallback(async (noteId) => {
    try {
      await removeNote(noteId)
      
      if (currentNoteId === noteId) {
        const remainingNotes = firestoreNotes.filter(n => n.id !== noteId)
        setCurrentNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null)
      }
      
      logger.log('[NOTES] Deleted note:', noteId)
    } catch (err) {
      logger.error('Notes', 'Failed to delete note', err)
    }
  }, [removeNote, currentNoteId, firestoreNotes, setCurrentNoteId])

  // Delete multiple notes
  const deleteMultipleNotes = useCallback(async (noteIds) => {
    try {
      await deleteNotes(noteIds)
      
      if (noteIds.includes(currentNoteId)) {
        const remainingNotes = firestoreNotes.filter(n => !noteIds.includes(n.id))
        setCurrentNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null)
      }
      
      logger.log('[NOTES] Deleted multiple notes:', noteIds.length)
    } catch (err) {
      logger.error('Notes', 'Failed to delete notes', err)
    }
  }, [deleteNotes, currentNoteId, firestoreNotes, setCurrentNoteId])

  // Load note
  const loadNote = useCallback((noteId) => {
    setCurrentNoteId(noteId)
  }, [setCurrentNoteId])

  // Toggle pin
  const togglePin = useCallback(async (noteId) => {
    const note = firestoreNotes.find(n => n.id === noteId)
    if (note) {
      await updateNote(noteId, { isPinned: !note.isPinned })
    }
  }, [firestoreNotes, updateNote])

  // Toggle archive
  const toggleArchive = useCallback(async (noteId) => {
    const note = firestoreNotes.find(n => n.id === noteId)
    if (note) {
      await updateNote(noteId, { isArchived: !note.isArchived })
    }
  }, [firestoreNotes, updateNote])

  // Get visible notes (most recent with content)
  const getVisibleNotes = useCallback(() => {
    const MAX_VISIBLE = 5
    return firestoreNotes
      .filter(n => hasContent(n) && !n.isArchived)
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, MAX_VISIBLE)
  }, [firestoreNotes])

  // Filter notes
  const pinnedNotes = useMemo(() => 
    firestoreNotes.filter(n => n.isPinned && !n.isArchived), 
    [firestoreNotes]
  )
  
  const archivedNotes = useMemo(() => 
    firestoreNotes.filter(n => n.isArchived), 
    [firestoreNotes]
  )
  
  const activeNotes = useMemo(() => 
    firestoreNotes.filter(n => !n.isArchived), 
    [firestoreNotes]
  )

  const value = {
    // Data
    notes: firestoreNotes,
    activeNotes,
    pinnedNotes,
    archivedNotes,
    currentNote,
    currentNoteId,
    loading: notesLoading || authLoading,
    
    // Actions
    createNote: createNewNote,
    updateNote: updateNoteContent,
    saveNote: saveNoteData,
    deleteNote: deleteNoteById,
    deleteNotes: deleteMultipleNotes,
    loadNote,
    setCurrentNoteId,
    togglePin,
    toggleArchive,
    getVisibleNotes,
    
    // Compatibility - Firestore auto-syncs, these are no-ops
    syncNotes: async () => { logger.log('[NOTES] Sync requested - Firestore auto-syncs') },
    refetch: () => {},
    needsReauth: false,
    hasContent
  }

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  )
}

export default NotesContext
