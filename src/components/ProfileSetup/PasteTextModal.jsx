import { useState, useEffect } from 'react'
import './PasteTextModal.css'

const PasteTextModal = ({ isOpen, onClose, onSave, initialText = '' }) => {
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [analysis, setAnalysis] = useState(null)

  // Load initial text when modal opens
  useEffect(() => {
    if (isOpen && initialText) {
      handleTextChange(initialText)
    } else if (!isOpen) {
      // Only reset when modal closes if there's no initial text to preserve
      if (!initialText) {
        setText('')
        setWordCount(0)
        setAnalysis(null)
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
      smartHints.push(`Cần thêm ${500 - wordCount} từ để đạt mức tối thiểu (hiện: ${wordCount} từ)`)
      qualityScore += Math.min((wordCount / 500) * 25, 25)
    } else if (wordCount >= 500 && wordCount < 1000) {
      qualityScore += 30
      smartHints.push(`Đã đủ tối thiểu. Thêm ${1000 - wordCount} từ nữa để đạt mốc khuyến nghị`)
    } else if (wordCount >= 1000 && wordCount < 1500) {
      qualityScore += 40
      smartHints.push(`Rất tốt! Thêm ${1500 - wordCount} từ để đạt chất lượng tối ưu`)
    } else if (wordCount >= 1500 && wordCount < 2000) {
      qualityScore += 45
      smartHints.push(`Xuất sắc! Thêm ${2000 - wordCount} từ để AI học sâu hơn`)
    } else if (wordCount >= 2000) {
      qualityScore += 50
      smartHints.push(`Hoàn hảo! Độ dài lý tưởng cho AI học tốt nhất`)
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
      smartHints.push(`Câu quá dài (TB: ${avgSentenceLength.toFixed(1)} từ/câu). Chia nhỏ để dễ đọc`)
      qualityScore += 10
    } else {
      qualityScore += 15
    }
    
    // 5. Repetition detection
    if (repetitiveWords.length > 0 && wordCount > 300) {
      smartHints.push(`Từ lặp lại nhiều: "${repetitiveWords.slice(0, 2).join('", "')}"`)
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

  const handleTextChange = (value) => {
    // Auto-trim to 3000 words max
    const words = value.trim().split(/\s+/).filter(w => w.length > 0)
    
    if (words.length > 3000) {
      // Keep only first 3000 words
      const trimmedText = words.slice(0, 3000).join(' ')
      setText(trimmedText)
      setWordCount(3000)
      
      // Analyze trimmed text
      const result = analyzeText(trimmedText)
      setAnalysis(result)
    } else {
      setText(value)
      setWordCount(words.length)
      
      // Real-time analysis
      if (words.length > 50) {
        const result = analyzeText(value)
        setAnalysis(result)
      } else {
        setAnalysis(null)
      }
    }
  }

  const handleSave = () => {
    if (analysis && analysis.isReady) {
      onSave(text)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  // Dynamic progress based on 3000 words max
  const progress = Math.min((wordCount / 3000) * 100, 100)
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
      return `/ 500 từ tối thiểu • Cần thêm ${500 - wordCount} từ`
    }
    if (wordCount < 800) {
      return '/ 500 từ tối thiểu • Cung cấp 500-800 từ để AI nhận diện pattern cơ bản'
    }
    if (wordCount < 1000) {
      return `/ 1000 từ • Thêm ${1000 - wordCount} từ để đạt mốc khuyến nghị`
    }
    if (wordCount < 1500) {
      return '/ 1500 từ • Cung cấp 1000-1500 từ để AI học phong cách rõ ràng'
    }
    if (wordCount < 2000) {
      return `/ 2000 từ • Thêm ${2000 - wordCount} từ để đạt mốc tối ưu`
    }
    if (wordCount < 3000) {
      return '/ 3000 từ • Cung cấp 2000-3000 từ để AI học sâu (cấu trúc, tone, từ vựng)'
    }
    return '/ 3000 từ • Xuất sắc! Đã đạt giới hạn tối đa'
  }

  // Get primary smart hint for footer (only show most important one)
  const getPrimaryHint = () => {
    if (wordCount === 0) {
      return 'Dán văn bản của bạn để bắt đầu phân tích'
    }
    if (wordCount < 100) {
      return 'Tiếp tục nhập để phân tích chất lượng văn bản'
    }
    
    // Show first smart hint from analysis
    if (analysis && analysis.smartHints.length > 0) {
      return analysis.smartHints[0]
    }
    
    return 'Văn bản tốt! AI sẽ học được phong cách viết của bạn'
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
            <h2 className="paste-modal-title">Dán Văn bản</h2>
            <p className="paste-modal-subtitle">
              Cung cấp càng nhiều văn bản, AI càng hiểu sâu phong cách viết của bạn
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="paste-modal-content">
          <textarea
            className="paste-modal-textarea"
            placeholder="Dán văn bản của bạn vào đây (tối thiểu 500 từ, khuyến nghị 1000-1500 từ)..."
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
                {wordCount >= 3000 ? '✓ Xuất sắc' : 
                 wordCount >= 2000 ? 'Rất tốt' :
                 wordCount >= 1500 ? 'Tốt' :
                 wordCount >= 1000 ? 'Khá' :
                 wordCount >= 500 ? 'Đạt tối thiểu' : 'Cần thêm'}
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
              Hủy
            </button>
            <button 
              className="paste-modal-btn paste-modal-btn-save" 
              onClick={handleSave}
              disabled={!canSave}
            >
              Lưu văn bản
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasteTextModal
