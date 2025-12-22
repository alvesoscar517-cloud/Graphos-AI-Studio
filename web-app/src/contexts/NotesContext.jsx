/**
 * Notes Context with RxDB
 * 
 * Simplified notes management using RxDB for offline-first data
 * with automatic Firestore sync.
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '../stores/authStore'
import { useNotesStore } from '../stores/notesStore'
import { 
  useNotes as useNotesRx, 
  useNoteMutations,
  useRxDBSync 
} from '../db/hooks'

const NotesContext = createContext()

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
  
  // Get userId for RxDB
  const userId = user?.userId || user?.uid || user?.id
  
  // Setup RxDB sync
  useRxDBSync(userId)
  
  // Get notes from RxDB (reactive)
  const { notes: rxNotes, loading: notesLoading } = useNotesRx(userId)
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
    return rxNotes.find(n => n.id === currentNoteId) || null
  }, [currentNoteId, rxNotes])

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
      
      const noteObj = newNote.toJSON ? newNote.toJSON() : newNote
      setCurrentNoteId(noteObj.id)
      
      logger.log('[NOTES] Created new note:', noteObj.id)
      return noteObj
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
      const noteObj = saved.toJSON ? saved.toJSON() : saved
      logger.log('[NOTES] Saved note:', noteObj.id)
      return noteObj
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
        // Select next note or null
        const remainingNotes = rxNotes.filter(n => n.id !== noteId)
        setCurrentNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null)
      }
      
      logger.log('[NOTES] Deleted note:', noteId)
    } catch (err) {
      logger.error('Notes', 'Failed to delete note', err)
    }
  }, [removeNote, currentNoteId, rxNotes, setCurrentNoteId])

  // Delete multiple notes
  const deleteMultipleNotes = useCallback(async (noteIds) => {
    try {
      await deleteNotes(noteIds)
      
      if (noteIds.includes(currentNoteId)) {
        const remainingNotes = rxNotes.filter(n => !noteIds.includes(n.id))
        setCurrentNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null)
      }
      
      logger.log('[NOTES] Deleted multiple notes:', noteIds.length)
    } catch (err) {
      logger.error('Notes', 'Failed to delete notes', err)
    }
  }, [deleteNotes, currentNoteId, rxNotes, setCurrentNoteId])

  // Load note
  const loadNote = useCallback((noteId) => {
    setCurrentNoteId(noteId)
  }, [setCurrentNoteId])

  // Toggle pin
  const togglePin = useCallback(async (noteId) => {
    const note = rxNotes.find(n => n.id === noteId)
    if (note) {
      await updateNote(noteId, { isPinned: !note.isPinned })
    }
  }, [rxNotes, updateNote])

  // Toggle archive
  const toggleArchive = useCallback(async (noteId) => {
    const note = rxNotes.find(n => n.id === noteId)
    if (note) {
      await updateNote(noteId, { isArchived: !note.isArchived })
    }
  }, [rxNotes, updateNote])

  // Get visible notes (most recent with content)
  const getVisibleNotes = useCallback(() => {
    const MAX_VISIBLE = 5
    return rxNotes
      .filter(n => hasContent(n) && !n.isArchived)
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, MAX_VISIBLE)
  }, [rxNotes])

  // Filter notes
  const pinnedNotes = useMemo(() => 
    rxNotes.filter(n => n.isPinned && !n.isArchived), 
    [rxNotes]
  )
  
  const archivedNotes = useMemo(() => 
    rxNotes.filter(n => n.isArchived), 
    [rxNotes]
  )
  
  const activeNotes = useMemo(() => 
    rxNotes.filter(n => !n.isArchived), 
    [rxNotes]
  )

  const value = {
    // Data
    notes: rxNotes,
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
    
    // Compatibility
    refetch: () => {}, // RxDB auto-updates
    hasContent
  }

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  )
}

export default NotesContext
