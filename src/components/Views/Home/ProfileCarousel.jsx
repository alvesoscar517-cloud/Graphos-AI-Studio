// @ts-nocheck
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileCard from './ProfileCard'
import EmptyProfileCard from './EmptyProfileCard'
import { SkeletonProfileCard } from '../../ui/skeleton'
import { cn } from '../../../lib/utils'

// Breakpoints for responsive carousel
const BREAKPOINT_SM = 640
const BREAKPOINT_MD = 768
const BREAKPOINT_LG = 1024

const ProfileCarousel = ({ profiles, onSelectProfile, onUseProfile, loading }) => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingProfileId, setLoadingProfileId] = useState(null)
  const [visibleCards, setVisibleCards] = useState(3)
  const [isResizing, setIsResizing] = useState(false)

  // Detect screen size and adjust visible cards with debounce for smooth transition
  useEffect(() => {
    let resizeTimeout
    
    const updateVisibleCards = () => {
      const width = window.innerWidth
      let newVisibleCards
      
      if (width < BREAKPOINT_SM) {
        newVisibleCards = 1
      } else if (width < BREAKPOINT_MD) {
        newVisibleCards = 1
      } else if (width < BREAKPOINT_LG) {
        newVisibleCards = 2
      } else {
        newVisibleCards = 3
      }
      
      if (newVisibleCards !== visibleCards) {
        setIsResizing(true)
        setVisibleCards(newVisibleCards)
        // Reset resizing state after transition completes
        setTimeout(() => setIsResizing(false), 350)
      }
    }
    
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateVisibleCards, 100)
    }
    
    updateVisibleCards()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [visibleCards])

  // Reset currentIndex when visibleCards changes to prevent overflow
  useEffect(() => {
    const maxIndex = Math.max(0, profiles.length - visibleCards)
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [visibleCards, profiles.length, currentIndex])

  const handleSelectProfile = async (profile) => {
    setLoadingProfileId(profile.profile_id)
    try {
      await onSelectProfile(profile)
    } finally {
      setLoadingProfileId(null)
    }
  }

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(profiles.length - visibleCards, prev + 1))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < profiles.length - visibleCards

  return (
    <div className="w-full box-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 max-md:mb-4">
        <h3 className="text-xl font-medium text-text-primary m-0 max-md:text-lg">
          {t('home.yourProfiles')}
        </h3>
        {!loading && profiles.length > visibleCards && (
          <div className="flex gap-2">
            <button 
              className={cn(
                "w-10 h-10 rounded-full border border-border-light",
                "bg-bg-secondary cursor-pointer",
                "flex items-center justify-center transition-all duration-200",
                "shadow-sm",
                "hover:bg-bg-tertiary hover:border-border-hover hover:scale-105 hover:shadow-md",
                "active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none",
                "max-md:w-9 max-md:h-9"
              )}
              onClick={handlePrev}
              disabled={!canGoPrev}
              data-tooltip={t('common.previous')}
              data-tooltip-position="bottom"
            >
              <img src="/icon/chevron-left.svg" alt={t('common.previous')} className="w-5 h-5 opacity-70 icon-invert max-md:w-4 max-md:h-4" />
            </button>
            <button 
              className={cn(
                "w-10 h-10 rounded-full border border-border-light",
                "bg-bg-secondary cursor-pointer",
                "flex items-center justify-center transition-all duration-200",
                "shadow-sm",
                "hover:bg-bg-tertiary hover:border-border-hover hover:scale-105 hover:shadow-md",
                "active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none",
                "max-md:w-9 max-md:h-9"
              )}
              onClick={handleNext}
              disabled={!canGoNext}
              data-tooltip={t('common.next')}
              data-tooltip-position="bottom"
            >
              <img src="/icon/chevron-right.svg" alt={t('common.next')} className="w-5 h-5 opacity-70 icon-invert max-md:w-4 max-md:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex gap-5 max-lg:gap-4 max-md:gap-3 overflow-hidden">
          {Array.from({ length: visibleCards }).map((_, i) => (
            <SkeletonProfileCard 
              key={i} 
              style={{ 
                flex: visibleCards === 1 
                  ? '0 0 100%' 
                  : visibleCards === 2 
                    ? '0 0 calc(50% - 10px)' 
                    : '0 0 calc(33.333% - 13.33px)'
              }}
            />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <EmptyProfileCard />
      ) : (
        <div className="relative overflow-visible">
          <div 
            className={cn(
              "flex gap-5 will-change-transform pb-2",
              "max-lg:gap-4 max-md:gap-3",
              isResizing ? "transition-none" : "transition-transform duration-400 ease-smooth"
            )}
            style={{ 
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              transition: isResizing ? 'none' : undefined
            }}
          >
            {profiles.map(profile => (
              <ProfileCard 
                key={profile.profile_id}
                profile={profile}
                onSelect={handleSelectProfile}
                onUse={onUseProfile}
                isLoading={loadingProfileId === profile.profile_id}
                visibleCards={visibleCards}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileCarousel
