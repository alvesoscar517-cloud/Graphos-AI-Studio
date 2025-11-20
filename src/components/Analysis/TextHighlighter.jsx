import { useState } from 'react'
import './TextHighlighter.css'

/**
 * TextHighlighter - Hiển thị văn bản với highlight theo mức độ tương thích
 * 
 * Props:
 * - text: Văn bản gốc
 * - sentenceAnalysis: Mảng phân tích từng câu từ API
 * - onSentenceClick: Callback khi click vào câu
 */
const TextHighlighter = ({ text, sentenceAnalysis, onSentenceClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [showLegend, setShowLegend] = useState(true)

  if (!sentenceAnalysis || sentenceAnalysis.length === 0) {
    return <div className="text-highlighter-empty">{text}</div>
  }

  // Hàm xác định màu sắc dựa trên điểm tương thích
  const getHighlightClass = (score) => {
    const percentage = score * 100
    if (percentage >= 80) return 'highlight-excellent'
    if (percentage >= 60) return 'highlight-good'
    if (percentage >= 40) return 'highlight-warning'
    return 'highlight-poor'
  }

  // Hàm lấy icon dựa trên điểm
  const getScoreIcon = (score) => {
    const percentage = score * 100
    if (percentage >= 80) return '✓'
    if (percentage >= 60) return '○'
    if (percentage >= 40) return '△'
    return '✕'
  }

  // Hàm lấy label
  const getScoreLabel = (score) => {
    const percentage = score * 100
    if (percentage >= 80) return 'Tuyệt vời'
    if (percentage >= 60) return 'Tốt'
    if (percentage >= 40) return 'Cần cải thiện'
    return 'Lệch chuẩn'
  }

  return (
    <div className="text-highlighter-container">
      {showLegend && (
        <div className="highlighter-legend">
          <button 
            className="legend-close"
            onClick={() => setShowLegend(false)}
            title="Ẩn chú thích"
          >
            <img src="/icon/x.svg" alt="close" />
          </button>
          <div className="legend-title">
            <img src="/icon/info.svg" alt="info" />
            <span>Chú thích màu sắc</span>
          </div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color highlight-excellent"></span>
              <span>Tuyệt vời (≥80%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color highlight-good"></span>
              <span>Tốt (60-79%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color highlight-warning"></span>
              <span>Cần cải thiện (40-59%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color highlight-poor"></span>
              <span>Lệch chuẩn (&lt;40%)</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-highlighter-content">
        {sentenceAnalysis.map((analysis, index) => {
          const isHovered = hoveredIndex === index
          const highlightClass = getHighlightClass(analysis.similarityScore)
          const isDeviant = analysis.isDeviant

          return (
            <span
              key={index}
              className={`highlighted-sentence ${highlightClass} ${isHovered ? 'hovered' : ''} ${isDeviant ? 'deviant' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                console.log('🖱️ Sentence clicked:', analysis)
                onSentenceClick && onSentenceClick(analysis)
              }}
              title="Click để xem chi tiết và gợi ý"
            >
              {analysis.sentence}
              {isDeviant && (
                <span className="deviant-indicator" title="Câu lệch chuẩn">
                  <img src="/icon/alert-circle.svg" alt="warning" />
                </span>
              )}
              {isHovered && (
                <span className="sentence-tooltip">
                  <span className="tooltip-icon">{getScoreIcon(analysis.similarityScore)}</span>
                  <span className="tooltip-score">{Math.round(analysis.similarityScore * 100)}%</span>
                  <span className="tooltip-label">{getScoreLabel(analysis.similarityScore)}</span>
                  {isDeviant && <span className="tooltip-action">Click để xem gợi ý</span>}
                </span>
              )}
            </span>
          )
        })}
      </div>

      {!showLegend && (
        <button 
          className="show-legend-btn"
          onClick={() => setShowLegend(true)}
          title="Hiện chú thích"
        >
          <img src="/icon/info.svg" alt="info" />
        </button>
      )}
    </div>
  )
}

export default TextHighlighter
