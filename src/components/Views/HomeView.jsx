import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { loadProfiles, getProfileDetails } from '../../services/api'
import { getCachedProfiles, setCachedProfiles, checkCacheInvalidation } from '../../utils/profileCache'
import { getCachedProfileDetail, setCachedProfileDetail } from '../../utils/profileDetailCache'
import ProfileCarousel from './Home/ProfileCarousel'
import ProfileDetailPopup from '../Popups/ProfileDetailPopup'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const HomeView = ({ onToggleLeftSidebar, onViewChange }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showDetailPopup, setShowDetailPopup] = useState(false)
  
  useEffect(() => {
    loadProfilesData()
  }, [])

  const loadProfilesData = async () => {
    try {
      checkCacheInvalidation()
      const cached = getCachedProfiles()
      if (cached) {
        setProfiles(cached)
        setLoading(false)
        return
      }
      setLoading(true)
      const data = await loadProfiles()
      setProfiles(data)
      setCachedProfiles(data)
    } catch (error) {
      console.error('Error loading profiles:', error)
      modal.error(t('home.unableToLoadProfiles'))
    } finally {
      setLoading(false)
    }
  }

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
    localStorage.setItem('activeProfileId', profile.profile_id)
    localStorage.setItem('activeProfileName', profile.profile_name)
    modal.toast(t('home.profileSelected'), profile.profile_name, 'success')
    setShowDetailPopup(false)
    onViewChange('aistudio-editor', { createNew: true })
  }

  const handleUseProfileFromCard = (profile) => {
    localStorage.setItem('activeProfileId', profile.profile_id)
    localStorage.setItem('activeProfileName', profile.profile_name)
    modal.toast(t('home.profileSelected'), profile.profile_name, 'success')
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
          "max-lg:w-[90%] max-md:w-[95%] max-md:px-4"
        )}>
          <h2 className="text-4xl font-normal text-text-primary mb-0">
            <span className="font-bold">Graphos</span> AI Studio
          </h2>
          <p className="text-sm text-text-muted font-normal mb-0 flex items-center justify-between gap-4 leading-relaxed">
            <span>{t('home.heroSubtitle')}</span>
            <button 
              className={cn(
                "flex items-center gap-2 bg-transparent border border-border-light",
                "py-1 px-4 rounded-pill cursor-pointer text-sm text-text-primary font-medium",
                "ml-auto shrink-0 h-fit leading-relaxed transition-all duration-200",
                "hover:bg-bg-secondary hover:shadow-sm"
              )}
              onClick={handleCreateProfile}
            >
              <img src="/icon/plus.svg" alt="Plus" className="w-icon-lg h-icon-lg opacity-80 icon-invert" />
              <span>{t('home.newProfile')}</span>
            </button>
          </p>
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "grid grid-cols-3 gap-4 mb-14",
          "w-[80%] mx-auto",
          "max-lg:w-[90%] max-lg:grid-cols-2",
          "max-md:w-[95%] max-md:px-4 max-md:grid-cols-1 max-md:gap-3"
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
                "group"
              )}
              onClick={action.onClick}
            >
              <div className="card-icon !w-12 !h-12 group-hover:scale-105">
                <img src={action.icon} alt="" className="w-6 h-6 opacity-70 icon-invert group-hover:opacity-100" />
              </div>
              <h3 className="text-sm font-medium text-text-primary">{action.title}</h3>
            </div>
          ))}
        </div>

        {/* What's New */}
        <div className={cn(
          "mb-14 w-[80%] mx-auto",
          "max-lg:w-[90%] max-md:w-[95%] max-md:px-4"
        )}>
          <h3 className="text-xl font-normal text-text-primary mb-6">
            {t('home.featuredFeatures')}
          </h3>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
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
                  "group"
                )}
                onClick={item.onClick}
              >
                <div className="card-icon !w-12 !h-12 shrink-0 group-hover:scale-105">
                  <img src={item.icon} alt="" className="w-6 h-6 opacity-70 icon-invert group-hover:opacity-100" />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary m-0">{item.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed m-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Section */}
        <div className={cn(
          "min-h-52 mb-12",
          "w-[80%] mx-auto",
          "max-lg:w-[90%] max-md:w-[95%] max-md:px-4"
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
