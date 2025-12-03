import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import { Icon } from '../../Common'

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
    return themeIcons[theme] || 'user-round'
  }
  
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
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
        "bg-bg-secondary rounded-md shadow-card",
        "transition-all duration-200",
        "hover:shadow-md hover:bg-bg-hover",
        "group"
      )}
      onClick={() => onSelect(profile)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-md flex items-center justify-center shrink-0",
          "bg-fill-tertiary",
          "transition-all duration-200",
          "group-hover:bg-fill-secondary group-hover:scale-105"
        )}>
          <Icon 
            name={getThemeIcon(profile.theme)} 
            size="lg" 
            color="primary"
            className="group-hover:opacity-90 group-hover:scale-105 transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Title */}
      <h4 className="text-callout font-semibold text-text-primary mb-2 leading-tight">
        {profile.profile_name}
      </h4>
      
      {/* Meta */}
      <div className="flex items-center gap-3 mb-4 text-caption1 text-label-secondary">
        <div className="flex items-center gap-1.5">
          <Icon name="file-text" size="sm" color="muted" />
          <span>{profile.sample_count || 0} {t('common.samples')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="type" size="sm" color="muted" />
          <span>{formatNumber(profile.total_words || 0)} {t('common.words')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-0.5 p-3 bg-fill-quaternary rounded-sm">
          <span className="text-caption2 text-label-tertiary uppercase tracking-wider font-semibold">
            {t('profile.score')}
          </span>
          <span className="text-title3 font-semibold text-text-primary">
            {profile.quality_score || profile.qualityScore || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 p-3 bg-fill-quaternary rounded-sm">
          <span className="text-caption2 text-label-tertiary uppercase tracking-wider font-semibold">
            {t('analysis.avgSentence')}
          </span>
          <span className="text-title3 font-semibold text-text-primary">
            {profile.statistics?.avg_sentence_length?.toFixed(0) || 
             profile.avg_sentence_length?.toFixed(0) || '0'}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge badge-info">
          <Icon name="briefcase" size="xs" color="muted" />
          {t('profile.office')}
        </span>
        <span className="badge badge-success">
          <Icon name="user" size="xs" color="muted" />
          {t('profile.personal')}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-separator">
        <span className="text-caption1 text-label-secondary flex items-center gap-1.5">
          <Icon name="clock" size="sm" color="muted" />
          {formatDate(profile.created_at)}
        </span>
        <button 
          className={cn(
            "btn btn-primary py-1.5 px-4 text-caption1",
            "flex items-center gap-1.5"
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (onUse) onUse(profile)
            else onSelect(profile)
          }}
        >
          <Icon name="play" size="sm" />
          {t('common.use')}
        </button>
      </div>
    </div>
  )
}

export default ProfileCard
