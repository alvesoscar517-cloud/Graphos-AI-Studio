import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './SuggestionTooltip.css'

/**
 * SuggestionTooltip - Tooltip component rendered in portal
 * Tránh xung đột CSS và đảm bảo positioning chính xác
 */
const SuggestionTooltip = ({ 
  targetRect, 
  suggestions, 
  severity,
  onApply,
  onClose 
}) => {
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
          <div className="tooltip-issues-count">
            {suggestions.issues_found} vấn đề
          </div>
        </div>
        
        <div className="suggestion-tooltip-body">
          {suggestions.suggestions && suggestions.suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.suggestions.slice(0, 3).map((sug, idx) => (
                <div key={idx} className="suggestion-item">
                  {sug.suggestion}
                </div>
              ))}
            </div>
          )}
          
          {suggestions.rewritten && (
            <div className="suggestion-rewrite">
              <div className="rewrite-label">Đề xuất viết lại:</div>
              <div className="rewrite-text">{suggestions.rewritten}</div>
              <button
                className="apply-button"
                onClick={() => {
                  onApply(suggestions.rewritten)
                  onClose()
                }}
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

export default SuggestionTooltip
