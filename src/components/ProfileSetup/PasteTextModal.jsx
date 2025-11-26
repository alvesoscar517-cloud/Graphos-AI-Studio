import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from '../../utils/debounce'
import './PasteTextModal.css'

const PasteTextModal = ({ isOpen, onClose, onSave, initialText = '' }) => {
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const debouncedAnalyzeRef = useRef(null)

  // Create debounced analyze function
  const debouncedAnalyze = useCallback((value) => {
    if (!debouncedAnalyzeRef.current) {
      debouncedAnalyzeRef.current = debounce((val) => {
        const result = analyzeText(val)
        setAnalysis(result)
      }, 300)
    }
    debouncedAnalyzeRef.current(value)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedAnalyzeRef.current?.cancel) {
        debouncedAnalyzeRef.current.cancel()
      }
    }
  }, [])

  // Load initial text when modal opens
  useEffect(() => {
    if (isOpen && initialText) {
      handleTextChange(initialText, true) // immediate analysis for initial load
    } else if (!isOpen) {
      // Only reset when modal closes if there's no initial text to preserve
      if (!initialText) {
        setText('')
        setWordCount(0)
        setAnalysis(null)
      }
      // Cancel pending debounce when modal closes
      if (debouncedAnalyzeRef.current?.cancel) {
        debouncedAnalyzeRef.current.cancel()
      }
    }
  }, [isOpen, initialText])

  // Advanced text analysis
  const analyzeText = (value) => {
    const words = value.trim().split(/\s+/).filter(w => w.length > 0)
    const sentences = value.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = value.split(/\n\n+/).filter(p => p.trim().length > 0)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    
    // Calculate metrics
    const wordCount = words.length
    const sentenceCount = sentences.length
    const paragraphCount = paragraphs.length
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const avgParagraphLength = paragraphCount > 0 ? wordCount / paragraphCount : 0
    const vocabularyDiversity = wordCount > 0 ? (uniqueWords.size / wordCount) * 100 : 0
    
    // Detect repetitive words (appearing > 3% of total)
    const wordFreq = {}
    words.forEach(w => {
      const lower = w.toLowerCase()
      wordFreq[lower] = (wordFreq[lower] || 0) + 1
    })
    const repetitiveWords = Object.entries(wordFreq)
      .filter(([word, count]) => count / wordCount > 0.03 && word.length > 4)
      .map(([word]) => word)
    
    // Quality score (0-100)
    let qualityScore = 0
    const smartHints = []
    
    // 1. Word count analysis (50 points max)
    if (wordCount < 500) {
      smartHints.push(`Need ${500 - wordCount} more words to reach minimum level (current: ${wordCount} words)`)
      qualityScore += Math.min((wordCount / 500) * 25, 25)
    } else if (wordCount >= 500 && wordCount < 1000) {
      qualityScore += 30
      smartHints.push(`Minimum reached. Add ${1000 - wordCount} more words to reach recommended level`)
    } else if (wordCount >= 1000 && wordCount < 1500) {
      qualityScore += 40
      smartHints.push(`Excellent! Add ${1500 - wordCount} more words to reach optimal quality`)
    } else if (wordCount >= 1500 && wordCount < 2000) {
      qualityScore += 45
      smartHints.push(`Excellent! Add ${2000 - wordCount} more words for deeper AI learning`)
    } else if (wordCount >= 2000) {
      qualityScore += 50
      smartHints.push(`Perfect! Ideal length for best AI learning`)
    }
    
    // 2. Paragraph structure (15 points max)
    if (paragraphCount < 2 && wordCount > 200) {
      smartHints.push(`Nên chia thành nhiều đoạn văn (hiện: ${paragraphCount} đoạn)`)
      qualityScore += 5
    } else if (avgParagraphLength > 200) {
      smartHints.push(`Đoạn văn quá dài (TB: ${Math.round(avgParagraphLength)} từ/đoạn). Nên chia nhỏ hơn`)
      qualityScore += 10
    } else if (paragraphCount >= 2) {
      qualityScore += 15
    }
    
    // 3. Vocabulary diversity (20 points max)
    if (vocabularyDiversity < 40) {
      smartHints.push(`Từ vựng lặp lại nhiều (${vocabularyDiversity.toFixed(0)}% unique). Dùng từ đồng nghĩa`)
      qualityScore += 5
    } else if (vocabularyDiversity >= 40 && vocabularyDiversity < 60) {
      qualityScore += 15
    } else {
      qualityScore += 20
      if (wordCount >= 1000) {
        smartHints.push(`Từ vựng đa dạng tuyệt vời (${vocabularyDiversity.toFixed(0)}% unique)`)
      }
    }
    
    // 4. Sentence structure (15 points max)
    if (avgSentenceLength < 8) {
      smartHints.push(`Câu quá ngắn (TB: ${avgSentenceLength.toFixed(1)} từ/câu). Kết hợp câu phức tạp hơn`)
      qualityScore += 5
    } else if (avgSentenceLength > 25) {
      smartHints.push(`Sentences too long (avg: ${avgSentenceLength.toFixed(1)} words/sentence). Break them up for readability`)
      qualityScore += 10
    } else {
      qualityScore += 15
    }
    
    // 5. Repetition detection
    if (repetitiveWords.length > 0 && wordCount > 300) {
      smartHints.push(`Repeated words: "${repetitiveWords.slice(0, 2).join('", "')}"`)
    }
    
    // 6. Sentence variety
    const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 10).length
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 20).length
    const sentenceVariety = sentenceCount > 0 ? 
      1 - Math.abs((shortSentences + longSentences) / sentenceCount - 0.4) : 0
    
    if (sentenceVariety < 0.5 && sentenceCount > 5) {
      smartHints.push(`Cấu trúc câu đơn điệu. Kết hợp câu ngắn, dài để tạo nhịp điệu`)
    }
    
    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgParagraphLength: avgParagraphLength.toFixed(0),
      vocabularyDiversity: vocabularyDiversity.toFixed(1),
      qualityScore: Math.min(qualityScore, 100),
      smartHints,
      isReady: wordCount >= 500 && qualityScore >= 50
    }
  }

  const handleTextChange = useCallback((value, immediate = false) => {
    // Auto-trim to 5000 words max
    const words = value.trim().split(/\s+/).filter(w => w.length > 0)
    
    if (words.length > 5000) {
      // Keep only first 5000 words
      const trimmedText = words.slice(0, 5000).join(' ')
      setText(trimmedText)
      setWordCount(5000)
      
      // Analyze trimmed text (immediate for truncation feedback)
      const result = analyzeText(trimmedText)
      setAnalysis(result)
    } else {
      setText(value)
      setWordCount(words.length)
      
      // Real-time analysis with debounce
      if (words.length > 50) {
        if (immediate) {
          // Immediate analysis for initial load
          const result = analyzeText(value)
          setAnalysis(result)
        } else {
          // Debounced analysis for typing
          debouncedAnalyze(value)
        }
      } else {
        setAnalysis(null)
      }
    }
  }, [debouncedAnalyze])

  const handleSave = () => {
    if (analysis && analysis.isReady) {
      onSave(text)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  // Dynamic progress based on 5000 words max
  const progress = Math.min((wordCount / 5000) * 100, 100)
  const canSave = analysis && analysis.isReady
  
  // Get progress status for color coding
  const getProgressStatus = () => {
    if (wordCount < 500) return 'low'
    if (wordCount < 1000) return 'medium'
    if (wordCount < 1500) return 'good'
    if (wordCount < 2000) return 'great'
    return 'optimal'
  }
  
  // Get dynamic word count label based on milestone
  const getWordCountLabel = () => {
    if (wordCount < 500) {
      return `/ 500 minimum words • Need ${500 - wordCount} more words`
    }
    if (wordCount < 800) {
      return '/ 500 minimum words • Provide 500-800 words for AI to recognize basic patterns'
    }
    if (wordCount < 1000) {
      return `/ 1000 words • Add ${1000 - wordCount} more words to reach recommended level`
    }
    if (wordCount < 1500) {
      return '/ 1500 words • Provide 1000-1500 words for clear AI style learning'
    }
    if (wordCount < 2500) {
      return `/ 2500 words • Add ${2500 - wordCount} more words to reach optimal level`
    }
    if (wordCount < 5000) {
      return '/ 5000 words • Provide 2500-5000 words for deep AI learning (structure, tone, vocabulary)'
    }
    return '/ 5000 words • Excellent! Reached maximum limit'
  }

  // Get primary smart hint for footer (only show most important one)
  const getPrimaryHint = () => {
    if (wordCount === 0) {
      return 'Paste your text to start analysis'
    }
    if (wordCount < 100) {
      return 'Keep typing to analyze text quality'
    }
    
    // Show first smart hint from analysis
    if (analysis && analysis.smartHints.length > 0) {
      return analysis.smartHints[0]
    }
    
    return 'Great text! AI will learn your writing style'
  }

  return (
    <div className="paste-modal-overlay" onClick={handleClose}>
      <div className="paste-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header with Icon */}
        <div className="paste-modal-header">
          <div className="paste-modal-icon">
            <img src="/icon/edit-3.svg" alt="" width="24" height="24" />
          </div>
          <div>
            <h2 className="paste-modal-title">Paste Text</h2>
            <p className="paste-modal-subtitle">
              The more text you provide, the better AI understands your writing style
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="paste-modal-content">
          <textarea
            className="paste-modal-textarea"
            placeholder="Paste your text here (minimum 500 words, recommended 1000-1500 words)..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          
          {/* Progress Bar - Modern Minimal */}
          <div className="paste-progress-section">
            <div className="paste-progress-header">
              <div className="paste-word-count-badge">
                <img src="/icon/type.svg" alt="" width="14" height="14" />
                <span className="paste-word-count-number">{wordCount}</span>
                <span className="paste-word-count-divider">/</span>
                <span className="paste-word-count-max">3000</span>
              </div>
              <div className="paste-progress-status" data-status={getProgressStatus()}>
                {wordCount >= 3000 ? '[EXCELLENT]' : 
                 wordCount >= 2000 ? '[VERY GOOD]' :
                 wordCount >= 1500 ? '[GOOD]' :
                 wordCount >= 1000 ? '[FAIR]' :
                 wordCount >= 500 ? '[MINIMUM]' : '[NEED MORE]'}
              </div>
            </div>
            <div className="paste-progress-bar-wrapper">
              <div className="paste-progress-bar">
                <div 
                  className="paste-progress-fill" 
                  style={{ width: `${progress}%` }}
                  data-status={getProgressStatus()}
                />
              </div>
              <div className="paste-progress-milestones">
                <span className="paste-milestone" data-active={wordCount >= 500}>500</span>
                <span className="paste-milestone" data-active={wordCount >= 1000}>1K</span>
                <span className="paste-milestone" data-active={wordCount >= 1500}>1.5K</span>
                <span className="paste-milestone" data-active={wordCount >= 2000}>2K</span>
                <span className="paste-milestone" data-active={wordCount >= 3000}>3K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="paste-modal-footer">
          <div className="paste-footer-hint">
            <img src="/icon/lightbulb.svg" alt="" width="16" height="16" />
            <span>{getPrimaryHint()}</span>
          </div>
          <div className="paste-footer-buttons">
            <button className="paste-modal-btn paste-modal-btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button 
              className="paste-modal-btn paste-modal-btn-save" 
              onClick={handleSave}
              disabled={!canSave}
            >
              Save Text
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasteTextModal
