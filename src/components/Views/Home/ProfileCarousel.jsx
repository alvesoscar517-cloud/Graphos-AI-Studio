import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LazyLottie from '../../Common/LazyLottie'
import ProfileCard from './ProfileCard'
import EmptyProfileCard from './EmptyProfileCard'
import threeDotsAnimation from '../../../animation/Three dots loading.json'
import { cn } from '../../../lib/utils'

const ProfileCarousel = ({ profiles, onSelectProfile, onUseProfile, loading }) => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(profiles.length - 3, prev + 1))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < profiles.length - 3

  return (
    <div className="w-full box-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-medium text-text-primary m-0">
          {t('home.yourProfiles')}
        </h3>
        {!loading && (
          <div className="flex gap-2">
            <button 
              className={cn(
                "w-10 h-10 rounded-full border border-border-light",
                "bg-bg-secondary cursor-pointer",
                "flex items-center justify-center transition-all duration-200",
                "shadow-sm",
                "hover:bg-bg-tertiary hover:border-border-hover hover:scale-105 hover:shadow-md",
                "active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              )}
              onClick={handlePrev}
              disabled={!canGoPrev}
              data-tooltip={t('common.previous')}
              data-tooltip-position="bottom"
            >
              <img src="/icon/chevron-left.svg" alt={t('common.previous')} className="w-5 h-5 opacity-70 icon-invert" />
            </button>
            <button 
              className={cn(
                "w-10 h-10 rounded-full border border-border-light",
                "bg-bg-secondary cursor-pointer",
                "flex items-center justify-center transition-all duration-200",
                "shadow-sm",
                "hover:bg-bg-tertiary hover:border-border-hover hover:scale-105 hover:shadow-md",
                "active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              )}
              onClick={handleNext}
              disabled={!canGoNext}
              data-tooltip={t('common.next')}
              data-tooltip-position="bottom"
            >
              <img src="/icon/chevron-right.svg" alt={t('common.next')} className="w-5 h-5 opacity-70 icon-invert" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] py-10">
          <LazyLottie 
            animationData={threeDotsAnimation} 
            loop={true}
            style={{ width: 80, height: 40 }}
          />
        </div>
      ) : profiles.length === 0 ? (
        <EmptyProfileCard />
      ) : (
        <div className="relative overflow-hidden p-0">
          <div 
            className="flex gap-5 transition-transform duration-400 ease-smooth will-change-transform"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / 3)}%)`
            }}
          >
            {profiles.map(profile => (
              <ProfileCard 
                key={profile.profile_id}
                profile={profile}
                onSelect={onSelectProfile}
                onUse={onUseProfile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileCarousel
