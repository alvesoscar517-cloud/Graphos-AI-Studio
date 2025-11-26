import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRewrite } from '../../contexts/RewriteContext'
import { useTextStats } from '../../hooks/useTextStats'
import { MODEL_LIMITS } from '../../utils/tokenUtils'
import './TokenBadge.css'

// Ngưỡng cảnh báo
const WARNING_CHARS = 30000   // ~7500 tokens
const DANGER_CHARS = 80000    // ~20000 tokens

/**
 * TokenBadge - Hiển thị token count với popup chi tiết
 * Tự động lấy model từ RewriteContext
 */
const TokenBadge = ({ text, task = 'rewrite' }) => {
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

  // Tính output tokens ước tính
  const estimatedOutput = useMemo(() => {
    if (task === 'analyze') return Math.min(stats.tokens * 0.3, 2000)
    if (task === 'detect') return 500
    return Math.ceil(stats.tokens * 1.1)
  }, [stats.tokens, task])

  const totalTokens = stats.tokens + estimatedOutput

  // Xác định mức cảnh báo
  const warningLevel = useMemo(() => {
    if (stats.chars >= DANGER_CHARS) return 'danger'
    if (stats.chars >= WARNING_CHARS) return 'warning'
    return 'normal'
  }, [stats.chars])

  // Thời gian xử lý ước tính (giây)
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
        <span className="token-count">{formatNumber(stats.tokens)} tokens</span>
      </div>

      {/* Warning Icon - chỉ hiện khi text dài */}
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
              <span className="token-popup-label">TOKEN USAGE</span>
              <span className="token-popup-value primary">
                {formatNumber(stats.tokens)} / {formatNumber(limits.maxInput)}
              </span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-row">
              <span>Input tokens</span>
              <span>{formatNumber(stats.tokens)}</span>
            </div>
            <div className="token-popup-row">
              <span>Output tokens</span>
              <span>~{formatNumber(estimatedOutput)}</span>
            </div>
            <div className="token-popup-row highlight">
              <span>Total tokens</span>
              <span>{formatNumber(totalTokens)}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-section">
              <span className="token-popup-label">CREDITS</span>
            </div>
            <div className="token-popup-row">
              <span>Input</span>
              <span>{formatCredits(credits.inputCredits)}</span>
            </div>
            <div className="token-popup-row">
              <span>Output</span>
              <span>~{formatCredits(credits.outputCredits)}</span>
            </div>
            <div className="token-popup-row highlight">
              <span>Total</span>
              <span>{formatCredits(credits.totalCredits)} credits</span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-footer">
              <span>{formatNumber(stats.chars)} ký tự</span>
              <span>•</span>
              <span>{formatNumber(stats.words)} từ</span>
              {stats.pages > 1 && (
                <>
                  <span>•</span>
                  <span>~{stats.pages} trang</span>
                </>
              )}
            </div>

            <div className="token-popup-model">
              Model: {limits.name}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Warning Popup - Cảnh báo text dài */}
      {showWarningPopup && warningLevel !== 'normal' && createPortal(
        <div 
          className="token-popup warning-popup"
          style={{ top: warningPosition.top, left: warningPosition.left }}
          onMouseEnter={handleWarningEnter}
          onMouseLeave={handleWarningLeave}
        >
          <div className="token-popup-content">
            <div className="warning-popup-header">
              <img src="/icon/alert-triangle.svg" alt="warning" />
              <span>Text {warningLevel === 'danger' ? 'very long' : 'quite long'}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="token-popup-row">
              <span>Độ dài</span>
              <span>{formatNumber(stats.words)} từ (~{stats.pages} trang)</span>
            </div>
            <div className="token-popup-row">
              <span>Tokens</span>
              <span>~{formatNumber(totalTokens)}</span>
            </div>
            <div className="token-popup-row">
              <span>Thời gian xử lý</span>
              <span>~{estimatedTime}s</span>
            </div>
            <div className="token-popup-row highlight">
              <span>Credits</span>
              <span>~{formatCredits(credits.totalCredits)}</span>
            </div>

            <div className="token-popup-divider" />

            <div className="warning-popup-note">
              {warningLevel === 'danger' 
                ? 'Very long text may take more time and credits to process.'
                : 'Long text may take additional processing time.'}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default TokenBadge
