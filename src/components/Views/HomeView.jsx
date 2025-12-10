import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getProfileDetails } from '../../services/api'
import { getCachedProfileDetail, setCachedProfileDetail } from '../../utils/profileDetailCache'
import { useProfilesQuery } from '../../hooks/queries/useProfiles'
import { useProfiles } from '../../contexts/ProfileContext'
import ProfileCarousel from './Home/ProfileCarousel'
import ProfileDetailPopup from '../Popups/ProfileDetailPopup'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const HomeView = ({ onToggleLeftSidebar, onViewChange }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showDetailPopup, setShowDetailPopup] = useState(false)
  const { selectProfile } = useProfiles()
  
  // Use TanStack Query with realtime updates instead of manual cache
  const { data: profiles = [], isLoading: loading } = useProfilesQuery()

  const handleSelectProfile = async (profile) => {
    try {
      const cached = getCachedProfileDetail(profile.profile_id)
      if (cached) {
        setSelectedProfile(cached)
        setShowDetailPopup(true)
        return
      }
      const fullProfile = await getProfileDetails(profile.profile_id)
      setCachedProfileDetail(profile.profile_id, fullProfile)
      setSelectedProfile(fullProfile)
      setShowDetailPopup(true)
    } catch (error) {
      console.error('Error loading profile details:', error)
      modal.error(t('home.unableToLoadProfileDetails'))
    }
  }

  const handleUseProfile = (profile) => {
    selectProfile(profile)
    setShowDetailPopup(false)
    onViewChange('aistudio-editor', { createNew: true })
  }

  const handleUseProfileFromCard = (profile) => {
    selectProfile(profile)
    onViewChange('aistudio-editor', { createNew: true })
  }
  
  const handleCreateProfile = () => {
    navigate('/profile-setup')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-screen bg-bg-tertiary">
      {/* Header - same style as History (no border, only toggle button) */}
      <header className={cn(
        "flex items-center py-2 px-4",
        "bg-bg-tertiary h-14 shrink-0"
      )}>
        <button 
          className={cn(
            "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
            "w-8 h-8 shrink-0 flex items-center justify-center",
            "transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')} 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt={t('common.menu')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 p-0 w-full overflow-y-auto">
        {/* Hero */}
        <div className={cn(
          "text-left mb-6 flex flex-col gap-0.5",
          "w-[80%] mx-auto",
          "transition-all duration-300",
          "max-lg:w-[90%] max-md:w-[95%] max-md:px-4",
          "max-sm:mb-4"
        )}>
          <h2 className="text-4xl font-normal text-text-primary mb-0 max-md:text-3xl max-sm:text-2xl">
            <span className="font-bold">Graphos</span> AI Studio
          </h2>
          <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start max-md:gap-3 max-sm:gap-2">
            <p className="text-sm text-text-muted font-normal mb-0 leading-relaxed max-sm:text-xs">
              {t('home.heroSubtitle')}
            </p>
            <button 
              className={cn(
                "flex items-center gap-2 bg-transparent border border-border-light",
                "py-2 px-5 rounded-pill cursor-pointer text-base text-text-primary font-medium",
                "shrink-0 h-fit leading-relaxed transition-all duration-200",
                "hover:bg-bg-secondary hover:shadow-sm",
                "max-lg:py-1.5 max-lg:px-4 max-lg:text-sm",
                "max-md:w-full max-md:justify-center",
                "max-sm:py-1.5 max-sm:px-3 max-sm:text-xs max-sm:gap-1.5"
              )}
              onClick={handleCreateProfile}
            >
              <img src="/icon/plus.svg" alt="Plus" className="w-icon-xl h-icon-xl opacity-80 icon-invert max-lg:w-icon-lg max-lg:h-icon-lg max-sm:w-4 max-sm:h-4" />
              <span>{t('home.newProfile')}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "grid grid-cols-3 gap-4 mb-14",
          "w-[80%] mx-auto",
          "transition-all duration-300",
          "max-xl:gap-3",
          "max-lg:w-[90%] max-lg:grid-cols-3",
          "max-md:w-[95%] max-md:px-4 max-md:grid-cols-1 max-md:gap-3 max-md:mb-10",
          "max-sm:mb-8 max-sm:gap-2.5"
        )}>
          {[
            { icon: '/icon/user-round.svg', title: t('home.createStyleProfile'), onClick: handleCreateProfile },
            { icon: '/icon/file-search.svg', title: t('home.analyzeContent'), onClick: () => onViewChange('aistudio-editor', { createNew: true }) },
            { icon: '/icon/bar-chart.svg', title: t('home.trackStatistics'), onClick: () => onViewChange('history') }
          ].map((action, i) => (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-4 py-3 px-6 cursor-pointer",
                "bg-bg-secondary border border-border-light rounded-xl",
                "transition-all duration-200",
                "hover:shadow-md hover:border-border-hover hover:bg-bg-hover",
                "group",
                "max-xl:gap-3 max-xl:py-2.5 max-xl:px-4",
                "max-lg:flex-col max-lg:text-center max-lg:py-4 max-lg:px-3 max-lg:gap-2",
                "max-md:flex-row max-md:text-left max-md:py-3 max-md:px-4 max-md:gap-3",
                "max-sm:py-2.5 max-sm:px-3 max-sm:gap-2.5 max-sm:rounded-lg"
              )}
              onClick={action.onClick}
            >
              <div className={cn(
                "card-icon !w-12 !h-12 group-hover:scale-105 shrink-0 transition-transform duration-200",
                "max-xl:!w-10 max-xl:!h-10",
                "max-lg:!w-11 max-lg:!h-11",
                "max-sm:!w-9 max-sm:!h-9"
              )}>
                <img src={action.icon} alt="" className={cn(
                  "w-6 h-6 opacity-70 icon-invert group-hover:opacity-100",
                  "max-xl:w-5 max-xl:h-5",
                  "max-sm:w-4 max-sm:h-4"
                )} />
              </div>
              <h3 className={cn(
                "text-sm font-medium text-text-primary",
                "max-lg:text-xs max-lg:leading-tight",
                "max-sm:text-[11px]"
              )}>{action.title}</h3>
            </div>
          ))}
        </div>

        {/* What's New */}
        <div className={cn(
          "mb-14 w-[80%] mx-auto",
          "transition-all duration-300",
          "max-lg:w-[90%] max-lg:mb-10",
          "max-md:w-[95%] max-md:px-4 max-md:mb-8",
          "max-sm:mb-6"
        )}>
          <h3 className="text-xl font-normal text-text-primary mb-6 max-md:text-lg max-md:mb-4 max-sm:text-base max-sm:mb-3">
            {t('home.featuredFeatures')}
          </h3>
          <div className="grid grid-cols-2 gap-4 max-lg:gap-3 max-md:grid-cols-1 max-sm:gap-2.5">
            {[
              { icon: '/icon/fingerprint.svg', title: t('home.styleRefinement'), desc: t('home.styleRefinementDesc'), onClick: handleCreateProfile },
              { icon: '/icon/shield-check.svg', title: t('home.aiDetection'), desc: t('home.aiDetectionDesc'), onClick: () => onViewChange('aistudio-editor', { createNew: true }) },
              { icon: '/icon/wand-sparkles.svg', title: t('home.smartRewriting'), desc: t('home.smartRewritingDesc'), onClick: () => onViewChange('aistudio-editor', { createNew: true }) },
              { icon: '/icon/chart-line.svg', title: t('home.statisticalAnalysis'), desc: t('home.statisticalAnalysisDesc'), onClick: () => onViewChange('history') }
            ].map((item, i) => (
              <div 
                key={i}
                className={cn(
                  "flex gap-4 py-3.5 px-6 items-center cursor-pointer",
                  "bg-bg-secondary border border-border-light rounded-xl",
                  "transition-all duration-200",
                  "hover:shadow-md hover:border-border-hover hover:bg-bg-hover",
                  "group",
                  "max-xl:gap-3 max-xl:py-3 max-xl:px-4",
                  "max-md:py-3 max-md:px-4",
                  "max-sm:py-2.5 max-sm:px-3 max-sm:gap-2.5 max-sm:rounded-lg"
                )}
                onClick={item.onClick}
              >
                <div className={cn(
                  "card-icon !w-12 !h-12 shrink-0 group-hover:scale-105 transition-transform duration-200",
                  "max-xl:!w-10 max-xl:!h-10",
                  "max-sm:!w-9 max-sm:!h-9"
                )}>
                  <img src={item.icon} alt="" className={cn(
                    "w-6 h-6 opacity-70 icon-invert group-hover:opacity-100",
                    "max-xl:w-5 max-xl:h-5",
                    "max-sm:w-4 max-sm:h-4"
                  )} />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0 max-xl:gap-0.5 max-sm:gap-0">
                  <h4 className="text-sm font-medium text-text-primary m-0 max-xl:text-xs max-sm:text-[11px]">{item.title}</h4>
                  <p className={cn(
                    "text-sm text-text-muted leading-relaxed m-0",
                    "max-xl:text-xs max-xl:leading-snug",
                    "max-lg:line-clamp-2",
                    "max-sm:text-[10px] max-sm:leading-tight"
                  )}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Section */}
        <div className={cn(
          "min-h-52 mb-12",
          "w-[80%] mx-auto",
          "transition-all duration-300",
          "max-lg:w-[90%] max-lg:mb-10 max-lg:min-h-44",
          "max-md:w-[95%] max-md:px-4 max-md:mb-8 max-md:min-h-40",
          "max-sm:min-h-36 max-sm:mb-6"
        )}>
          <ProfileCarousel 
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onUseProfile={handleUseProfileFromCard}
            loading={loading}
          />
        </div>
      </div>

      {showDetailPopup && selectedProfile && (
        <ProfileDetailPopup
          profile={selectedProfile}
          onClose={() => setShowDetailPopup(false)}
          onUse={() => handleUseProfile(selectedProfile)}
        />
      )}
    </div>
  )
}

export default HomeView
