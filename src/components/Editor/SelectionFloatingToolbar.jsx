import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useRewrite } from '@/stores'
import { useIsToolbarActive } from '@/stores/uiSelectionStore'
import { useProfiles } from '../../contexts/ProfileContext'
import { cn } from '../../lib/utils'
import Portal from '../Common/Portal'

/**
 * SelectionFloatingToolbar - Floating toolbar that appears when text is selected
 * Khi click Rewrite/Humanize:
 * - Three dots hiển thị trên nút Rewrite ở sidebar (thông qua global isProcessing)
 * - Text được chọn bị xóa, shimmer hiển thị tại vị trí đó
 * - Streaming text mới vào vị trí đó
 * - Nếu lỗi, rollback text gốc
 */
const SelectionFloatingToolbar = ({
  selection,
  onSelectionRewrite, // Callback để xử lý rewrite với shimmer trong editor
  disabled = false
}) => {
  const { t } = useTranslation()
  const { currentProfile } = useProfiles()
  const { selectedModel, writingPreferences } = useRewrite()
  const isToolbarActive = useIsToolbarActive()
  
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const { hasSelection, selectedText, wordCount, rect, from, to } = selection

  // Calculate toolbar position
  useEffect(() => {
    if (!hasSelection || !rect) return

    const toolbarHeight = 40
    const toolbarWidth = 180
    const padding = 12
    const gap = 8
    
    let top = rect.top - toolbarHeight - gap
    let left = rect.right - toolbarWidth
    
    if (rect.width > toolbarWidth * 1.5) {
      left = rect.left + (rect.width / 2) - (toolbarWidth / 2)
    }
    
    if (top < padding) {
      top = rect.bottom + gap
    }
    
    if (left < padding) {
      left = padding
    } else if (left + toolbarWidth > window.innerWidth - padding) {
      left = window.innerWidth - toolbarWidth - padding
    }

    setPosition({ top, left })
  }, [hasSelection, rect])

  const hasAnyFeatureEnabled = useCallback(() => {
    const prefs = writingPreferences || {}
    const hasProfile = currentProfile !== null
    
    if (!hasProfile) {
      return prefs.useAntiAIDetection || prefs.useIterativeRefinement
    }
    return prefs.useAntiAIDetection || prefs.useIterativeRefinement ||
           prefs.useVocabularyPreferences || prefs.useKeyCharacteristics ||
           prefs.useSentencePatterns || prefs.useRewriteInstructions
  }, [currentProfile, writingPreferences])

  // Handle rewrite - delegate to parent với tất cả thông tin cần thiết
  const handleRewrite = async () => {
    if (!selectedText || disabled) return
    
    const useIterative = writingPreferences?.useIterativeRefinement
    
    // Gọi callback để parent xử lý rewrite với shimmer effect
    onSelectionRewrite?.({
      text: selectedText,
      from,
      to,
      useIterative,
      profileId: currentProfile?.profile_id || null,
      model: selectedModel,
      writingPreferences,
      processingType: useIterative ? 'humanize' : 'rewrite'
    })
  }

  // Don't render if no selection
  if (!hasSelection || wordCount < 1 || !isToolbarActive) {
    return null
  }

  const useIterative = writingPreferences?.useIterativeRefinement
  const buttonLabel = useIterative ? t('rewrite.humanize') : t('rewrite.rewrite')
  const buttonIcon = useIterative ? '/icon/user-check.svg' : '/icon/pen.svg'
  const featuresEnabled = hasAnyFeatureEnabled()

  return (
    <Portal containerId="selection-toolbar-root">
      <AnimatePresence>
        <motion.div
          className={cn(
            "selection-floating-toolbar",
            "fixed z-popup",
            "flex items-center gap-1 p-1",
            "bg-bg-primary/95 backdrop-blur-xl",
            "border border-border-light",
            "rounded-xl shadow-popup"
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* Word count badge */}
          <div className={cn(
            "flex items-center gap-1 px-2 py-1.5",
            "text-xs text-text-muted font-medium",
            "border-r border-border-light"
          )}>
            <span>{wordCount}</span>
            <span>{t('common.words') || 'words'}</span>
          </div>

          {/* Rewrite/Humanize button */}
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5",
              "bg-transparent border-none rounded-lg",
              "text-sm font-medium cursor-pointer",
              "transition-all duration-150",
              "hover:bg-bg-hover",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={handleRewrite}
            disabled={disabled || !featuresEnabled}
          >
            <img 
              src={buttonIcon}
              alt={buttonLabel}
              className="w-3.5 h-3.5 opacity-70 icon-invert"
            />
            <span>{buttonLabel}</span>
          </button>
        </motion.div>
      </AnimatePresence>
    </Portal>
  )
}

export default SelectionFloatingToolbar
