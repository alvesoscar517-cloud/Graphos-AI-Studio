/**
 * Firestore Notes Query Hooks
 * TanStack Query hooks for notes management with IndexedDB + Firestore sync
 * 
 * Requirements: 6.1, 6.7, 6.8
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { queryKeys } from '@/lib/queryKeys'
import { 
  initDB, 
  getNotesFromDB, 
  saveNotesToDB, 
  saveNoteToDB, 
  deleteNoteFromDB,
  SyncStatus
} from '@/services/indexedDB'
import { 
  getNotes as getNotesFromFirestore, 
  saveNote as saveNoteToFirestore, 
  deleteNote as deleteNoteFromFirestore,
  saveNotesBatch
} from '@/services/firestoreDataService'
import { queueSync, isNetworkOnline, SyncOperation } from '@/services/syncService'
import { useNotesStore } from '@/stores/notesStore'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'

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
 * Fetch all notes with offline-first strategy
 * 1. Load from IndexedDB immediately (fast)
 * 2. Sync with Firestore in background if online
 */
export function useFirestoreNotes(options = {}) {
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  // Firestore rules require userId in document to match request.auth.uid
  const userId = user?.userId || user?.uid || user?.id
  
  return useQuery({
    queryKey: queryKeys.notes.list(),
    queryFn: async () => {
      // Initialize IndexedDB
      await initDB()
      
      // Load from IndexedDB first (fast, offline-first) - filter by userId
      let notes = await getNotesFromDB(userId)
      
      // Try to sync with Firestore in background if online
      if (isNetworkOnline() && userId) {
        try {
          const { notes: firestoreNotes } = await getNotesFromFirestore(userId, { pageSize: 500 })
          
          if (firestoreNotes.length > 0) {
            // Merge: Firestore is source of truth for synced items
            const mergedNotes = mergeNotes(notes, firestoreNotes)
            
            // Update IndexedDB cache - pass userId to only update this user's notes
            await saveNotesToDB(mergedNotes, userId)
            
            logger.log('[useFirestoreNotes] Synced', firestoreNotes.length, 'notes from Firestore')
            return mergedNotes
          }
        } catch (err) {
          logger.warn('Firestore', 'Sync failed, using cached notes:', err.message)
        }
      }
      
      return notes
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!userId,
    ...options,
  })
}

/**
 * Merge local and remote notes
 * Strategy: Last write wins based on updated timestamp
 */
function mergeNotes(localNotes, remoteNotes) {
  const merged = new Map()
  
  // Add remote notes first
  remoteNotes.forEach(note => {
    merged.set(note.id, { ...note, syncStatus: SyncStatus.SYNCED })
  })
  
  // Merge local notes
  localNotes.forEach(note => {
    const existing = merged.get(note.id)
    
    if (!existing) {
      // Local-only note (not yet synced)
      merged.set(note.id, { ...note, syncStatus: note.syncStatus || SyncStatus.PENDING })
    } else if (note.syncStatus === SyncStatus.PENDING) {
      // Local has pending changes - keep local if newer
      const localUpdated = new Date(note.updated).getTime()
      const remoteUpdated = new Date(existing.updated).getTime()
      
      if (localUpdated > remoteUpdated) {
        merged.set(note.id, note)
      }
    }
  })
  
  return Array.from(merged.values())
}

/**
 * Fetch single note by ID
 */
export function useFirestoreNote(noteId, options = {}) {
  const { data: notes = [] } = useFirestoreNotes()
  
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
export function useCreateFirestoreNote() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id

  return useMutation({
    mutationFn: async (noteData = {}) => {
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Untitled',
        content: '',
        type: 'Chat prompt',
        created: new Date(),
        updated: new Date(),
        titleGenerated: false,
        userEditedTitle: false,
        userId,
        syncStatus: SyncStatus.PENDING,
        ...noteData,
      }
      
      // Save to IndexedDB immediately
      await saveNoteToDB(newNote)
      
      // Queue sync to Firestore
      if (userId) {
        await queueSync({
          entityType: 'note',
          entityId: newNote.id,
          operation: SyncOperation.CREATE,
          data: newNote,
          userId
        })
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
 * Update note with optimistic update and auto-sync
 */
export function useUpdateFirestoreNote() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id
  let saveTimeout = null

  return useMutation({
    mutationFn: async ({ noteId, data, isUserTitleEdit = false }) => {
      const notes = queryClient.getQueryData(queryKeys.notes.list()) || []
      const existingNote = notes.find(n => n.id === noteId)
      if (!existingNote) throw new Error('Note not found')

      const titleUpdates = isUserTitleEdit ? { userEditedTitle: true } : {}
      const updatedNote = { 
        ...existingNote, 
        ...data, 
        ...titleUpdates, 
        updated: new Date(),
        syncStatus: SyncStatus.PENDING
      }

      // Save to IndexedDB immediately
      await saveNoteToDB(updatedNote)

      // Debounced sync to Firestore (only if has content)
      if (hasContent(updatedNote) && userId) {
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(async () => {
          await queueSync({
            entityType: 'note',
            entityId: noteId,
            operation: SyncOperation.UPDATE,
            data: updatedNote,
            userId
          })
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
            ? { ...note, ...data, ...titleUpdates, updated: new Date(), syncStatus: SyncStatus.PENDING }
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
export function useDeleteFirestoreNote() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id

  return useMutation({
    mutationFn: async (noteId) => {
      // Delete from IndexedDB
      await deleteNoteFromDB(noteId)

      // Queue sync to Firestore
      if (userId) {
        await queueSync({
          entityType: 'note',
          entityId: noteId,
          operation: SyncOperation.DELETE,
          data: null,
          userId
        })
      }

      return noteId
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list() })
      const previousNotes = queryClient.getQueryData(queryKeys.notes.list())

      queryClient.setQueryData(queryKeys.notes.list(), (old = []) =>
        old.filter((note) => note.id !== noteId)
      )

      return { previousNotes }
    },
    onError: (_err, _noteId, context) => {
      queryClient.setQueryData(queryKeys.notes.list(), context?.previousNotes)
    },
  })
}

/**
 * Search notes (client-side filtering)
 */
export function useSearchFirestoreNotes(searchTerm, options = {}) {
  const { data: notes = [] } = useFirestoreNotes()
  
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
export function useVisibleFirestoreNotes() {
  const { data: notes = [], ...rest } = useFirestoreNotes()
  
  const visibleNotes = useMemo(() => {
    return notes
      .filter(n => hasContent(n))
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, MAX_VISIBLE_NOTES)
  }, [notes])
  
  return { data: visibleNotes, notes, ...rest }
}

/**
 * Force sync notes with Firestore
 */
export function useSyncFirestoreNotes() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  // IMPORTANT: Use userId (backend ID = Firebase Auth UID) for Firestore operations
  const userId = user?.userId || user?.uid || user?.id
  
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const { notes: firestoreNotes } = await getNotesFromFirestore(userId, { pageSize: 500 })
      await saveNotesToDB(firestoreNotes)
      return firestoreNotes
    },
    onSuccess: (firestoreNotes) => {
      queryClient.setQueryData(queryKeys.notes.list(), firestoreNotes)
    },
  })
}

/**
 * Generate title from first characters of content (no AI call)
 */
export function useGenerateNoteTitle() {
  return useMutation({
    mutationFn: async (content) => {
      const firstSentence = content.split(/[.!?。\n]/)[0]?.trim() || content
      return truncateTitleToWords(firstSentence, 7)
    },
  })
}

/**
 * Hook to get current note using Zustand store for ID and TanStack Query for data
 */
export function useCurrentFirestoreNote() {
  const { data: notes = [] } = useFirestoreNotes()
  const [currentNoteId, setCurrentNoteId] = useState(null)
  
  useEffect(() => {
    const unsubscribe = useNotesStore.subscribe(
      (state) => state.currentNoteId,
      (id) => setCurrentNoteId(id)
    )
    setCurrentNoteId(useNotesStore.getState().currentNoteId)
    return unsubscribe
  }, [])
  
  const currentNote = useMemo(() => {
    if (!currentNoteId) return null
    return notes.find(n => n.id === currentNoteId) || null
  }, [currentNoteId, notes])
  
  return { currentNote, currentNoteId, notes }
}
