// @ts-nocheck
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import threeDotsAnimation from '../../../animation/Three dots loading.json'
import LazyLottie from '../../Common/LazyLottie'

/**
 * @param {Object} props
 * @param {Object} props.profile - Profile data
 * @param {Function} props.onSelect - Callback when profile is selected
 * @param {Function} props.onUse - Callback when profile is used
 * @param {boolean} props.isLoading - Loading state
 * @param {number} [props.visibleCards=3] - Number of visible cards in carousel
 */
const ProfileCard = ({ profile, onSelect, onUse, isLoading, visibleCards = 3 }) => {
  const { t } = useTranslation()
  
  // Calculate card width based on visible cards with proper gap compensation
  const getCardWidth = () => {
    const gap = 20 // gap-5 = 1.25rem = 20px
    switch (visibleCards) {
      case 1: return '100%'
      case 2: return `calc(50% - ${gap / 2}px)`
      case 3:
      default: return `calc(33.333% - ${(gap * 2) / 3}px)`
    }
  }
  
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
    
    // Reset time to midnight for accurate day comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const diffTime = nowOnly.getTime() - dateOnly.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('common.today')
    if (diffDays === 1) return t('common.yesterday')
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays })
    if (diffDays < 30) return t('common.weeksAgo', { count: Math.floor(diffDays / 7) })
    
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div 
      className={cn(
        "min-w-0 p-5 cursor-pointer relative overflow-hidden",
        "bg-bg-secondary border border-border-light rounded-xl",
        "transition-[transform,box-shadow,border-color,background-color] duration-200",
        "hover:shadow-md hover:border-border-hover hover:bg-bg-hover",
        "group",
        "max-lg:p-4 max-sm:p-3.5",
        isLoading && "pointer-events-none"
      )}
      style={{ 
        flex: `0 0 ${getCardWidth()}`,
        transition: 'flex-basis 0.3s ease, transform 0.2s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s'
      }}
      onClick={() => !isLoading && onSelect(profile)}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-bg-secondary/80 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
          {/* @ts-ignore - LazyLottie props are correct */}
          <LazyLottie 
            animationData={threeDotsAnimation} 
            loop={true}
            style={{ width: 60, height: 30 }}
          />
        </div>
      )}
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4 max-lg:mb-3">
        <div className={cn(
          "card-icon group-hover:scale-105 transition-transform duration-200",
          "max-lg:!w-10 max-lg:!h-10 max-sm:!w-9 max-sm:!h-9"
        )}>
          <img 
            src={`/icon/${getThemeIcon(profile.theme)}.svg`} 
            alt="" 
            className="w-6 h-6 filter-icon-primary group-hover:opacity-100 max-lg:w-5 max-lg:h-5 max-sm:w-4 max-sm:h-4"
          />
        </div>
      </div>
      
      {/* Title */}
      <h4 className="text-base font-semibold text-text-primary mb-2 leading-tight line-clamp-1 max-lg:text-sm max-sm:text-[13px]">
        {profile.profile_name}
      </h4>
      
      {/* Meta */}
      <div className={cn(
        "flex items-center gap-3 mb-4 text-xs text-text-muted flex-wrap",
        "max-lg:gap-2 max-lg:mb-3 max-lg:text-[11px]",
        "max-sm:gap-1.5 max-sm:text-[10px]"
      )}>
        <div className="flex items-center gap-1.5 max-lg:gap-1">
          <img src="/icon/file-text.svg" alt="" className="w-3.5 h-3.5 opacity-50 icon-invert max-lg:w-3 max-lg:h-3" />
          <span>{profile.sample_count || 0} {t('common.samples')}</span>
        </div>
        <div className="flex items-center gap-1.5 max-lg:gap-1">
          <img src="/icon/type.svg" alt="" className="w-3.5 h-3.5 opacity-50 icon-invert max-lg:w-3 max-lg:h-3" />
          <span>{formatNumber(profile.total_words || 0)} {t('common.words')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-lg:gap-2 max-lg:mb-3 max-sm:gap-1.5">
        <div className={cn(
          "flex flex-col gap-0.5 p-3",
          "bg-fill-tertiary border border-border-light rounded-lg",
          "max-lg:p-2 max-sm:p-1.5"
        )}>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium max-lg:text-[9px] max-sm:text-[8px]">
            {t('profile.score')}
          </span>
          <span className="text-lg font-semibold text-text-primary max-lg:text-base max-sm:text-sm">
            {profile.quality_score || profile.qualityScore || 'N/A'}
          </span>
        </div>
        <div className={cn(
          "flex flex-col gap-0.5 p-3",
          "bg-fill-tertiary border border-border-light rounded-lg",
          "max-lg:p-2 max-sm:p-1.5"
        )}>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium max-lg:text-[9px] max-sm:text-[8px]">
            {t('analysis.avgSentence')}
          </span>
          <span className="text-lg font-semibold text-text-primary max-lg:text-base max-sm:text-sm">
            {profile.statistics?.avg_sentence_length?.toFixed(0) || 
             profile.avg_sentence_length?.toFixed(0) || '0'}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 max-lg:gap-1.5 max-lg:mb-3 max-sm:gap-1">
        <span className={cn(
          "inline-flex items-center gap-1 py-1 px-2.5 rounded-md text-xs font-medium",
          "bg-fill-tertiary text-text-secondary border border-border-light",
          "max-lg:py-0.5 max-lg:px-2 max-lg:text-[11px]",
          "max-sm:px-1.5 max-sm:text-[10px]"
        )}>
          <img src="/icon/briefcase.svg" alt="" className="w-3 h-3 opacity-60 icon-invert max-sm:w-2.5 max-sm:h-2.5" />
          {t('profile.office')}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1 py-1 px-2.5 rounded-md text-xs font-medium",
          "bg-fill-tertiary text-text-secondary border border-border-light",
          "max-lg:py-0.5 max-lg:px-2 max-lg:text-[11px]",
          "max-sm:px-1.5 max-sm:text-[10px]"
        )}>
          <img src="/icon/user.svg" alt="" className="w-3 h-3 opacity-60 icon-invert max-sm:w-2.5 max-sm:h-2.5" />
          {t('profile.personal')}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light max-lg:pt-3 max-sm:pt-2.5">
        <span className="text-xs text-text-muted flex items-center gap-1.5 max-lg:text-[11px] max-lg:gap-1 max-sm:text-[10px]">
          <img src="/icon/clock.svg" alt="" className="w-3.5 h-3.5 opacity-50 icon-invert max-lg:w-3 max-lg:h-3" />
          <span className="truncate max-w-[80px] max-sm:max-w-[60px]">{formatDate(profile.created_at)}</span>
        </span>
        <button 
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-4 rounded-lg shrink-0",
            "bg-fill-tertiary text-text-primary text-xs font-medium",
            "border border-border-light",
            "transition-all duration-200",
            "hover:bg-fill-secondary hover:border-border-hover",
            "max-lg:py-1 max-lg:px-3 max-lg:text-[11px] max-lg:gap-1",
            "max-sm:py-1 max-sm:px-2.5 max-sm:text-[10px]"
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (onUse) onUse(profile)
            else onSelect(profile)
          }}
        >
          <img src="/icon/play.svg" alt="" className="w-3.5 h-3.5 opacity-70 icon-invert max-lg:w-3 max-lg:h-3" />
          {t('common.use')}
        </button>
      </div>
    </div>
  )
}

export default ProfileCard
