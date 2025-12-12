/**
 * Note List Component
 * Uses TanStack Query for data fetching
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotes, useDeleteNote } from '@/hooks/queries'
import { useDisclosure } from '@/hooks'
import { useToasts } from '@/stores/uiStore'
import NoteEditor from './NoteEditor'

export function NoteList() {
  const { t } = useTranslation()
  const { data: notes = [], isLoading, error, refetch } = useNotes()
  const deleteNote = useDeleteNote()
  const { showSuccess, showError } = useToasts()
  const { isOpen: isEditorOpen, open: openEditor, close: closeEditor } = useDisclosure()
  const [editingNote, setEditingNote] = useState(null)

  const handleEdit = (note) => {
    setEditingNote(note)
    openEditor()
  }

  const handleCreate = () => {
    setEditingNote(null)
    openEditor()
  }

  const handleDelete = async (noteId) => {
    if (!confirm(t('sidebar.confirmDeleteNote', { title: '' }))) return
    try {
      await deleteNote.mutateAsync(noteId)
      showSuccess(t('notes.deleted'))
    } catch (error) {
      showError(error.message || t('errors.generic'), { error, context: 'NoteList.handleDelete' })
    }
  }

  const handleSave = () => {
    closeEditor()
    setEditingNote(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    // Lazy import to avoid circular dependency
    const { ErrorReportButton } = require('@/components/Common/ErrorReportButton')
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">{t('notes.failedToLoad')}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="text-blue-600 hover:underline"
          >
            {t('errorBoundary.tryAgain')}
          </button>
          <ErrorReportButton error={error} variant="link" context="NoteList" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('notes.notes')}</h2>
        <button
          onClick={handleCreate}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + {t('notes.newNote')}
        </button>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingNote ? t('notes.editNote') : t('notes.newNote')}
            </h3>
            <NoteEditor
              note={editingNote}
              onSave={handleSave}
              onCancel={closeEditor}
            />
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('notes.noNotesYet')}
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 border rounded-lg hover:bg-gray-50 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {note.title || t('notes.untitled')}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {note.content}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {note.type || 'Note'}
                    </span>
                    <span>
                      {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NoteList
