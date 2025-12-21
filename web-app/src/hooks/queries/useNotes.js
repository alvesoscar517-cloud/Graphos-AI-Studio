/**
 * Notes Query Hooks
 * TanStack Query hooks for notes management with IndexedDB + Firestore sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { queryKeys } from '@/lib/queryKeys'
import { 
  initDB, 
  getNotesFromDB, 
  saveNotesToDB, 
  saveNoteToDB, 
  deleteNoteFromDB 
} from '@/services/indexedDB'
import { useNotesStore } from '@/stores/notesStore'
import { queueSync, SyncOperation, isNetworkOnline } from '@/services/syncService'

const MAX_VISIBLE_NOTES = 5

// Check if note has meaningful content
const hasContent = (note) => {
  if (!note) return false
  const content = note.content?.trim() || ''
  const title = note.title?.trim() || ''
  return content.length > 0 || (title.length > 0 && title !== 'Untitled')
}

// Truncate title to max words
const truncateTitleToWords = (title, maxWords = 7) => {
  if (!title) return title
  const words = title.trim().split(/\s+/)
  if (words.length <= maxWords) return title
  return words.slice(0, maxWords).join(' ') + '...'
}

/**
 * Fetch all notes from IndexedDB with Firestore sync
 */
export function useNotes(options = {}) {
  return useQuery({
    queryKey: queryKeys.notes.list(),
    queryFn: async () => {
      // Initialize IndexedDB
      await initDB()
      
      // Load from IndexedDB first (fast, offline-first)
      let notes = await getNotesFromDB()
      
      // Migration: Remove visible flag from old notes
      notes = notes.map(note => {
        const { visible, ...rest } = note
        return rest
      })
      
      return notes
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Fetch single note by ID
 */
export function useNote(noteId, options = {}) {
  const { data: notes = [] } = useNotes()
  
  return useQuery({
    queryKey: queryKeys.notes.detail(noteId),
    queryFn: () => notes.find(n => n.id === noteId) || null,
    enabled: !!noteId && notes.length > 0,
    ...options,
  })
}

/**
 * Create new note with optimistic update
 */
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteData = {}) => {
      const newNote = {
        id: Date.now().toString(),
        title: 'Untitled',
        content: '',
        type: 'Chat prompt',
        updated: new Date(),
        titleGenerated: false,
        userEditedTitle: false,
        syncStatus: 'pending',
        ...noteData,
      }
      return newNote
    },
    onSuccess: (newNote) => {
      queryClient.setQueryData(queryKeys.notes.list(), (old = []) => [
        ...old,
        newNote,
      ])
    },
  })
}

/**
 * Update note with optimistic update and auto-save to Firestore
 */
export function useUpdateNote() {
  const queryClient = useQueryClient()
  let saveTimeout = null

  return useMutation({
    mutationFn: async ({ noteId, data, isUserTitleEdit = false, userId }) => {
      const notes = queryClient.getQueryData(queryKeys.notes.list()) || []
      const existingNote = notes.find(n => n.id === noteId)
      if (!existingNote) throw new Error('Note not found')

      const titleUpdates = isUserTitleEdit ? { userEditedTitle: true } : {}
      const updatedNote = { 
        ...existingNote, 
        ...data, 
        ...titleUpdates, 
        updated: new Date(),
        syncStatus: 'pending'
      }

      // Save to IndexedDB immediately
      await saveNoteToDB(updatedNote)

      // Queue Firestore sync with debounce (only if has content)
      if (hasContent(updatedNote) && userId) {
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(async () => {
          try {
            if (isNetworkOnline()) {
              await queueSync({
                entityType: 'note',
                entityId: noteId,
                operation: SyncOperation.UPDATE,
                data: updatedNote,
                userId
              })
            }
          } catch (err) {
            console.error('Auto-save to Firestore failed:', err)
          }
        }, 2000)
      }

      return updatedNote
    },
    onMutate: async ({ noteId, data, isUserTitleEdit = false }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list() })
      const previousNotes = queryClient.getQueryData(queryKeys.notes.list())

      const titleUpdates = isUserTitleEdit ? { userEditedTitle: true } : {}
      queryClient.setQueryData(queryKeys.notes.list(), (old = []) =>
        old.map((note) =>
          note.id === noteId
            ? { ...note, ...data, ...titleUpdates, updated: new Date() }
            : note
        )
      )

      return { previousNotes }
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(queryKeys.notes.list(), context?.previousNotes)
    },
  })
}

/**
 * Delete note with optimistic update
 */
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ noteId, userId }) => {
      // Delete from IndexedDB
      await deleteNoteFromDB(noteId)

      // Queue Firestore delete
      if (userId && isNetworkOnline()) {
        try {
          await queueSync({
            entityType: 'note',
            entityId: noteId,
            operation: SyncOperation.DELETE,
            data: null,
            userId
          })
        } catch (err) {
          console.error('Failed to queue Firestore delete:', err)
        }
      }

      return noteId
    },
    onMutate: async ({ noteId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list() })
      const previousNotes = queryClient.getQueryData(queryKeys.notes.list())

      queryClient.setQueryData(queryKeys.notes.list(), (old = []) =>
        old.filter((note) => note.id !== noteId)
      )

      return { previousNotes }
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(queryKeys.notes.list(), context?.previousNotes)
    },
  })
}

/**
 * Search notes (client-side filtering)
 */
export function useSearchNotes(searchTerm, options = {}) {
  const { data: notes = [] } = useNotes()
  
  return useQuery({
    queryKey: [...queryKeys.notes.all, 'search', searchTerm],
    queryFn: () => {
      if (!searchTerm || searchTerm.length < 2) return []
      const term = searchTerm.toLowerCase()
      return notes.filter(note => 
        note.title?.toLowerCase().includes(term) ||
        note.content?.toLowerCase().includes(term)
      )
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000,
    ...options,
  })
}

/**
 * Get visible notes (most recent with content)
 */
export function useVisibleNotes() {
  const { data: notes = [], ...rest } = useNotes()
  
  const visibleNotes = useMemo(() => {
    return notes
      .filter(n => hasContent(n))
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, MAX_VISIBLE_NOTES)
  }, [notes])
  
  return { data: visibleNotes, notes, ...rest }
}

/**
 * Current note state management
 */
export function useCurrentNote() {
  const [currentNoteId, setCurrentNoteId] = useState(null)
  const { data: notes = [] } = useNotes()
  
  const currentNote = useMemo(() => {
    if (!currentNoteId) return null
    return notes.find(n => n.id === currentNoteId) || null
  }, [currentNoteId, notes])
  
  const loadNote = useCallback((id) => {
    setCurrentNoteId(id)
  }, [])
  
  const clearNote = useCallback(() => {
    setCurrentNoteId(null)
  }, [])
  
  return { currentNote, currentNoteId, loadNote, clearNote, setCurrentNoteId }
}

/**
 * Generate title from first characters of content (no AI call)
 */
export function useGenerateTitle() {
  return useMutation({
    mutationFn: async (content) => {
      // Use first sentence or first part of content as title
      const firstSentence = content.split(/[.!?。\n]/)[0]?.trim() || content
      return truncateTitleToWords(firstSentence, 7)
    },
  })
}

/**
 * Sync notes from Firestore
 */
export function useSyncNotes() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId) => {
      if (!userId || !isNetworkOnline()) {
        throw new Error('Cannot sync: offline or no user')
      }
      
      const { getNotes } = await import('@/services/firestoreDataService')
      const { notes: firestoreNotes } = await getNotes(userId, { pageSize: 100 })
      
      // Merge with local notes
      const localNotes = await getNotesFromDB()
      const firestoreIds = new Set(firestoreNotes.map(n => n.id))
      
      // Keep local notes that aren't in Firestore yet
      const localOnly = localNotes.filter(n => !firestoreIds.has(n.id))
      
      const merged = [...firestoreNotes, ...localOnly]
      await saveNotesToDB(merged)
      
      return merged
    },
    onSuccess: (notes) => {
      queryClient.setQueryData(queryKeys.notes.list(), notes)
    },
  })
}


/**
 * Hook to get current note using Zustand store for ID and TanStack Query for data
 * This is the preferred way to access current note in new components
 */
export function useCurrentNoteWithStore() {
  const { data: notes = [] } = useNotes()
  
  // Import store dynamically to avoid circular dependency
  const [currentNoteId, setCurrentNoteId] = useState(null)
  
  // Sync with store
  useEffect(() => {
    const unsubscribe = useNotesStore.subscribe(
      (state) => state.currentNoteId,
      (id) => setCurrentNoteId(id)
    )
    // Get initial value
    setCurrentNoteId(useNotesStore.getState().currentNoteId)
    return unsubscribe
  }, [])
  
  const currentNote = useMemo(() => {
    if (!currentNoteId) return null
    return notes.find(n => n.id === currentNoteId) || null
  }, [currentNoteId, notes])
  
  return { currentNote, currentNoteId, notes }
}
