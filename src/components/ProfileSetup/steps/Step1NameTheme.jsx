/**
 * Step 1: Profile Name and Theme Selection
 * Migrated to Tailwind CSS v4
 */
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import { Icon } from '../../Common'
import LottieWrapper from '../LottieWrapper'
import { THEMES } from '../hooks/useProfileSetup'
import loaderCatAnimation from '../../../animation/loader-cat.json'

const Step1NameTheme = ({
  animationKey,
  profileName,
  setProfileName,
  selectedTheme,
  setSelectedTheme,
  onNext,
  onCancel,
  isCancelling
}) => {
  const { t } = useTranslation()

  return (
    <div className="block animate-fade-in-slow h-[calc(100%-100px)] relative">
      <div className="grid grid-cols-2 h-full gap-0 relative min-h-0 overflow-hidden max-lg:grid-cols-1">
        {/* Animation Container */}
        <div className="flex items-center justify-center w-full h-full p-10 box-border bg-transparent">
          <div className="!w-lottie-md !h-lottie-md max-w-full max-h-full max-lg:!w-lottie-sm max-lg:!h-lottie-sm">
            <LottieWrapper key={`step1-${animationKey}`} animationData={loaderCatAnimation} loop={true} />
          </div>
        </div>
        
        {/* Form Container */}
        <div className="py-2.5 pl-0 pr-10 flex flex-col justify-between bg-transparent overflow-y-auto h-full relative scrollbar-hidden max-md:px-5">
          <div className="w-[95%] max-lg:w-full">
            <h1 className="text-2xl font-semibold text-gray-800 mb-3 leading-tight">
              {t('profileSetup.startRefining')}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {t('profileSetup.setEasyName')}
            </p>

            {/* Profile Name Input */}
            <div className="mb-5 max-w-form">
              <label htmlFor="profileName" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profileSetup.profileName')}
              </label>
              <input
                type="text"
                id="profileName"
                placeholder={t('profileSetup.exampleName')}
                maxLength="50"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={cn(
                  "w-full max-w-form py-3 px-4 text-md",
                  "border border-input-border rounded-lg",
                  "transition-all duration-300 font-sans",
                  "focus:outline-none focus:border-black/15 focus:shadow-input-focus"
                )}
              />
              <div className="text-sm text-text-muted mt-1.5">
                {t('profileSetup.maxCharacters')}
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="mb-5 max-w-form">
              <label id="theme-label" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('common.select')}
              </label>
              <div 
                className="mt-2 w-[calc(100%-4px)]"
                role="radiogroup"
                aria-labelledby="theme-label"
              >
                <div className="grid grid-cols-4 gap-2.5 max-sm:grid-cols-2">
                  {THEMES.map((theme, index) => (
                    <button
                      key={theme.id}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-4 px-2.5",
                        "aspect-square bg-white/50 border border-black/8 rounded-xl",
                        "cursor-pointer transition-all duration-250 relative overflow-hidden",
                        selectedTheme === theme.id 
                          ? "!border-text-link shadow-md" 
                          : "hover:bg-white/70 hover:border-black/12 hover:-translate-y-px hover:shadow-sm"
                      )}
                      data-theme={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      role="radio"
                      aria-checked={selectedTheme === theme.id}
                      aria-label={`${t('common.select')} ${t(`themes.${theme.id}`)}`}
                      tabIndex={selectedTheme === theme.id ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault()
                          const nextIndex = (index + 1) % THEMES.length
                          setSelectedTheme(THEMES[nextIndex].id)
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          e.preventDefault()
                          const prevIndex = (index - 1 + THEMES.length) % THEMES.length
                          setSelectedTheme(THEMES[prevIndex].id)
                        }
                      }}
                    >
                      <Icon 
                        name={theme.icon}
                        size="xl"
                        color="primary"
                        className={cn(
                          "!w-7 !h-7 transition-all duration-250 opacity-70",
                          "group-hover:opacity-85 group-hover:scale-[1.04]",
                          selectedTheme === theme.id && "opacity-100 scale-[1.08]"
                        )}
                      />
                      <span className={cn(
                        "text-xs font-medium text-text-secondary text-center transition-all duration-250",
                        "tracking-tight leading-tight",
                        selectedTheme === theme.id && "text-text-link font-semibold"
                      )}>
                        {t(`themes.${theme.id}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
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
                onClick={onCancel}
                disabled={isCancelling}
              >
                {t('common.cancel')}
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
                disabled={!profileName.trim() || isCancelling}
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

export default Step1NameTheme
