import { useState, useEffect } from 'react'
import { getSuggestions } from '../../services/api'
import './SuggestionPopup.css'

/**
 * SuggestionPopup - Hiển thị gợi ý cải thiện cho câu lệch chuẩn
 * 
 * Props:
 * - sentence: Object chứa thông tin câu (từ sentenceAnalysis)
 * - profileId: ID của profile đang dùng
 * - onClose: Callback khi đóng popup
 * - onApply: Callback khi áp dụng gợi ý (nhận rewritten text)
 */
const SuggestionPopup = ({ sentence, profileId, onClose, onApply }) => {
  const [suggestions, setSuggestions] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)

  // Debug log
  console.log('🎯 SuggestionPopup rendered:', { sentence, profileId })

  useEffect(() => {
    if (!sentence || !profileId) {
      console.error('❌ Missing required props:', { sentence, profileId })
      setError('Thiếu thông tin cần thiết')
      setIsLoading(false)
      return
    }
    loadSuggestions()
  }, [sentence, profileId])

  const loadSuggestions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Loading suggestions for:', {
        profileId,
        sentence: sentence.sentence,
        score: sentence.similarityScore
      })
      
      // Call real API
      const result = await getSuggestions(
        profileId, 
        sentence.sentence,
        sentence.similarityScore
      )
      
      console.log('📦 API Result:', result)
      
      if (result.success && result.data) {
        console.log('✅ Setting suggestions:', result.data)
        setSuggestions({
          suggestions: result.data.suggestions || [],
          rewritten: result.data.rewritten || sentence.sentence,
          confidence: result.data.confidence || 75
        })
      } else {
        console.warn('⚠️ API returned error:', result.error)
        throw new Error(result.error || 'Failed to load suggestions')
      }
    } catch (err) {
      console.error('❌ Failed to load suggestions:', err)
      setError('Không thể tải gợi ý. Vui lòng thử lại.')
      
      // Fallback to mock suggestions
      console.log('🔄 Using fallback mock suggestions')
      const mockSuggestions = generateMockSuggestions(sentence)
      setSuggestions(mockSuggestions)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockSuggestions = (sentenceData) => {
    const score = sentenceData.similarityScore * 100
    const suggestions = []

    // Phân tích dựa trên điểm số
    if (score < 40) {
      suggestions.push({
        type: 'structure',
        severity: 'high',
        issue: 'Cấu trúc câu khác biệt đáng kể so với văn phong mục tiêu',
        suggestion: 'Đơn giản hóa cấu trúc câu, sử dụng câu ngắn hơn',
        icon: '/icon/layout.svg'
      })
    }

    if (sentenceData.sentence.length > 200) {
      suggestions.push({
        type: 'length',
        severity: 'medium',
        issue: `Câu quá dài (${sentenceData.sentence.length} ký tự)`,
        suggestion: 'Tách thành 2-3 câu ngắn hơn để dễ đọc',
        icon: '/icon/scissors.svg'
      })
    }

    // Kiểm tra từ trang trọng
    const formalWords = ['utilize', 'commence', 'terminate', 'endeavor', 'facilitate']
    const hasFormalWords = formalWords.some(word => 
      sentenceData.sentence.toLowerCase().includes(word)
    )
    
    if (hasFormalWords) {
      suggestions.push({
        type: 'vocabulary',
        severity: 'medium',
        issue: 'Sử dụng từ vựng quá trang trọng',
        suggestion: 'Thay thế bằng từ đơn giản hơn (use, start, end, try, help)',
        icon: '/icon/book-open.svg'
      })
    }

    // Kiểm tra passive voice
    if (sentenceData.sentence.includes('được') || sentenceData.sentence.includes('bị')) {
      suggestions.push({
        type: 'voice',
        severity: 'low',
        issue: 'Sử dụng thể bị động',
        suggestion: 'Chuyển sang thể chủ động để câu văn mạnh mẽ hơn',
        icon: '/icon/zap.svg'
      })
    }

    // Nếu không có gợi ý cụ thể
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'general',
        severity: 'low',
        issue: 'Câu có thể cải thiện để phù hợp hơn với văn phong',
        suggestion: 'Điều chỉnh cách diễn đạt để gần với phong cách mục tiêu',
        icon: '/icon/lightbulb.svg'
      })
    }

    return {
      suggestions,
      rewritten: generateRewrittenSentence(sentenceData.sentence),
      confidence: Math.round(85 + Math.random() * 10)
    }
  }

  const generateRewrittenSentence = (original) => {
    // Mock: Đơn giản hóa câu
    return original
      .replace(/utilize/gi, 'use')
      .replace(/commence/gi, 'start')
      .replace(/terminate/gi, 'end')
      .replace(/endeavor/gi, 'try')
      .replace(/facilitate/gi, 'help')
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ea4335'
      case 'medium': return '#fbbc04'
      case 'low': return '#4285f4'
      default: return '#5f6368'
    }
  }

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'high': return 'Quan trọng'
      case 'medium': return 'Trung bình'
      case 'low': return 'Nhỏ'
      default: return 'Thông tin'
    }
  }

  // Debug: Check if component is rendering
  if (!sentence) {
    console.error('❌ SuggestionPopup: No sentence provided')
    return null
  }

  if (!profileId) {
    console.error('❌ SuggestionPopup: No profileId provided')
    return null
  }

  return (
    <div className="suggestion-popup-overlay" onClick={onClose}>
      <div className="suggestion-popup" onClick={(e) => e.stopPropagation()}>
        <div className="suggestion-header">
          <div className="suggestion-title">
            <img src="/icon/lightbulb.svg" alt="suggestions" />
            <h3>Gợi ý cải thiện</h3>
          </div>
          <button className="suggestion-close" onClick={onClose}>
            <img src="/icon/x.svg" alt="close" />
          </button>
        </div>

        <div className="suggestion-body">
          {/* Original sentence */}
          <div className="suggestion-section">
            <div className="section-label">
              <img src="/icon/file-text.svg" alt="original" />
              <span>Câu gốc</span>
            </div>
            <div className="original-sentence">
              {sentence.sentence}
            </div>
            <div className="sentence-stats">
              <div className="stat-item">
                <span className="stat-label">Điểm tương thích:</span>
                <span className="stat-value" style={{ 
                  color: sentence.similarityScore >= 0.6 ? '#34a853' : '#ea4335' 
                }}>
                  {Math.round(sentence.similarityScore * 100)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Độ tin cậy:</span>
                <span className="stat-value">{Math.round(sentence.confidence)}%</span>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="suggestion-loading">
              <div className="loading-spinner"></div>
              <p>Đang phân tích và tạo gợi ý...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="suggestion-error">
              <img src="/icon/alert-circle.svg" alt="error" />
              <p>{error}</p>
              <button onClick={loadSuggestions} className="retry-btn">
                Thử lại
              </button>
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && !error && suggestions && (
            <>
              <div className="suggestion-section">
                <div className="section-label">
                  <img src="/icon/alert-triangle.svg" alt="issues" />
                  <span>Vấn đề phát hiện</span>
                </div>
                <div className="suggestions-list">
                  {suggestions.suggestions.map((sug, index) => (
                    <div 
                      key={index} 
                      className={`suggestion-item ${selectedSuggestion === index ? 'selected' : ''}`}
                      onClick={() => setSelectedSuggestion(index)}
                    >
                      <div className="suggestion-icon">
                        <img src={sug.icon} alt={sug.type} />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-issue">
                          <span className="issue-text">{sug.issue}</span>
                          <span 
                            className="severity-badge"
                            style={{ backgroundColor: getSeverityColor(sug.severity) }}
                          >
                            {getSeverityLabel(sug.severity)}
                          </span>
                        </div>
                        <div className="suggestion-text">
                          💡 {sug.suggestion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewritten sentence */}
              <div className="suggestion-section">
                <div className="section-label">
                  <img src="/icon/sparkles.svg" alt="rewritten" />
                  <span>Câu đề xuất</span>
                  <span className="confidence-badge">
                    Độ tin cậy: {suggestions.confidence}%
                  </span>
                </div>
                <div className="rewritten-sentence">
                  {suggestions.rewritten}
                </div>
              </div>

              {/* Actions */}
              <div className="suggestion-actions">
                <button 
                  className="action-btn secondary"
                  onClick={onClose}
                >
                  <img src="/icon/x.svg" alt="cancel" />
                  <span>Bỏ qua</span>
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => onApply && onApply(suggestions.rewritten)}
                >
                  <img src="/icon/check.svg" alt="apply" />
                  <span>Áp dụng gợi ý</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuggestionPopup
