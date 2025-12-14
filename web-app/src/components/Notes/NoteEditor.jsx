/**
 * Note Editor Component
 * Uses React Hook Form + Zod + TanStack Query
 */

import { useTranslation } from 'react-i18next'
import { useNoteForm } from '@/hooks/forms'
import { useCreateNote, useUpdateNote } from '@/hooks/queries'
import { useToasts } from '@/stores/uiStore'

export function NoteEditor({ note = null, onSave, onCancel }) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToasts()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()

  const isEditing = !!note?.id

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateNote.mutateAsync({ noteId: note.id, data })
        showSuccess(t('notes.updated'))
      } else {
        await createNote.mutateAsync(data)
        showSuccess(t('notes.created'))
      }
      onSave?.()
    } catch (error) {
      showError(error.message || t('errors.generic'), { error, context: 'NoteEditor.handleSubmit' })
      throw error
    }
  }

  const {
    register,
    handleSubmit: onSubmit,
    errors,
    isLoading,
    rootError,
    isDirty,
  } = useNoteForm(handleSubmit, note || {})

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <input
          {...register('title')}
          placeholder={t('notes.noteTitle')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <select
          {...register('type')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="Note">{t('notes.note')}</option>
          <option value="Chat prompt">{t('notes.chatPrompt')}</option>
          <option value="Template">{t('notes.template')}</option>
        </select>
      </div>

      {/* Content */}
      <div>
        <textarea
          {...register('content')}
          placeholder={t('notes.writeNote')}
          rows={8}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* Root Error */}
      {rootError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {rootError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || (!isDirty && isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default NoteEditor
