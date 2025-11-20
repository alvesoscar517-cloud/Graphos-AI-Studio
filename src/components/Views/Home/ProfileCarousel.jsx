import { useState, useEffect } from 'react'
import ProfileCard from './ProfileCard'
import EmptyProfileCard from './EmptyProfileCard'
import './ProfileCarousel.css'

const ProfileCarousel = ({ profiles, onSelectProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(profiles.length - 3, prev + 1))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < profiles.length - 3

  if (profiles.length === 0) {
    return <EmptyProfileCard />
  }

  return (
    <div className="profile-showcase">
      <div className="profile-showcase-header">
        <h3 className="section-title">Hồ sơ văn phong của bạn</h3>
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
      </div>

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
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileCarousel
