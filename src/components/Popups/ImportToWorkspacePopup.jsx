/**
 * ImportToWorkspacePopup Component
 * Small dropdown popup to import AI response to AI Studio
 */
import { useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { useNotes } from '../../contexts/NotesContext'
import { stripHelpPrefix, truncateTitleByWords } from '../../utils/titleUtils'
import Icon from '../Common/Icon'
import modal from '../../utils/modal'

// Configure marked for clean HTML output
marked.setOptions({
  breaks: true,
  gfm: true
})

// Convert markdown to HTML using marked library
const markdownToHtml = (markdown) => {
  if (!markdown) return ''
  return marked.parse(markdown)
}

// Generate title from content (no minimum length requirement for sidebar display)
const generateTitleFromContent = (content) => {
  if (!content) return null
  
  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!plainText) return null
  
  // Get first sentence
  let firstSentence = plainText.split(/[.!?。\n]/)[0]?.trim() || plainText
  const wordCount = firstSentence.split(/\s+/).length
  
  // If first sentence is too short (< 5 words), take first 7 words from content
  if (wordCount < 5) {
    firstSentence = plainText
  }
  
  return truncateTitleByWords(firstSentence, 7)
}

const ImportToWorkspacePopup = ({ content, htmlContent, onClose, onImport }) => {
  const { t } = useTranslation()
  const { notes, createNote, updateNote, loadNote } = useNotes()
  const popupRef = useRef(null)

  // Convert markdown content to HTML for Tiptap
  const importContent = useMemo(() => {
    if (htmlContent) return htmlContent
    return markdownToHtml(content)
  }, [content, htmlContent])

  // Get 3 most recent notes with content
  const recentNotes = useMemo(() => {
    return notes
      .filter(n => n.content && n.content.trim().length > 0)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 3)
  }, [notes])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleNewNote = () => {
    const newNote = createNote()
    const generatedTitle = generateTitleFromContent(importContent)
    
    setTimeout(() => {
      const updates = { content: importContent }
      if (generatedTitle) {
        updates.title = generatedTitle
        updates.titleGenerated = true
      }
      updateNote(newNote.id, updates)
    }, 50)
    onImport?.()
    onClose()
    modal.toast(t('sharedContent.imported'), '', 'success')
  }

  const handleExistingNote = (noteId) => {
    loadNote(noteId)
    const note = notes.find(n => n.id === noteId)
    
    // Convert existing content to HTML if it's plain text
    let existingContent = note?.content || ''
    const isExistingHtml = /<[a-z][\s\S]*>/i.test(existingContent)
    if (existingContent && !isExistingHtml) {
      // Plain text (serialized by Tiptap) - convert to simple HTML paragraphs
      // Don't use markdownToHtml here as it's already serialized plain text, not markdown
      existingContent = existingContent
        .split(/\n\n+/)
        .map(p => `<p>${p.split('\n').join('<br>')}</p>`)
        .join('')
    }
    
    const newContent = existingContent 
      ? `${existingContent}<hr/>${importContent}`
      : importContent
    
    // Use longer timeout to ensure loadNote completes first
    setTimeout(() => {
      updateNote(noteId, { content: newContent })
    }, 100)
    onImport?.()
    onClose()
    modal.toast(t('sharedContent.imported'), '', 'success')
  }

  const truncateTitle = (title, maxLength = 22) => {
    const cleanTitle = stripHelpPrefix(title)
    if (!cleanTitle || cleanTitle.length <= maxLength) return cleanTitle || t('common.untitled')
    return cleanTitle.substring(0, maxLength) + '...'
  }

  return (
    <div 
      ref={popupRef}
      className="absolute z-dropdown bg-bg-primary dark:bg-bg-secondary rounded-xl shadow-elevated animate-fade-in overflow-hidden"
      style={{
        bottom: '100%',
        left: '0px',
        marginBottom: '6px',
        minWidth: '180px',
        maxWidth: '220px'
      }}
    >
      <div className="p-1.5">
        <button 
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-fill-tertiary active:bg-fill-secondary active:scale-[0.98] transition-all"
          onClick={handleNewNote}
        >
          <Icon name="plus" alt="New" size="sm" color="muted" />
          <span>{t('workspace.newDocument')}</span>
        </button>

        {recentNotes.map((note) => (
          <button
            key={note.id}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-fill-tertiary active:bg-fill-secondary active:scale-[0.98] transition-all"
            onClick={() => handleExistingNote(note.id)}
          >
            <Icon name="file-text" alt="Note" size="sm" color="muted" className="shrink-0" />
            <span className="truncate">{truncateTitle(note.title)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImportToWorkspacePopup
