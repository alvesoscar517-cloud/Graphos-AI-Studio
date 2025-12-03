/**
 * Step 3: Short Text Samples
 * Migrated to Tailwind CSS v4
 */
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import LottieWrapper from '../LottieWrapper'
import contactMailAnimation from '../../../animation/contact-mail.json'

const Step3ShortSamples = ({
  animationKey,
  shortText,
  setShortText,
  samples,
  shortTextWordCount,
  currentSampleIndex,
  setCurrentSampleIndex,
  isEditingMode,
  setIsEditingMode,
  onAddSample,
  onNavigateSample,
  onBack,
  onNext,
  MIN_SAMPLES,
  MAX_SAMPLES,
  MIN_SAMPLE_WORDS,
  MAX_SAMPLE_WORDS
}) => {
  const { t } = useTranslation()
  const canAddMore = !isEditingMode && samples.length < MAX_SAMPLES
  const isValidWordCount = shortTextWordCount >= MIN_SAMPLE_WORDS && shortTextWordCount <= MAX_SAMPLE_WORDS

  return (
    <div className="block animate-fade-in-slow h-[calc(100%-100px)] relative">
      <div className="grid grid-cols-2 h-full gap-0 relative min-h-0 overflow-hidden max-lg:grid-cols-1">
        {/* Animation Container */}
        <div className="flex items-center justify-center w-full h-full p-10 box-border bg-transparent">
          <div className="!w-lottie-md !h-lottie-md max-w-full max-h-full max-lg:!w-lottie-sm max-lg:!h-lottie-sm">
            <LottieWrapper key={`step3-${animationKey}`} animationData={contactMailAnimation} loop={true} />
          </div>
        </div>
        
        {/* Form Container */}
        <div className="py-2.5 pl-0 pr-10 flex flex-col justify-between bg-transparent overflow-y-auto h-full relative scrollbar-hidden max-md:px-5">
          <div className="w-[95%] max-lg:w-full">
            <h1 className="text-2xl font-semibold text-gray-800 mb-3 leading-tight">
              {t('profileSetup.provideShortSamples')}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {t('profileSetup.provideShortSamples')} ({MIN_SAMPLE_WORDS}-{MAX_SAMPLE_WORDS} {t('common.words')})
            </p>
            
            {/* Textarea Container */}
            <div className="relative mb-6 w-full max-w-form">
              <textarea
                id="shortText"
                placeholder={samples.length >= MAX_SAMPLES && !isEditingMode 
                  ? `${t('profile.selected')} ${MAX_SAMPLES} ${t('common.samples')}` 
                  : t('profileSetup.pasteYourText')}
                rows="8"
                value={shortText}
                onChange={(e) => setShortText(e.target.value)}
                disabled={samples.length >= MAX_SAMPLES && !isEditingMode}
                className={cn(
                  "w-full max-w-form py-4 px-4 text-md",
                  "border border-gray-200 rounded-xl font-sans resize-none",
                  "transition-all duration-200 bg-white/70 leading-relaxed scrollbar-hidden",
                  "focus:outline-none focus:border-gray-400 focus:bg-white",
                  "disabled:bg-bg-hover disabled:cursor-not-allowed"
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 justify-end">
                {isEditingMode && (
                  <button 
                    className={cn(
                      "py-2.5 px-5 text-sm font-semibold border border-transparent rounded-lg",
                      "cursor-pointer transition-all duration-200 inline-flex items-center gap-2",
                      "bg-gray-100 text-gray-700 border-gray-200",
                      "hover:bg-gray-200 hover:border-gray-400"
                    )}
                    onClick={() => {
                      setShortText('')
                      setIsEditingMode(false)
                      setCurrentSampleIndex(-1)
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    {t('common.cancel')}
                  </button>
                )}
                <button 
                  className={cn(
                    "py-2.5 px-5 text-sm font-semibold border border-transparent rounded-lg",
                    "cursor-pointer transition-all duration-200 inline-flex items-center gap-2",
                    "bg-text-link text-white border-text-link",
                    "hover:enabled:bg-primary hover:enabled:border-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  disabled={!shortText.trim() || !canAddMore && !isEditingMode || !isValidWordCount}
                  onClick={onAddSample}
                >
                  {isEditingMode ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {t('common.save')}
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {samples.length >= MAX_SAMPLES ? `${t('common.done')} ${MAX_SAMPLES}` : t('common.submit')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sample Progress */}
            <div className={cn(
              "flex items-center gap-4 py-4 px-5",
              "bg-bg-secondary rounded-xl border border-gray-200",
              "max-w-form"
            )}>
              <button 
                className={cn(
                  "w-10 h-10 rounded-full bg-white border border-gray-300",
                  "flex items-center justify-center cursor-pointer transition-all duration-200",
                  "hover:enabled:bg-gray-100 hover:enabled:border-gray-400",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                onClick={() => onNavigateSample('prev')}
                disabled={samples.length === 0}
                title={t('profileSetup.viewPreviousSample')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm font-medium text-gray-700">
                  {isEditingMode ? (
                    <>{t('profileSetup.viewing')}: <span className="font-bold text-text-link">#{currentSampleIndex + 1}</span> / {samples.length}</>
                  ) : (
                    <>{t('profileSetup.progress')}: <span className="font-bold text-text-link">{samples.length}</span> / {MIN_SAMPLES}</>
                  )}
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: Math.max(MIN_SAMPLES, samples.length) }, (_, i) => i).map(i => (
                    <button 
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                        "cursor-pointer transition-all duration-200",
                        i < samples.length 
                          ? "bg-text-link border-text-link text-white" 
                          : "bg-white border-gray-300 text-gray-500",
                        isEditingMode && i === currentSampleIndex && "ring-2 ring-text-link ring-offset-2",
                        "disabled:cursor-not-allowed"
                      )}
                      disabled={i >= samples.length}
                      onClick={() => {
                        if (i < samples.length) {
                          setCurrentSampleIndex(i)
                          setShortText(samples[i])
                          setIsEditingMode(true)
                        }
                      }}
                      title={i < samples.length ? `#${i + 1}` : ''}
                    >
                      {isEditingMode && i === currentSampleIndex ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : i < samples.length ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{i + 1}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className={cn(
                  "w-10 h-10 rounded-full bg-white border border-gray-300",
                  "flex items-center justify-center cursor-pointer transition-all duration-200",
                  "hover:enabled:bg-gray-100 hover:enabled:border-gray-400",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                onClick={() => onNavigateSample('next')}
                disabled={samples.length === 0}
                title={t('profileSetup.viewNextSample')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

          </div>
          
          {/* Button Group - Fixed at bottom */}
          <div className="flex gap-3 justify-end pt-6 pb-4 w-[95%] max-lg:w-full max-sm:flex-col-reverse shrink-0">
              <button 
                className={cn(
                  "py-3 px-7 text-md font-semibold border border-transparent rounded-lg",
                  "cursor-pointer transition-all duration-200 inline-flex items-center gap-2",
                  "bg-gray-100 text-gray-700 border-gray-200",
                  "hover:bg-gray-200 hover:border-gray-400",
                  "max-sm:w-full max-sm:justify-center"
                )}
                onClick={onBack}
              >
                {t('common.back')}
              </button>
              <button 
                className={cn(
                  "py-3 px-7 text-md font-semibold border border-transparent rounded-lg",
                  "cursor-pointer transition-all duration-200 inline-flex items-center gap-2",
                  "bg-text-link text-white border-text-link",
                  "hover:enabled:bg-primary hover:enabled:border-primary",
                  "hover:enabled:-translate-y-px hover:enabled:shadow-md",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "max-sm:w-full max-sm:justify-center"
                )}
                disabled={samples.length < MIN_SAMPLES}
                onClick={onNext}
              >
                {t('common.next')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3ShortSamples
