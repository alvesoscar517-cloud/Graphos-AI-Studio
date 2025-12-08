import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

const ProfileCard = ({ profile, onSelect, onUse }) => {
  const { t } = useTranslation()
  
  const getThemeIcon = (theme) => {
    const themeIcons = {
      'work': 'briefcase',
      'personal': 'user',
      'academic': 'graduation-cap',
      'creative': 'palette',
      'business': 'trending-up',
      'social': 'message-circle',
      'technical': 'code',
      'other': 'more-horizontal'
    }
    return themeIcons[theme] || 'fingerprint'
  }
  
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num?.toString() || '0'
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('common.today')
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('common.today')
    if (diffDays === 1) return t('common.yesterday')
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays })
    if (diffDays < 30) return t('common.weeksAgo', { count: Math.floor(diffDays / 7) })
    
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div 
      className={cn(
        "flex-[0_0_calc(33.333%-14px)] min-w-0 p-5 cursor-pointer relative overflow-hidden",
        "bg-bg-secondary border border-border-light rounded-xl",
        "transition-all duration-200",
        "hover:shadow-md hover:border-border-hover hover:bg-bg-hover",
        "group"
      )}
      onClick={() => onSelect(profile)}
    >
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="card-icon group-hover:scale-105">
          <img 
            src={`/icon/${getThemeIcon(profile.theme)}.svg`} 
            alt="" 
            className="w-6 h-6 filter-icon-primary group-hover:opacity-100"
          />
        </div>
      </div>
      
      {/* Title */}
      <h4 className="text-base font-semibold text-text-primary mb-2 leading-tight line-clamp-1">
        {profile.profile_name}
      </h4>
      
      {/* Meta */}
      <div className="flex items-center gap-3 mb-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <img src="/icon/file-text.svg" alt="" className="w-3.5 h-3.5 opacity-50 icon-invert" />
          <span>{profile.sample_count || 0} {t('common.samples')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <img src="/icon/type.svg" alt="" className="w-3.5 h-3.5 opacity-50 icon-invert" />
          <span>{formatNumber(profile.total_words || 0)} {t('common.words')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={cn(
          "flex flex-col gap-0.5 p-3",
          "bg-fill-tertiary border border-border-light rounded-lg"
        )}>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
            {t('profile.score')}
          </span>
          <span className="text-lg font-semibold text-text-primary">
            {profile.quality_score || profile.qualityScore || 'N/A'}
          </span>
        </div>
        <div className={cn(
          "flex flex-col gap-0.5 p-3",
          "bg-fill-tertiary border border-border-light rounded-lg"
        )}>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
            {t('analysis.avgSentence')}
          </span>
          <span className="text-lg font-semibold text-text-primary">
            {profile.statistics?.avg_sentence_length?.toFixed(0) || 
             profile.avg_sentence_length?.toFixed(0) || '0'}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={cn(
          "inline-flex items-center gap-1 py-1 px-2.5 rounded-md text-xs font-medium",
          "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        )}>
          <img src="/icon/briefcase.svg" alt="" className="w-3 h-3 opacity-70 icon-invert" />
          {t('profile.office')}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1 py-1 px-2.5 rounded-md text-xs font-medium",
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        )}>
          <img src="/icon/user.svg" alt="" className="w-3 h-3 opacity-70 icon-invert" />
          {t('profile.personal')}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        <span className="text-xs text-text-muted flex items-center gap-1.5">
          <img src="/icon/clock.svg" alt="" className="w-3.5 h-3.5 opacity-50 icon-invert" />
          {formatDate(profile.created_at)}
        </span>
        <button 
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-4 rounded-lg",
            "bg-accent text-white text-xs font-medium",
            "transition-all duration-200",
            "hover:bg-accent-hover hover:shadow-sm"
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (onUse) onUse(profile)
            else onSelect(profile)
          }}
        >
          <img src="/icon/play.svg" alt="" className="w-3.5 h-3.5 invert" />
          {t('common.use')}
        </button>
      </div>
    </div>
  )
}

export default ProfileCard
