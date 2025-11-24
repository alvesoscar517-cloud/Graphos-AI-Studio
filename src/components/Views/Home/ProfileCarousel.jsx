import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import ProfileCard from './ProfileCard'
import EmptyProfileCard from './EmptyProfileCard'
import threeDotsAnimation from '../../../animation/Three dots loading.json'
import './ProfileCarousel.css'

const ProfileCarousel = ({ profiles, onSelectProfile, onUseProfile, loading }) => {
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
        <h3 className="section-title">Hồ sơ văn phong của bạn</h3>
        {!loading && (
          <div className="profile-showcase-actions">
            <button 
              className="profile-nav-btn" 
              onClick={handlePrev}
              disabled={!canGoPrev}
            >
              <img src="/icon/chevron-left.svg" alt="Previous" />
            </button>
            <button 
              className="profile-nav-btn" 
              onClick={handleNext}
              disabled={!canGoNext}
            >
              <img src="/icon/chevron-right.svg" alt="Next" />
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
