import { useMemo } from 'react'
import { useTextStats } from '../../hooks/useTextStats'
import './TextStatsBar.css'

/**
 * TextStatsBar - Hiển thị thống kê text và cảnh báo
 * 
 * Features:
 * - Hiển thị số ký tự, từ, tokens, trang
 * - Cảnh báo khi text quá dài
 * - Gợi ý model phù hợp
 * - Chi phí ước tính (optional)
 */
const TextStatsBar = ({ 
  text, 
  model = 'gemini-2.5-flash',
  task = 'rewrite',
  showCost = false,
  showModelHint = false,
  compact = false,
  className = ''
}) => {
  const {
    stats,
    status,
    warnings,
    errors,
    modelRecommendation,
    estimatedCost,
    isTooLong
  } = useTextStats(text, { model, task })

  // Status color
  const statusColor = useMemo(() => {
    switch (status) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'long': return 'warning'
      case 'empty': return 'muted'
      default: return 'normal'
    }
  }, [status])

  if (!text || stats.chars === 0) {
    return null
  }

  if (compact) {
    return (
      <div className={`text-stats-bar compact ${statusColor} ${className}`}>
        <span className="stat-item">
          {stats.chars.toLocaleString()} ký tự
        </span>
        {stats.words > 0 && (
          <span className="stat-item">
            {stats.words.toLocaleString()} từ
          </span>
        )}
        {isTooLong && (
          <span className="stat-warning" title="Text is quite long">
            ⚠️
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`text-stats-bar ${statusColor} ${className}`}>
      <div className="stats-main">
        <span className="stat-item" title="Số ký tự">
          <span className="stat-icon">📝</span>
          {stats.chars.toLocaleString()}
        </span>
        
        <span className="stat-item" title="Số từ">
          <span className="stat-icon">📖</span>
          {stats.words.toLocaleString()} từ
        </span>
        
        <span className="stat-item" title="Estimated tokens">
          <span className="stat-icon">🎯</span>
          ~{stats.tokens.toLocaleString()} tokens
        </span>
        
        {stats.pages > 1 && (
          <span className="stat-item" title="Estimated A4 pages">
            <span className="stat-icon">📄</span>
            ~{stats.pages} trang
          </span>
        )}

        {showCost && (
          <span className="stat-item cost" title="Estimated cost">
            <span className="stat-icon">💰</span>
            {estimatedCost}
          </span>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="stats-warnings">
          {warnings.map((w, i) => (
            <span key={i} className="warning-item">⚠️ {w}</span>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="stats-errors">
          {errors.map((e, i) => (
            <span key={i} className="error-item">❌ {e}</span>
          ))}
        </div>
      )}

      {/* Model hint */}
      {showModelHint && modelRecommendation.model !== model && (
        <div className="stats-hint">
          💡 Gợi ý: {modelRecommendation.reason}
        </div>
      )}
    </div>
  )
}

export default TextStatsBar
