import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LottieAnimation from '../../Common/LottieAnimation'
import TextScramble from '../../Common/TextScramble'
import '../../Common/TextScramble.css'
import './EmptyProfileCard.css'

const EmptyProfileCard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  const phrases = [
    t('home.createUniqueStyle'),
    t('home.analyzeRefine'),
    t('home.protectStyle'),
    t('home.detectAI')
  ]

  useEffect(() => {
    // Switch phrase every 4.5 seconds (1.5s scramble + 3s display)
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [phrases.length])

  const handleCreateProfile = () => {
    navigate('/profile-setup')
  }

  return (
    <div className="empty-profile-section">
      <div className="empty-profile-card">
        <div className="empty-card-content">
          <div className="empty-card-left">
            <div className="empty-welcome">
              <h3 className="empty-welcome-title">
                {t('home.welcomeTo')}<br />
                <span className="app-name">{t('home.appName')}</span>
              </h3>
            </div>

            <div className="typing-container">
              <div className="typing-icon">
                <img src="/icon/fingerprint.svg" alt="Fingerprint" />
              </div>
              <p className="typing-text">
                <TextScramble 
                  key={currentPhraseIndex} 
                  className="text-scramble"
                >
                  {phrases[currentPhraseIndex]}
                </TextScramble>
              </p>
            </div>

            <button className="create-profile-btn" onClick={handleCreateProfile}>
              <img src="/icon/plus-circle.svg" alt={t('home.createFirstProfile')} />
              <span>{t('home.createFirstProfile')}</span>
              <img src="/icon/arrow-right.svg" alt="" className="arrow-icon" />
            </button>
          </div>

          <div className="empty-card-right">
            <div className="animation-container">
              <LottieAnimation 
                animationPath="/animation/FaceID.json"
                width="100%"
                height="100%"
                loop={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyProfileCard
