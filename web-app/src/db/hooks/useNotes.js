/**
 * RxDB Hook for Notes
 */

import { useMemo } from 'react'
import { useRxCollection, useRxDocument, useRxMutations } from './useRxDB'

/**
 * Get all notes for a user
 */
export function useNotes(userId, options = {}) {
  const { folder, limit = 500 } = options
  
  const selector = useMemo(() => {
    const sel = { userId }
    if (folder) sel.folder = folder
    return sel
  }, [userId, folder])

  const { documents, loading, error } = useRxCollection('notes', {
    selector,
    sort: { updated: 'desc' },
    limit
  })

  return { notes: documents, loading, error }
}

/**
 * Get a single note by ID
 */
export function useNote(noteId) {
  const { document, loading, error } = useRxDocument('notes', noteId)
  return { note: document, loading, error }
}

/**
 * Note mutations
 */
export function useNoteMutations() {
  const { insert, update, upsert, remove, bulkInsert, bulkRemove } = useRxMutations('notes')

  const createNote = async (userId, noteData) => {
    return await insert({
      ...noteData,
      userId,
      isPinned: noteData.isPinned || false,
      isArchived: noteData.isArchived || false,
      tags: noteData.tags || []
    })
  }

  const updateNote = async (noteId, noteData) => {
    return await update(noteId, noteData)
  }

  const saveNote = async (userId, noteData) => {
    return await upsert({
      ...noteData,
      userId
    })
  }

  const deleteNote = async (noteId) => {
    return await remove(noteId)
  }

  const deleteNotes = async (noteIds) => {
    return await bulkRemove(noteIds)
  }

  return { createNote, updateNote, saveNote, deleteNote, deleteNotes }
}
