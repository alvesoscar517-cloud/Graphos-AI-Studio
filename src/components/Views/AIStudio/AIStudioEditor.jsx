import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotes } from '../../../contexts/NotesContext'
import { useUser, useAIProcessing } from '@/stores'
import { createShare } from '../../../services/share'
import modal from '../../../utils/modal'
import TextShimmer from '../../Common/TextShimmer'
import Icon from '../../Common/Icon'
import { cn } from '../../../lib/utils'

const AIStudioEditor = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar, 
  rightSidebarHidden,
  onCreateNote,
  highlightedSentence
}) => {
  const { t } = useTranslation()
  const { currentNote, updateNote } = useNotes()
  const user = useUser() // Use Zustand store directly
  const { isProcessing, processingType } = useAIProcessing()
  const textareaRef = useRef(null)

  const handleTitleChange = (e) => {
    if (currentNote) {
      updateNote(currentNote.id, { title: e.target.value })
    }
  }

  const handleContentChange = (e) => {
    if (currentNote) {
      updateNote(currentNote.id, { content: e.target.value })
    }
  }

  useEffect(() => {
    if (highlightedSentence && textareaRef.current && currentNote?.content) {
      const content = currentNote.content
      const sentenceText = highlightedSentence.sentence
      const startIndex = content.indexOf(sentenceText)
      
      if (startIndex !== -1) {
        const endIndex = startIndex + sentenceText.length
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(startIndex, endIndex)
        
        const lineHeight = 24
        const lines = content.substring(0, startIndex).split('\n').length
        const scrollTop = (lines - 1) * lineHeight
        textareaRef.current.scrollTop = Math.max(0, scrollTop - 100)
      }
    }
  }, [highlightedSentence, currentNote?.content])

  const handleShare = async () => {
    try {
      if (!currentNote || !currentNote.content.trim()) {
        modal.alert(t('share.noContentToShare'), t('common.error'))
        return
      }

      const shareData = await createShare(
        'note',
        currentNote.title || t('editor.untitled'),
        currentNote.content,
        null,
        { createdAt: new Date().toISOString() }
      )

      const shareUrl = `${window.location.origin}/shared/${shareData.share_id}`
      await navigator.clipboard.writeText(shareUrl)
      modal.toast(t('share.shareLinkCopied'), '', 'success')
    } catch (error) {
      console.error('Share error:', error)
      modal.error(t('share.unableToCreate') + ': ' + error.message)
    }
  }

  return (
    <div className={cn(
      "flex flex-col flex-1 overflow-hidden p-0 m-0",
      "bg-bg-tertiary",
      "h-full w-full box-border"
    )}>
      <header className={cn(
        "flex items-center gap-2 py-2 px-4",
        "border-b border-border-light",
        "bg-bg-tertiary h-14 shrink-0"
      )}>
        <button 
          className={cn(
            "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
            "w-8 h-8 shrink-0 flex items-center justify-center",
            "transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')} 
          data-tooltip-position="right"
        >
          <Icon name="panel-left" alt={t('common.menu')} size="lg" color="muted" />
        </button>
        
        <input 
          type="text" 
          className={cn(
            "flex-1 border-none outline-none",
            "text-sm font-medium text-text-primary",
            "bg-transparent py-1 px-2 -ml-1",
            "placeholder:text-text-muted placeholder:font-semibold",
            "focus:outline-none focus:shadow-none focus:border-none"
          )}
          placeholder={t('editor.enterTitle')}
          value={currentNote?.title || ''}
          onChange={handleTitleChange}
        />
        
        <div className="flex items-center gap-1">
          <button 
            className={cn(
              "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
              "w-8 h-8 flex items-center justify-center",
              "transition-colors duration-200",
              "hover:bg-bg-hover"
            )}
            onClick={onCreateNote}
            data-tooltip={t('common.new')}
          >
            <Icon name="plus" alt={t('common.new')} size="lg" color="muted" />
          </button>
          <button 
            className={cn(
              "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
              "w-8 h-8 flex items-center justify-center",
              "transition-colors duration-200",
              "hover:bg-bg-hover"
            )}
            onClick={handleShare}
            data-tooltip={t('common.share')}
          >
            <Icon name="share-2" alt={t('common.share')} size="lg" color="muted" />
          </button>
          {rightSidebarHidden && (
            <button 
              className={cn(
                "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
                "w-8 h-8 flex items-center justify-center",
                "transition-colors duration-200",
                "hover:bg-bg-hover"
              )}
              onClick={onToggleRightSidebar}
              data-tooltip={t('nav.sidebar')}
            >
              <img src="/icon/panel-right.svg" alt={t('nav.sidebar')} className="w-icon-md h-icon-md opacity-60 icon-invert" />
            </button>
          )}
        </div>
      </header>

      <div className={cn(
        "relative flex-1 p-0 m-0 border-none",
        "bg-bg-tertiary",
        "overflow-hidden h-full w-full box-border"
      )}>
        <textarea 
          ref={textareaRef}
          className={cn(
            "flex-1 border-none py-6 px-8 m-0",
            "font-[Google_Sans,Roboto,Arial,sans-serif] text-sm text-text-primary",
            "resize-none outline-none bg-bg-tertiary",
            "leading-relaxed w-full h-full",
            "shadow-none rounded-none appearance-none box-border",
            "overflow-x-hidden overflow-y-auto scrollbar-none",
            "placeholder:text-transparent",
            "focus:outline-none focus:shadow-none focus:border-none",
            "hover:border-none hover:shadow-none"
          )}
          placeholder=""
          value={currentNote?.content || ''}
          onChange={handleContentChange}
          disabled={isProcessing}
          style={{
            opacity: isProcessing ? 0 : 1,
            pointerEvents: isProcessing ? 'none' : 'auto'
          }}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary">
            <TextShimmer className="text-sm" duration={2}>
              {currentNote?.content || ''}
            </TextShimmer>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIStudioEditor
