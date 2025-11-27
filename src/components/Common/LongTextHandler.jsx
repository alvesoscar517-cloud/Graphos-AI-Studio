import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTextStats } from '../../hooks/useTextStats'
import { splitTextForModel, MODEL_LIMITS } from '../../utils/tokenUtils'
import modal from '../../utils/modal'
import './LongTextHandler.css'

/**
 * LongTextHandler - Handle long text with options
 * 
 * When text exceeds limit, allow user to:
 * 1. Continue with original text (may be slow/costly)
 * 2. Split and process each part
 * 3. Choose a more suitable model
 */
const LongTextHandler = ({
  text,
  model = 'gemini-2.5-flash',
  task = 'rewrite',
  onProcess,
  onProcessChunks,
  onChangeModel,
  children,
  disabled = false
}) => {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)

  const {
    stats,
    isTooLong,
    warnings,
    modelRecommendation,
    getChunks
  } = useTextStats(text, { model, task })

  const limits = MODEL_LIMITS[model] || MODEL_LIMITS['gemini-2.5-flash']

  // Handle text normally
  const handleProcess = useCallback(async () => {
    if (disabled || processing) return

    // If text too long, show confirmation dialog
    if (isTooLong) {
      const chunks = getChunks()
      
      const result = await modal.confirm(
        t('longText.longTextMessage', { pages: stats.pages, tokens: stats.tokens.toLocaleString() }),
        t('longText.longTextTitle'),
        {
          confirmText: t('longText.processAll'),
          cancelText: t('longText.splitParts', { count: chunks.length }),
          showCancel: true
        }
      )

      if (result === false) {
        // User chose to split
        await handleProcessChunks(chunks)
        return
      } else if (result === null) {
        // User cancel
        return
      }
      // result === true: continue processing all
    }

    setProcessing(true)
    try {
      await onProcess?.(text)
    } finally {
      setProcessing(false)
    }
  }, [text, isTooLong, stats, getChunks, onProcess, disabled, processing])

  // Process each chunk
  const handleProcessChunks = useCallback(async (chunks) => {
    if (!chunks || chunks.length === 0) return

    setProcessing(true)
    setTotalChunks(chunks.length)
    
    const results = []
    
    try {
      for (let i = 0; i < chunks.length; i++) {
        setCurrentChunk(i + 1)
        
        if (onProcessChunks) {
          const result = await onProcessChunks(chunks[i], i, chunks.length)
          results.push(result)
        } else if (onProcess) {
          const result = await onProcess(chunks[i])
          results.push(result)
        }
      }
      
      return results
    } finally {
      setProcessing(false)
      setCurrentChunk(0)
      setTotalChunks(0)
    }
  }, [onProcess, onProcessChunks])

  // Render warning banner if text long
  const renderWarning = () => {
    if (!isTooLong || stats.chars === 0) return null

    return (
      <div className="long-text-warning">
        <div className="warning-icon">[{t('common.warning').toUpperCase()}]</div>
        <div className="warning-content">
          <div className="warning-title">{t('longText.textQuiteLong')}</div>
          <div className="warning-desc">
            {stats.pages} {t('tokens.pages')} • ~{stats.tokens.toLocaleString()} {t('tokens.tokens')}
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="warning-item">{w}</div>
          ))}
        </div>
        
        {modelRecommendation.model !== model && onChangeModel && (
          <button 
            className="change-model-btn"
            onClick={() => onChangeModel(modelRecommendation.model)}
          >
            {t('longText.switchTo', { model: modelRecommendation.model })}
          </button>
        )}
      </div>
    )
  }

  // Render progress when processing chunks
  const renderProgress = () => {
    if (!processing || totalChunks === 0) return null

    const progress = (currentChunk / totalChunks) * 100

    return (
      <div className="chunk-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">
          {t('longText.processingPart', { current: currentChunk, total: totalChunks })}
        </div>
      </div>
    )
  }

  return (
    <div className="long-text-handler">
      {renderWarning()}
      {renderProgress()}
      
      {/* Render children with additional props */}
      {typeof children === 'function' 
        ? children({
            onProcess: handleProcess,
            processing,
            isTooLong,
            stats,
            currentChunk,
            totalChunks
          })
        : children
      }
    </div>
  )
}

export default LongTextHandler
