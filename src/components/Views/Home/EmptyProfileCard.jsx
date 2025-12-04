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
                <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"><span className="font-bold">Graphos</span> AI Studio</span>
              </h3>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="card-icon !w-11 !h-11 shrink-0">
                <img src="/icon/fingerprint.svg" alt="Fingerprint" className="w-5 h-5 opacity-70 icon-invert" />
              </div>
              <div className="bg-fill-tertiary rounded-xl px-4 py-2.5">
                <p className="text-lg text-text-muted m-0">
                  <TextScramble key={currentPhraseIndex}>
                    {phrases[currentPhraseIndex]}
                  </TextScramble>
                </p>
              </div>
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

          {/* Right Animation - shifted left via CSS */}
          <div className={cn(
            "empty-profile-animation",
            "shrink-0",
            "flex items-center justify-center",
            "bg-fill-tertiary rounded-3xl p-6"
          )}>
            <LottieAnimation 
              animationPath="/animation/FaceID.json"
              loop={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyProfileCard
