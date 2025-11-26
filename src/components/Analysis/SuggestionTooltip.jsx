import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './SuggestionTooltip.css'

/**
 * SuggestionTooltip - Enhanced tooltip with dismiss, undo, and detailed issues
 */
const SuggestionTooltip = ({ 
  targetRect, 
  suggestions, 
  severity,
  onApply,
  onDismiss,
  onClose,
  canUndo = false,
  onUndo
}) => {
  const [showAllIssues, setShowAllIssues] = useState(false)
  const tooltipRef = useRef(null)
  
  useEffect(() => {
    if (!tooltipRef.current || !targetRect) return
    
    const tooltip = tooltipRef.current
    const tooltipRect = tooltip.getBoundingClientRect()
    
    // Calculate position
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 16
    
    // Horizontal: center on target
    let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
    
    // Keep within viewport horizontally
    if (left < margin) {
      left = margin
    } else if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - tooltipRect.width - margin
    }
    
    // Vertical: try below first
    let top = targetRect.bottom + 12
    let showAbove = false
    
    // If doesn't fit below, try above
    if (top + tooltipRect.height > viewportHeight - margin) {
      const topAbove = targetRect.top - tooltipRect.height - 12
      if (topAbove > margin) {
        top = topAbove
        showAbove = true
      } else {
        // If neither fits perfectly, prefer below and let it scroll
        top = Math.min(top, viewportHeight - tooltipRect.height - margin)
      }
    }
    
    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
    tooltip.classList.toggle('show-above', showAbove)
    tooltip.classList.add('positioned')
  }, [targetRect])
  
  if (!targetRect || !suggestions) return null
  
  const getSeverityIcon = () => {
    switch (severity) {
      case 'high': return '/icon/alert-circle.svg'
      case 'medium': return '/icon/alert-triangle.svg'
      case 'low': return '/icon/info.svg'
      default: return '/icon/info.svg'
    }
  }
  
  const getSeverityLabel = () => {
    switch (severity) {
      case 'high': return 'Cần sửa'
      case 'medium': return 'Cải thiện'
      case 'low': return 'Gợi ý'
      default: return 'Gợi ý'
    }
  }
  
  // Get issue type icon
  const getIssueIcon = (type) => {
    const icons = {
      length: '/icon/scissors.svg',
      vocabulary: '/icon/book-open.svg',
      formality: '/icon/briefcase.svg',
      tone: '/icon/smile.svg',
      coherence: '/icon/link.svg',
      repetition: '/icon/repeat.svg',
      voice: '/icon/mic.svg',
      punctuation: '/icon/more-horizontal.svg'
    }
    return icons[type] || '/icon/alert-circle.svg'
  }

  // Get issue type label
  const getIssueLabel = (type) => {
    const labels = {
      length: 'Độ dài',
      vocabulary: 'Từ vựng',
      formality: 'Trang trọng',
      tone: 'Giọng điệu',
      coherence: 'Liên kết',
      repetition: 'Lặp từ',
      voice: 'Thể câu',
      punctuation: 'Dấu câu'
    }
    return labels[type] || type
  }

  return createPortal(
    <>
      <div className="suggestion-tooltip-overlay" onClick={onClose} />
      <div 
        ref={tooltipRef}
        className={`suggestion-tooltip severity-${severity}`}
      >
        <div className="suggestion-tooltip-header">
          <div className="tooltip-severity-badge">
            <img src={getSeverityIcon()} alt={severity} className="tooltip-icon" />
            {getSeverityLabel()}
          </div>
          <div className="tooltip-header-actions">
            <span className="tooltip-issues-count">
              {suggestions.issues_found} vấn đề
            </span>
            <button 
              className="tooltip-close-btn"
              onClick={onClose}
              title="Đóng (Esc)"
            >
              <img src="/icon/x.svg" alt="close" />
            </button>
          </div>
        </div>
        
        <div className="suggestion-tooltip-body">
          {/* Detailed Issues List */}
          {suggestions.issues && suggestions.issues.length > 0 && (
            <div className="issues-detail-list">
              {(showAllIssues ? suggestions.issues : suggestions.issues.slice(0, 2)).map((issue, idx) => (
                <div key={idx} className={`issue-detail-item severity-${issue.severity}`}>
                  <div className="issue-detail-header">
                    <img src={getIssueIcon(issue.type)} alt={issue.type} className="issue-icon" />
                    <span className="issue-type-label">{getIssueLabel(issue.type)}</span>
                    <span className={`issue-severity-badge ${issue.severity}`}>
                      {issue.severity === 'high' ? 'Cao' : issue.severity === 'medium' ? 'TB' : 'Thấp'}
                    </span>
                  </div>
                  <div className="issue-detail-text">{issue.detail}</div>
                  {issue.suggestion && (
                    <div className="issue-suggestion-text">
                      💡 {issue.suggestion}
                    </div>
                  )}
                  {issue.examples && issue.examples.length > 0 && (
                    <div className="issue-examples">
                      Ví dụ: {issue.examples.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {suggestions.issues.length > 2 && (
                <button 
                  className="show-more-issues-btn"
                  onClick={() => setShowAllIssues(!showAllIssues)}
                >
                  {showAllIssues ? 'Thu gọn' : `Xem thêm ${suggestions.issues.length - 2} vấn đề`}
                </button>
              )}
            </div>
          )}

          {/* Legacy suggestions format */}
          {suggestions.suggestions && suggestions.suggestions.length > 0 && !suggestions.issues && (
            <div className="suggestions-list">
              {suggestions.suggestions.slice(0, 3).map((sug, idx) => (
                <div key={idx} className="suggestion-item">
                  {typeof sug === 'string' ? sug : sug.suggestion}
                </div>
              ))}
            </div>
          )}
          
          {/* Rewrite suggestion */}
          {suggestions.rewritten && (
            <div className="suggestion-rewrite">
              <div className="rewrite-label">✨ Gợi ý viết lại:</div>
              <div className="rewrite-text">{suggestions.rewritten}</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="suggestion-tooltip-footer">
          <div className="tooltip-footer-left">
            {canUndo && onUndo && (
              <button className="tooltip-action-btn undo-btn" onClick={onUndo} title="Hoàn tác (Ctrl+Z)">
                <img src="/icon/rotate-ccw.svg" alt="undo" />
                <span>Hoàn tác</span>
              </button>
            )}
            {onDismiss && (
              <button className="tooltip-action-btn dismiss-btn" onClick={onDismiss} title="Bỏ qua gợi ý này">
                <img src="/icon/x-circle.svg" alt="dismiss" />
                <span>Bỏ qua</span>
              </button>
            )}
          </div>
          <div className="tooltip-footer-right">
            {suggestions.rewritten && (
              <button
                className="tooltip-action-btn apply-btn"
                onClick={() => {
                  onApply(suggestions.rewritten)
                }}
              >
                <img src="/icon/check.svg" alt="apply" />
                <span>Áp dụng</span>
              </button>
            )}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="tooltip-keyboard-hint">
          <span>Tab: Chuyển tiếp</span>
          <span>Shift+Tab: Quay lại</span>
          <span>Esc: Đóng</span>
        </div>
      </div>
    </>,
    document.body
  )
}

export default SuggestionTooltip
