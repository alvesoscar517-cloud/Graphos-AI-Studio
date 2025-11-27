import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Lottie from 'lottie-react'
import ProfileCard from './ProfileCard'
import EmptyProfileCard from './EmptyProfileCard'
import threeDotsAnimation from '../../../animation/Three dots loading.json'
import './ProfileCarousel.css'

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
    <div className="profile-showcase">
      <div className="profile-showcase-header">
        <h3 className="section-title">{t('home.yourProfiles')}</h3>
        {!loading && (
          <div className="profile-showcase-actions">
            <button 
              className="profile-nav-btn" 
              onClick={handlePrev}
              disabled={!canGoPrev}
              data-tooltip={t('common.previous')}
              data-tooltip-position="bottom"
            >
              <img src="/icon/chevron-left.svg" alt={t('common.previous')} />
            </button>
            <button 
              className="profile-nav-btn" 
              onClick={handleNext}
              disabled={!canGoNext}
              data-tooltip={t('common.next')}
              data-tooltip-position="bottom"
            >
              <img src="/icon/chevron-right.svg" alt={t('common.next')} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="profile-carousel-loading">
          <Lottie 
            animationData={threeDotsAnimation} 
            loop={true}
            style={{ width: 80, height: 40 }}
          />
        </div>
      ) : profiles.length === 0 ? (
        <EmptyProfileCard />
      ) : (
        <div className="profile-carousel-container">
          <div 
            className="profile-carousel"
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
