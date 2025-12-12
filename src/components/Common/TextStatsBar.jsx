import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTextStats } from '../../hooks/useTextStats'
import { cn } from '../../lib/utils'

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

  const statusColor = useMemo(() => {
    switch (status) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'long': return 'warning'
      case 'empty': return 'muted'
      default: return 'normal'
    }
  }, [status])

  if (!text || stats.chars === 0) return null

  if (compact) {
    return (
      <div className={cn(
        "flex flex-row items-center py-1 px-2 gap-3 text-xs",
        "text-text-muted bg-bg-secondary rounded-md",
        statusColor === 'warning' && "border-l-2 border-amber-400 bg-amber-500/5",
        statusColor === 'error' && "border-l-2 border-red-400 bg-error/5",
        statusColor === 'muted' && "opacity-60",
        statusColor === 'normal' && "border-l-2 border-green-400",
        className
      )}>
        <span>{stats.chars.toLocaleString()} {t('tokens.characters')}</span>
        {stats.words > 0 && (
          <span>{stats.words.toLocaleString()} {t('common.words')}</span>
        )}
        {isTooLong && (
          <span className="ml-auto text-amber-500" data-tooltip={t('tokens.textQuiteLong')}>
            [{t('common.warning').toUpperCase()}]
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col gap-1 py-1.5 px-3 text-xs",
      "text-text-muted bg-bg-secondary rounded-md",
      "transition-all duration-200",
      statusColor === 'warning' && "border-l-2 border-amber-400 bg-amber-500/5",
      statusColor === 'error' && "border-l-2 border-red-400 bg-error/5",
      statusColor === 'muted' && "opacity-60",
      statusColor === 'normal' && "border-l-2 border-green-400",
      className
    )}>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-2xs opacity-80">[NOTE]</span>
          {stats.chars.toLocaleString()}
        </span>
        
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-2xs opacity-80">[BOOK]</span>
          {stats.words.toLocaleString()} {t('common.words')}
        </span>
        
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-2xs opacity-80">[TARGET]</span>
          ~{stats.tokens.toLocaleString()} {t('tokens.tokens')}
        </span>
        
        {stats.pages > 1 && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-2xs opacity-80">[INFO]</span>
            ~{stats.pages} {t('tokens.pages')}
          </span>
        )}

        {showCost && (
          <span className="flex items-center gap-1 whitespace-nowrap text-amber-400">
            <span className="text-2xs opacity-80">[MONEY]</span>
            {estimatedCost}
          </span>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {warnings.map((w, i) => (
            <span key={i} className="text-2xs text-amber-400">
              [{t('common.warning').toUpperCase()}] {w}
            </span>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {errors.map((e, i) => (
            <span key={i} className="text-2xs text-red-400">
              [{t('common.error').toUpperCase()}] {e}
            </span>
          ))}
        </div>
      )}

      {showModelHint && modelRecommendation.model !== model && (
        <div className="text-2xs text-blue-400 mt-1">
          [HINT] {t('analysis.suggestions')}: {modelRecommendation.reason}
        </div>
      )}
    </div>
  )
}

export default TextStatsBar
