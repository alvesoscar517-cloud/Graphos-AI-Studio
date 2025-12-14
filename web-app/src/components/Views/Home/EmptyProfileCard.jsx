import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LottieAnimation from '../../Common/LottieAnimation'
import TextScramble from '../../Common/TextScramble'
import { cn } from '../../../lib/utils'

const EmptyProfileCard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [scrambleKey, setScrambleKey] = useState(0)
  const resizeTimeoutRef = useRef(null)

  const phrases = [
    t('home.createUniqueStyle'),
    t('home.analyzeRefine'),
    t('home.protectStyle'),
    t('home.detectAI')
  ]

  // Handle resize - debounce and reset scramble animation
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    resizeTimeoutRef.current = setTimeout(() => {
      // Reset scramble animation after resize stabilizes
      setScrambleKey(prev => prev + 1)
    }, 300)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [handleResize])

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
        "px-8 py-8 overflow-hidden transition-all duration-300",
        "max-lg:px-6 max-lg:py-6 max-md:px-5 max-md:py-5 max-sm:px-4 max-sm:py-4"
      )}>
        <div className="flex items-center gap-6 max-lg:gap-4 max-md:flex-col max-md:text-center">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 max-md:mb-4 max-sm:mb-3">
              <h3 className={cn(
                "text-2xl font-normal text-text-primary leading-tight",
                "max-lg:text-xl max-md:text-lg max-sm:text-base"
              )}>
                {t('home.welcomeTo')}<br />
                <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"><span className="font-bold">Graphos</span> AI Studio</span>
              </h3>
            </div>

            <div className={cn(
              "inline-flex items-center gap-3 mb-6",
              "max-lg:gap-2.5 max-md:flex-col max-md:mb-4 max-sm:mb-3"
            )}>
              <div className={cn(
                "card-icon !w-11 !h-11 shrink-0 transition-all duration-200",
                "max-lg:!w-10 max-lg:!h-10 max-sm:!w-9 max-sm:!h-9"
              )}>
                <img src="/icon/fingerprint.svg" alt="Fingerprint" className="w-5 h-5 opacity-70 icon-invert max-lg:w-4 max-lg:h-4 max-sm:w-3.5 max-sm:h-3.5" />
              </div>
              <div className="bg-fill-tertiary rounded-xl px-4 py-2.5 max-lg:px-3 max-lg:py-2 max-sm:px-2.5 max-sm:py-1.5">
                <p className={cn(
                  "text-lg text-text-muted m-0 min-h-[1.5em] whitespace-nowrap",
                  "max-lg:text-base max-md:text-sm max-sm:text-xs",
                  "max-md:whitespace-normal max-md:text-center"
                )}>
                  <TextScramble key={`${currentPhraseIndex}-${scrambleKey}`}>
                    {phrases[currentPhraseIndex]}
                  </TextScramble>
                </p>
              </div>
            </div>

            <div className="max-md:flex max-md:justify-center">
              <button 
                className={cn(
                  "inline-flex items-center gap-2 py-3 px-5 rounded-xl",
                  "bg-accent text-white border-none",
                  "text-sm font-medium cursor-pointer",
                  "transition-all duration-200",
                  "hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg",
                  "max-lg:py-2.5 max-lg:px-4 max-lg:text-[13px]",
                  "max-sm:py-2 max-sm:px-3 max-sm:text-xs max-sm:gap-1.5"
                )}
                onClick={handleCreateProfile}
              >
                <img src="/icon/plus-circle.svg" alt="" className="w-5 h-5 invert max-lg:w-4 max-lg:h-4 max-sm:w-3.5 max-sm:h-3.5" />
                <span className="whitespace-nowrap">{t('home.createFirstProfile')}</span>
                <img src="/icon/arrow-right.svg" alt="" className="w-4 h-4 invert ml-1 max-lg:w-3.5 max-lg:h-3.5 max-sm:w-3 max-sm:h-3" />
              </button>
            </div>
          </div>

          {/* Right Animation - responsive sizing */}
          <div className={cn(
            "empty-profile-animation",
            "shrink-0",
            "flex items-center justify-center",
            "bg-fill-tertiary rounded-3xl p-6 transition-all duration-300",
            "max-lg:p-4 max-lg:rounded-2xl",
            "max-md:p-5 max-md:w-full max-md:max-w-[200px]",
            "max-sm:p-4 max-sm:max-w-[160px] max-sm:rounded-xl"
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
