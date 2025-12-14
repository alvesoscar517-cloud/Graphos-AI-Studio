import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

/**
 * SuggestionTooltip - Compact tooltip matching system design
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
  const { t } = useTranslation()
  const [showAllIssues, setShowAllIssues] = useState(false)
  const tooltipRef = useRef(null)
  
  useEffect(() => {
    if (!tooltipRef.current || !targetRect) return
    
    const tooltip = tooltipRef.current
    const tooltipRect = tooltip.getBoundingClientRect()
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 16
    
    let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
    
    if (left < margin) {
      left = margin
    } else if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - tooltipRect.width - margin
    }
    
    let top = targetRect.bottom + 8
    
    if (top + tooltipRect.height > viewportHeight - margin) {
      const topAbove = targetRect.top - tooltipRect.height - 8
      if (topAbove > margin) {
        top = topAbove
      } else {
        top = Math.min(top, viewportHeight - tooltipRect.height - margin)
      }
    }
    
    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
    tooltip.style.opacity = '1'
    tooltip.style.transform = 'scale(1)'
  }, [targetRect])
  
  if (!targetRect || !suggestions) return null

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'high': case 'severe': return 'error'
      case 'medium': case 'moderate': return 'warning'
      default: return 'primary'
    }
  }

  const getSeverityLabel = (sev) => {
    switch (sev) {
      case 'high': case 'severe': return t('analysis.severe')
      case 'medium': case 'moderate': return t('analysis.moderate')
      default: return t('analysis.mild')
    }
  }

  const getIssueIcon = (type) => {
    const icons = {
      length: 'scissors',
      vocabulary: 'book-open',
      formality: 'briefcase',
      tone: 'smile',
      coherence: 'link',
      repetition: 'repeat',
      voice: 'mic',
      punctuation: 'more-horizontal'
    }
    return icons[type] || 'alert-circle'
  }

  const color = getSeverityColor(severity)

  return createPortal(
    <>
      <div className="fixed inset-0 z-modal-backdrop bg-transparent" onClick={onClose} />
      <div 
        ref={tooltipRef}
        className={cn(
          "fixed w-[420px] max-h-[450px] overflow-y-auto overflow-x-hidden",
          "bg-bg-primary border border-border-light rounded-xl shadow-lg",
          "p-4 z-modal opacity-0 scale-95 transition-all duration-150",
          "scrollbar-none [-ms-overflow-style:none]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            "text-2xs font-medium py-1 px-2 rounded-md flex items-center gap-1.5",
            color === 'error' && "bg-error/10 text-error",
            color === 'warning' && "bg-warning/10 text-warning",
            color === 'primary' && "bg-primary/10 text-primary"
          )}>
            <Icon name="lightbulb" size="xs" color={color} />
            <span>{t('tooltip.suggestion')}</span>
          </div>
          <button 
            className="p-1 bg-transparent border-none rounded-md cursor-pointer opacity-50 hover:opacity-100 hover:bg-bg-secondary transition-all"
            onClick={onClose}
            data-tooltip={t('common.close')}
            data-tooltip-position="bottom"
          >
            <Icon name="x" size="sm" color="muted" />
          </button>
        </div>
        
        {/* Issues List */}
        {suggestions.issues && suggestions.issues.length > 0 && (
          <div className="flex flex-col gap-2">
            {(showAllIssues ? suggestions.issues : suggestions.issues.slice(0, 3)).map((issue, idx) => (
              <div key={idx} className="p-2 bg-bg-secondary rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name={getIssueIcon(issue.type)} size="xs" color="muted" />
                  <span className="text-2xs font-medium text-text-secondary capitalize">{issue.type}</span>
                  <span className={cn(
                    "text-2xs py-0.5 px-1.5 rounded-md font-medium ml-auto",
                    issue.severity === 'high' && "bg-error/15 text-error",
                    issue.severity === 'medium' && "bg-warning/15 text-warning",
                    issue.severity === 'low' && "bg-primary/15 text-primary"
                  )}>
                    {getSeverityLabel(issue.severity)}
                  </span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed m-0">{issue.detail}</p>
                {issue.suggestion && (
                  <div className="flex items-start gap-1.5 mt-1.5 text-sm text-primary">
                    <Icon name="lightbulb" size="xs" color="primary" className="mt-0.5 flex-shrink-0" />
                    <span>{issue.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
            {suggestions.issues.length > 3 && (
              <button 
                className="py-1.5 px-2 bg-transparent border-none rounded-md text-xs text-text-muted cursor-pointer hover:bg-bg-secondary transition-all"
                onClick={() => setShowAllIssues(!showAllIssues)}
              >
                {showAllIssues ? t('tooltip.collapse') : `+${suggestions.issues.length - 3} ${t('common.more')}`}
              </button>
            )}
          </div>
        )}

        {/* Legacy suggestions */}
        {suggestions.suggestions && suggestions.suggestions.length > 0 && !suggestions.issues && (
          <div className="flex flex-col gap-1.5">
            {suggestions.suggestions.slice(0, 3).map((sug, idx) => (
              <p key={idx} className="text-sm text-text-secondary m-0 leading-relaxed">
                {typeof sug === 'string' ? sug : sug.suggestion}
              </p>
            ))}
          </div>
        )}
        
        {/* Rewrite suggestion */}
        {suggestions.rewritten && (
          <div className="mt-3 pt-3 border-t border-border-light">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="wand-sparkles" size="xs" color="primary" />
              <span className="text-xs font-medium text-text-secondary">{t('rewrite.rewriteSuggestion')}</span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed m-0 p-3 bg-bg-secondary rounded-lg">{suggestions.rewritten}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light gap-2">
          {onDismiss && (
            <button 
              className="p-1.5 bg-bg-secondary border-none rounded-md cursor-pointer hover:bg-error/10 transition-all mx-auto"
              onClick={onDismiss}
              data-tooltip={t('tooltip.skipSuggestion')}
              data-tooltip-position="top"
              style={{ marginLeft: suggestions.rewritten ? 0 : 'auto', marginRight: suggestions.rewritten ? 0 : 'auto' }}
            >
              <Icon name="x-circle" size="sm" color="muted" />
            </button>
          )}
          {suggestions.rewritten && (
            <button
              className="flex items-center gap-1.5 py-2 px-4 bg-primary text-white border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-hover transition-all ml-auto"
              onClick={() => onApply(suggestions.rewritten)}
            >
              <img src="/icon/check.svg" alt="check" className="w-4 h-4 brightness-0 invert" />
              <span>{t('tooltip.apply')}</span>
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

export default SuggestionTooltip
