import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTextStats } from '../../hooks/useTextStats'
import { splitTextForModel, MODEL_LIMITS } from '../../utils/tokenUtils'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

/**
 * LongTextHandler - Handle long text with options
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

  const handleProcess = useCallback(async () => {
    if (disabled || processing) return

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
        await handleProcessChunks(chunks)
        return
      } else if (result === null) {
        return
      }
    }

    setProcessing(true)
    try {
      await onProcess?.(text)
    } finally {
      setProcessing(false)
    }
  }, [text, isTooLong, stats, getChunks, onProcess, disabled, processing])

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

  const renderWarning = () => {
    if (!isTooLong || stats.chars === 0) return null

    return (
      <div className={cn(
        "flex items-start gap-3 py-3 px-4",
        "bg-amber-500/10 border border-amber-500/30 rounded-lg",
        "animate-slide-up-fast"
      )}>
        <div className="text-xl shrink-0">[{t('common.warning').toUpperCase()}]</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-amber-400 mb-1">{t('longText.textQuiteLong')}</div>
          <div className="text-sm text-text-muted">
            {stats.pages} {t('tokens.pages')} • ~{stats.tokens.toLocaleString()} {t('tokens.tokens')}
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="text-xs text-text-muted mt-1">{w}</div>
          ))}
        </div>
        
        {modelRecommendation.model !== model && onChangeModel && (
          <button 
            className={cn(
              "py-1.5 px-3 text-xs bg-amber-400 text-black border-none rounded-md",
              "cursor-pointer whitespace-nowrap transition-all duration-200",
              "hover:bg-amber-500 hover:-translate-y-0.5"
            )}
            onClick={() => onChangeModel(modelRecommendation.model)}
          >
            {t('longText.switchTo', { model: modelRecommendation.model })}
          </button>
        )}
      </div>
    )
  }

  const renderProgress = () => {
    if (!processing || totalChunks === 0) return null

    const progress = (currentChunk / totalChunks) * 100

    return (
      <div className="py-3 px-4 bg-bg-secondary rounded-lg">
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-text-muted text-center">
          {t('longText.processingPart', { current: currentChunk, total: totalChunks })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {renderWarning()}
      {renderProgress()}
      
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
