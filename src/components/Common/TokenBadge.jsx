import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useRewrite } from '@/stores'
import { useTextStats } from '../../hooks/useTextStats'
import { MODEL_LIMITS } from '../../utils/tokenUtils'
import { cn } from '../../lib/utils'
import Icon from './Icon'

const WARNING_CHARS = 30000
const DANGER_CHARS = 80000

const TokenBadge = ({ text, task = 'rewrite' }) => {
  const { t } = useTranslation()
  const { selectedModel } = useRewrite()
  const [showPopup, setShowPopup] = useState(false)
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const [warningPosition, setWarningPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef(null)
  const warningRef = useRef(null)
  const hideTimeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)

  const model = selectedModel || 'gemini-2.5-flash'
  const { stats, credits } = useTextStats(text, { model, task })
  const limits = MODEL_LIMITS[model] || MODEL_LIMITS['gemini-2.5-flash']

  const estimatedOutput = useMemo(() => {
    if (task === 'analyze') return Math.min(stats.tokens * 0.3, 2000)
    if (task === 'detect') return 500
    return Math.ceil(stats.tokens * 1.1)
  }, [stats.tokens, task])

  const totalTokens = stats.tokens + estimatedOutput

  const warningLevel = useMemo(() => {
    if (stats.chars >= DANGER_CHARS) return 'danger'
    if (stats.chars >= WARNING_CHARS) return 'warning'
    return 'normal'
  }, [stats.chars])

  const estimatedTime = useMemo(() => {
    return Math.max(2, Math.ceil(stats.tokens / 500))
  }, [stats.tokens])

  const formatNumber = (num) => num.toLocaleString('en-US')
  const formatCredits = (val) => val < 0.1 ? '< 0.1' : val.toFixed(1)

  const handleBadgeEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setPopupPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 })
    }
    setShowPopup(true)
  }

  const handleBadgeLeave = () => {
    hideTimeoutRef.current = setTimeout(() => setShowPopup(false), 150)
  }

  const handleWarningEnter = () => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (warningRef.current) {
      const rect = warningRef.current.getBoundingClientRect()
      setWarningPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 })
    }
    setShowWarningPopup(true)
  }

  const handleWarningLeave = () => {
    warningTimeoutRef.current = setTimeout(() => setShowWarningPopup(false), 150)
  }

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    }
  }, [])

  if (!text || stats.chars < 10) return null

  return (
    <>
      {/* Main Badge */}
      <div 
        ref={badgeRef}
        className={cn("inline-flex items-center py-1 px-2.5 text-xs font-medium","text-text-muted bg-bg-secondary rounded-xl","cursor-default transition-colors duration-150 select-none","hover:bg-bg-tertiary"
        )}
        onMouseEnter={handleBadgeEnter}
        onMouseLeave={handleBadgeLeave}
      >
        <span className="tabular-nums">{formatNumber(stats.tokens)} {t('tokens.tokens')}</span>
      </div>

      {/* Warning Icon */}
      {warningLevel !== 'normal' && (
        <div
          ref={warningRef}
          className={cn("inline-flex items-center justify-center w-6 h-6 ml-1","cursor-default rounded-md transition-colors duration-150","hover:bg-bg-tertiary"
          )}
          onMouseEnter={handleWarningEnter}
          onMouseLeave={handleWarningLeave}
        >
          <Icon 
            name="alert-triangle" 
            alt="warning" 
            size="sm"
            color={warningLevel === 'danger' ? 'error' : 'warning'}
            themed={false}
          />
        </div>
      )}

      {/* Main Popup */}
      {showPopup && createPortal(
        <div 
          className="fixed z-modal -translate-x-1/2 animate-fade-in-fast"
          style={{ top: popupPosition.top, left: popupPosition.left }}
          onMouseEnter={handleBadgeEnter}
          onMouseLeave={handleBadgeLeave}
        >
          <div className={cn("bg-bg-primary border border-border rounded-lg","py-2 px-2.5 min-w-[170px] shadow-lg"
          )} style={{ fontSize: '11px' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-text-muted uppercase tracking-wide" style={{ fontSize: '10px' }}>
                {t('tokens.tokenUsage')}
              </span>
              <span className="font-medium text-primary tabular-nums">
                {formatNumber(stats.tokens)} / {formatNumber(limits.maxInput)}
              </span>
            </div>

            <div className="h-px bg-border-light my-1.5" />

            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.inputTokens')}</span>
              <span className="tabular-nums text-text-primary">{formatNumber(stats.tokens)}</span>
            </div>
            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.outputTokens')}</span>
              <span className="tabular-nums text-text-primary">~{formatNumber(estimatedOutput)}</span>
            </div>
            <div className="flex justify-between font-medium py-px">
              <span>{t('tokens.totalTokens')}</span>
              <span className="tabular-nums text-primary">{formatNumber(totalTokens)}</span>
            </div>

            <div className="h-px bg-border-light my-1.5" />

            <div className="font-semibold text-text-muted uppercase tracking-wide mb-0.5" style={{ fontSize: '10px' }}>
              {t('credits.credits').toUpperCase()}
            </div>
            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.inputTokens')}</span>
              <span className="tabular-nums text-text-primary">{formatNumber(credits.inputTokens || 0)}</span>
            </div>
            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.outputTokens')}</span>
              <span className="tabular-nums text-text-primary">~{formatNumber(credits.outputTokens || 0)}</span>
            </div>
            <div className="flex justify-between font-medium py-px">
              <span>{t('tokens.total')}</span>
              <span className="tabular-nums text-primary">{credits.display || formatCredits(credits.totalCredits || 0)} {t('credits.credits')}</span>
            </div>

            <div className="h-px bg-border-light my-1.5" />

            <div className="flex items-center gap-1 text-text-muted flex-wrap" style={{ fontSize: '10px' }}>
              <span>{formatNumber(stats.chars)} {t('tokens.characters')}</span>
              <span>•</span>
              <span>{formatNumber(stats.words)} {t('common.words')}</span>
              {stats.pages > 1 && (
                <>
                  <span>•</span>
                  <span>~{stats.pages} {t('tokens.pages')}</span>
                </>
              )}
            </div>

            <div className="mt-1 text-text-muted text-right" style={{ fontSize: '10px' }}>
              {t('tokens.model')}: {limits.name}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Warning Popup */}
      {showWarningPopup && warningLevel !== 'normal' && createPortal(
        <div 
          className="fixed z-modal -translate-x-1/2 animate-fade-in-fast"
          style={{ top: warningPosition.top, left: warningPosition.left }}
          onMouseEnter={handleWarningEnter}
          onMouseLeave={handleWarningLeave}
        >
          <div className="bg-bg-primary border border-border rounded-lg py-2 px-2.5 min-w-[170px] shadow-lg" style={{ fontSize: '11px' }}>
            <div className="flex items-center gap-1.5 font-medium text-text-primary" style={{ fontSize: '12px' }}>
              <Icon name="alert-triangle" alt={t('common.warning')} size="sm" color="warning" themed={false} />
              <span>{warningLevel === 'danger' ? t('tokens.textVeryLong') : t('tokens.textQuiteLong')}</span>
            </div>

            <div className="h-px bg-border-light my-1.5" />

            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.length')}</span>
              <span className="text-text-primary">{formatNumber(stats.words)} {t('common.words')} (~{stats.pages} {t('tokens.pages')})</span>
            </div>
            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.tokens')}</span>
              <span className="text-text-primary">~{formatNumber(totalTokens)}</span>
            </div>
            <div className="flex justify-between text-text-secondary py-px">
              <span>{t('tokens.processingTime')}</span>
              <span className="text-text-primary">~{estimatedTime}s</span>
            </div>
            <div className="flex justify-between font-medium py-px">
              <span>{t('credits.credits')}</span>
              <span className="text-primary">{credits.display || formatCredits(credits.totalCredits || 0)}</span>
            </div>

            <div className="h-px bg-border-light my-1.5" />

            <div className="text-text-secondary leading-relaxed" style={{ fontSize: '10px' }}>
              {warningLevel === 'danger' 
                ? t('tokens.veryLongWarning')
                : t('tokens.longWarning')}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default TokenBadge
