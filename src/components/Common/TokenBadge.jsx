import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useRewrite } from '../../contexts/RewriteContext'
import { useTextStats } from '../../hooks/useTextStats'
import { MODEL_LIMITS } from '../../utils/tokenUtils'
import './TokenBadge.css'

// Warning threshold
const WARNING_CHARS = 30000   // ~7500 tokens
const DANGER_CHARS = 80000    // ~20000 tokens

/**
 * TokenBadge - Display token count with detailed popup
 * Auto get model words from RewriteContext
 */
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

  // Calculate estimated output tokens
  const estimatedOutput = useMemo(() => {
    if (task === 'analyze') return Math.min(stats.tokens * 0.3, 2000)
    if (task === 'detect') return 500
    return Math.ceil(stats.tokens * 1.1)
  }, [stats.tokens, task])

  const totalTokens = stats.tokens + estimatedOutput

  // Determine warning level
  const warningLevel = useMemo(() => {
    if (stats.chars >= DANGER_CHARS) return 'danger'
    if (stats.chars >= WARNING_CHARS) return 'warning'
    return 'normal'
  }, [stats.chars])

  // Estimated processing time (seconds)
  const estimatedTime = useMemo(() => {
    return Math.max(2, Math.ceil(stats.tokens / 500))
  }, [stats.tokens])

  const formatNumber = (num) => num.toLocaleString('en-US')
  const formatCredits = (val) => val < 0.1 ? '< 0.1' : val.toFixed(1)

  // Handlers cho main popup
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

  // Handlers cho warning popup
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
        className="token-badge"
        onMouseEnter={handleBadgeEnter}
        onMouseLeave={handleBadgeLeave}
      >
        <span className="token-count">{formatNumber(stats.tokens)} {t('tokens.tokens')}</span>
      </div>

      {/* Warning Icon - only show when text long */}
      {warningLevel !== 'normal' && (
        <div
          ref={warningRef}
          className={`token-warning-icon ${warningLevel}`}
          onMouseEnter={handleWarningEnter}
          onMouseLeave={handleWarningLeave}
        >
          <img src="/icon/alert-triangle.svg" alt="warning" />
        </div>
      )}

      {/* Main Popup - Token details */}
      {showPopup && createPortal(
        <div 
          className="token-popup"
          style={{ top: popupPosition.top, left: popupPosition.left }}
          onMouseEnter={handleBadgeEnter}
          onMouseLeave={handleBadgeLeave}
        >
          <div className="token-popup-content">
            <div className="token-popup-section">
              <span className="token-popup-label">{t('tokens.tokenUsage')}</span>
              <span className="token-popup-value primary">
                {formatNumber(stats.tokens)} / {formatNumber(limits.maxInput)}
              </span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-row">
              <span>{t('tokens.inputTokens')}</span>
              <span>{formatNumber(stats.tokens)}</span>
            </div>
            <div className="token-popup-row">
              <span>{t('tokens.outputTokens')}</span>
              <span>~{formatNumber(estimatedOutput)}</span>
            </div>
            <div className="token-popup-row highlight">
              <span>{t('tokens.totalTokens')}</span>
              <span>{formatNumber(totalTokens)}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-section">
              <span className="token-popup-label">{t('credits.credits').toUpperCase()}</span>
            </div>
            <div className="token-popup-row">
              <span>{t('tokens.inputTokens')}</span>
              <span>{formatNumber(credits.inputTokens || 0)}</span>
            </div>
            <div className="token-popup-row">
              <span>{t('tokens.outputTokens')}</span>
              <span>~{formatNumber(credits.outputTokens || 0)}</span>
            </div>
            <div className="token-popup-row highlight">
              <span>{t('tokens.total')}</span>
              <span>{credits.display || formatCredits(credits.totalCredits || 0)} {t('credits.credits')}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-footer">
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

            <div className="token-popup-model">
              {t('tokens.model')}: {limits.name}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Warning Popup - Warning text dài */}
      {showWarningPopup && warningLevel !== 'normal' && createPortal(
        <div 
          className="token-popup warning-popup"
          style={{ top: warningPosition.top, left: warningPosition.left }}
          onMouseEnter={handleWarningEnter}
          onMouseLeave={handleWarningLeave}
        >
          <div className="token-popup-content">
            <div className="warning-popup-header">
              <img src="/icon/alert-triangle.svg" alt={t('common.warning')} />
              <span>{warningLevel === 'danger' ? t('tokens.textVeryLong') : t('tokens.textQuiteLong')}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-row">
              <span>{t('tokens.length')}</span>
              <span>{formatNumber(stats.words)} {t('common.words')} (~{stats.pages} {t('tokens.pages')})</span>
            </div>
            <div className="token-popup-row">
              <span>{t('tokens.tokens')}</span>
              <span>~{formatNumber(totalTokens)}</span>
            </div>
            <div className="token-popup-row">
              <span>{t('tokens.processingTime')}</span>
              <span>~{estimatedTime}s</span>
            </div>
            <div className="token-popup-row highlight">
              <span>{t('credits.credits')}</span>
              <span>{credits.display || formatCredits(credits.totalCredits || 0)}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="warning-popup-note">
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
