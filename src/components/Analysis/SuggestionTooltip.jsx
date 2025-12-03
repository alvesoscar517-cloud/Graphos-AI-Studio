import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

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
    
    let top = targetRect.bottom + 12
    
    if (top + tooltipRect.height > viewportHeight - margin) {
      const topAbove = targetRect.top - tooltipRect.height - 12
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
      case 'high': return t('tooltip.needsFix')
      case 'medium': return t('tooltip.improve')
      case 'low': return t('tooltip.suggestion')
      default: return t('tooltip.suggestion')
    }
  }
  
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

  const getIssueLabel = (type) => {
    return t(`tooltip.issueTypes.${type}`, { defaultValue: type })
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-modal-backdrop bg-transparent" onClick={onClose} />
      <div 
        ref={tooltipRef}
        className={cn(
          "fixed w-[480px] max-h-[calc(100vh-40px)] overflow-y-auto overflow-x-hidden",
          "bg-bg-primary border border-border-hover rounded-lg shadow-popup",
          "p-4 z-modal opacity-0 scale-95 transition-all duration-150",
          "scrollbar-none [-ms-overflow-style:none]",
          "md:w-[calc(100vw-32px)] md:max-w-form-sm"
        )}
      >
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border-light">
          <div className="text-sm font-semibold py-1 px-2.5 rounded-md bg-bg-hover text-text-primary flex items-center gap-1.5">
            <img src={getSeverityIcon()} alt={severity} className="w-4 h-4 icon-invert" />
            {getSeverityLabel()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">
              {suggestions.issues_found} {t('analysis.issues')}
            </span>
            <button 
              className="w-6 h-6 p-1 bg-transparent border-none rounded cursor-pointer opacity-60 transition-all duration-200 hover:opacity-100 hover:bg-bg-hover"
              onClick={onClose}
              title={t('tooltip.closeEsc')}
            >
              <img src="/icon/x.svg" alt={t('common.close')} className="w-4 h-4 icon-invert" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          {/* Detailed Issues List */}
          {suggestions.issues && suggestions.issues.length > 0 && (
            <div className="flex flex-col gap-2">
              {(showAllIssues ? suggestions.issues : suggestions.issues.slice(0, 2)).map((issue, idx) => (
                <div key={idx} className={cn(
                  "py-2.5 px-3 bg-bg-secondary rounded-md border-l-4 border-gray-400",
                  issue.severity === 'high' && "border-l-error bg-error/5",
                  issue.severity === 'medium' && "border-l-warning bg-warning/5",
                  issue.severity === 'low' && "border-l-success bg-success/5"
                )}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <img src={getIssueIcon(issue.type)} alt={issue.type} className="w-3.5 h-3.5 opacity-70 icon-invert" />
                    <span className="text-2xs font-semibold text-text-muted uppercase tracking-wide">{getIssueLabel(issue.type)}</span>
                    <span className={cn(
                      "text-2xs py-0.5 px-1.5 rounded font-medium ml-auto",
                      issue.severity === 'high' && "bg-error/15 text-error",
                      issue.severity === 'medium' && "bg-warning/15 text-warning",
                      issue.severity === 'low' && "bg-success/15 text-success"
                    )}>
                      {issue.severity === 'high' ? t('tooltip.high') : issue.severity === 'medium' ? t('tooltip.medium') : t('tooltip.low')}
                    </span>
                  </div>
                  <div className="text-sm text-text-primary leading-snug">{issue.detail}</div>
                  {issue.suggestion && (
                    <div className="text-xs text-primary mt-1.5 pl-1">
                      💡 {issue.suggestion}
                    </div>
                  )}
                  {issue.examples && issue.examples.length > 0 && (
                    <div className="text-2xs text-text-muted mt-1 italic">
                      {t('tooltip.example')}: {issue.examples.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {suggestions.issues.length > 2 && (
                <button 
                  className="py-1.5 px-3 bg-transparent border border-dashed border-border-hover rounded text-xs text-text-muted cursor-pointer transition-all duration-200 hover:bg-bg-hover hover:border-border"
                  onClick={() => setShowAllIssues(!showAllIssues)}
                >
                  {showAllIssues ? t('tooltip.collapse') : t('tooltip.viewMoreIssues', { count: suggestions.issues.length - 2 })}
                </button>
              )}
            </div>
          )}

          {/* Legacy suggestions format */}
          {suggestions.suggestions && suggestions.suggestions.length > 0 && !suggestions.issues && (
            <div className="flex flex-col gap-2 p-3 bg-bg-hover rounded-md">
              {suggestions.suggestions.slice(0, 3).map((sug, idx) => (
                <div key={idx} className="text-sm leading-relaxed text-text-secondary">
                  {typeof sug === 'string' ? sug : sug.suggestion}
                </div>
              ))}
            </div>
          )}
          
          {/* Rewrite suggestion */}
          {suggestions.rewritten && (
            <div className="pt-3 border-t border-border-light">
              <div className="text-2xs font-semibold text-text-muted mb-2 uppercase tracking-wide">✨ {t('rewrite.rewriteSuggestion')}</div>
              <div className="p-3 bg-bg-hover rounded-md text-sm leading-relaxed text-text-primary mb-2.5">{suggestions.rewritten}</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-border-light gap-2">
          <div className="flex gap-2">
            {canUndo && onUndo && (
              <button className="flex items-center gap-1 py-2 px-3 border-none rounded-md text-xs font-medium cursor-pointer transition-all duration-200 bg-bg-hover text-text-muted hover:bg-bg-tertiary md:p-2 md:[&>span]:hidden" onClick={onUndo} title={t('tooltip.undoCtrlZ')}>
                <img src="/icon/rotate-ccw.svg" alt={t('common.undo')} className="w-3.5 h-3.5 icon-invert" />
                <span>{t('tooltip.undo')}</span>
              </button>
            )}
            {onDismiss && (
              <button className="flex items-center gap-1 py-2 px-3 bg-transparent border border-border-hover rounded-md text-xs font-medium text-text-muted cursor-pointer transition-all duration-200 hover:bg-error/5 hover:border-error hover:text-error md:p-2 md:[&>span]:hidden" onClick={onDismiss} title={t('tooltip.skipSuggestion')}>
                <img src="/icon/x-circle.svg" alt={t('tooltip.skip')} className="w-3.5 h-3.5 opacity-70" />
                <span>{t('tooltip.skip')}</span>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {suggestions.rewritten && (
              <button
                className="flex items-center gap-1 py-2 px-3 border-none rounded-md text-xs font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover md:p-2 md:[&>span]:hidden"
                onClick={() => onApply(suggestions.rewritten)}
              >
                <img src="/icon/check.svg" alt={t('common.apply')} className="w-3.5 h-3.5" />
                <span>{t('tooltip.apply')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="flex justify-center gap-4 pt-2.5 mt-2 border-t border-dashed border-border-light md:hidden">
          <span className="text-2xs text-text-muted">{t('tooltip.tabNext')}</span>
          <span className="text-2xs text-text-muted">{t('tooltip.shiftTabBack')}</span>
          <span className="text-2xs text-text-muted">{t('tooltip.escClose')}</span>
        </div>
      </div>
    </>,
    document.body
  )
}

export default SuggestionTooltip
