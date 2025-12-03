import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LottieAnimation from '../../Common/LottieAnimation'
import TextScramble from '../../Common/TextScramble'
import { cn } from '../../../lib/utils'

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
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [phrases.length])

  const handleCreateProfile = () => {
    navigate('/profile-setup')
  }

  return (
    <div className="w-full">
      <div className={cn(
        "bg-bg-secondary border border-border-light rounded-2xl",
        "p-8 overflow-hidden"
      )}>
        <div className="flex items-center gap-4 max-md:flex-col">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h3 className="text-2xl font-normal text-text-primary leading-tight">
                {t('home.welcomeTo')}<br />
                <span className="font-medium text-accent">{t('home.appName')}</span>
              </h3>
            </div>

            <div className="empty-profile-text-container flex items-center gap-3 mb-6 py-3 px-5 bg-fill-tertiary rounded-xl max-w-full">
              <div className="card-icon !w-11 !h-11 shrink-0">
                <img src="/icon/fingerprint.svg" alt="Fingerprint" className="w-5 h-5 opacity-70 icon-invert" />
              </div>
              <p className="text-base text-text-muted m-0 min-h-[24px] flex-1">
                <TextScramble 
                  key={currentPhraseIndex} 
                  className="inline-block !bg-transparent"
                >
                  {phrases[currentPhraseIndex]}
                </TextScramble>
              </p>
            </div>

            <button 
              className={cn(
                "flex items-center gap-2 py-3 px-5 rounded-xl",
                "bg-accent text-white border-none",
                "text-sm font-medium cursor-pointer",
                "transition-all duration-200",
                "hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg"
              )}
              onClick={handleCreateProfile}
            >
              <img src="/icon/plus-circle.svg" alt="" className="w-5 h-5 invert" />
              <span>{t('home.createFirstProfile')}</span>
              <img src="/icon/arrow-right.svg" alt="" className="w-4 h-4 invert ml-1" />
            </button>
          </div>

          {/* Right Animation */}
          <div className={cn(
            "empty-profile-animation",
            "w-48 h-48 shrink-0 max-md:w-36 max-md:h-36",
            "flex items-center justify-center",
            "bg-fill-tertiary rounded-3xl p-6"
          )}>
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
  )
}

export default EmptyProfileCard
