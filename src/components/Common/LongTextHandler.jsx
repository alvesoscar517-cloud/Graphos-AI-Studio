import { useState, useCallback } from 'react'
import { useTextStats } from '../../hooks/useTextStats'
import { splitTextForModel, MODEL_LIMITS } from '../../utils/tokenUtils'
import modal from '../../utils/modal'
import './LongTextHandler.css'

/**
 * LongTextHandler - Xử lý text dài với các options
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

  // Xử lý text bình thường
  const handleProcess = useCallback(async () => {
    if (disabled || processing) return

    // Nếu text quá dài, hiện dialog xác nhận
    if (isTooLong) {
      const chunks = getChunks()
      
      const result = await modal.confirm(
        `Văn bản của bạn khá dài (${stats.pages} trang, ~${stats.tokens.toLocaleString()} tokens).\n\n` +
        `Bạn muốn xử lý như thế nào?`,
        'Văn bản dài',
        {
          confirmText: 'Xử lý toàn bộ',
          cancelText: 'Chia nhỏ (' + chunks.length + ' phần)',
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
      // result === true: tiếp tục xử lý toàn bộ
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

  // Render warning banner nếu text dài
  const renderWarning = () => {
    if (!isTooLong || stats.chars === 0) return null

    return (
      <div className="long-text-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <div className="warning-title">Văn bản khá dài</div>
          <div className="warning-desc">
            {stats.pages} trang • ~{stats.tokens.toLocaleString()} tokens
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
            Đổi sang {modelRecommendation.model}
          </button>
        )}
      </div>
    )
  }

  // Render progress khi đang xử lý chunks
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
          Processing part {currentChunk}/{totalChunks}
        </div>
      </div>
    )
  }

  return (
    <div className="long-text-handler">
      {renderWarning()}
      {renderProgress()}
      
      {/* Render children với props bổ sung */}
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
