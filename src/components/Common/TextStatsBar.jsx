import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTextStats } from '../../hooks/useTextStats'
import './TextStatsBar.css'

/**
 * TextStatsBar - Display text statistics and warnings
 * 
 * Features:
 * - Display character count, words, tokens, pages
 * - Warning khi text quá dài
 * - Suggest appropriate model
 * - Estimated cost (optional)
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
  const { t } = useTranslation()
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
          {stats.chars.toLocaleString()} {t('tokens.characters')}
        </span>
        {stats.words > 0 && (
          <span className="stat-item">
            {stats.words.toLocaleString()} {t('common.words')}
          </span>
        )}
        {isTooLong && (
          <span className="stat-warning" title={t('tokens.textQuiteLong')}>
            [{t('common.warning').toUpperCase()}]
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`text-stats-bar ${statusColor} ${className}`}>
      <div className="stats-main">
        <span className="stat-item" title={t('tokens.characters')}>
          <span className="stat-icon">[NOTE]</span>
          {stats.chars.toLocaleString()}
        </span>
        
        <span className="stat-item" title={t('common.words')}>
          <span className="stat-icon">📖</span>
          {stats.words.toLocaleString()} {t('common.words')}
        </span>
        
        <span className="stat-item" title={t('tokens.tokens')}>
          <span className="stat-icon">[TARGET]</span>
          ~{stats.tokens.toLocaleString()} {t('tokens.tokens')}
        </span>
        
        {stats.pages > 1 && (
          <span className="stat-item" title={t('tokens.pages')}>
            <span className="stat-icon">📄</span>
            ~{stats.pages} {t('tokens.pages')}
          </span>
        )}

        {showCost && (
          <span className="stat-item cost" title={t('credits.credits')}>
            <span className="stat-icon">💰</span>
            {estimatedCost}
          </span>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="stats-warnings">
          {warnings.map((w, i) => (
            <span key={i} className="warning-item">[{t('common.warning').toUpperCase()}] {w}</span>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="stats-errors">
          {errors.map((e, i) => (
            <span key={i} className="error-item">[{t('common.error').toUpperCase()}] {e}</span>
          ))}
        </div>
      )}

      {/* Model hint */}
      {showModelHint && modelRecommendation.model !== model && (
        <div className="stats-hint">
          💡 {t('analysis.suggestions')}: {modelRecommendation.reason}
        </div>
      )}
    </div>
  )
}

export default TextStatsBar
