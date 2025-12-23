/**
 * Step 2: Long Text Input (Paste or Upload)
 * Migrated to Tailwind CSS v4
 */
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import LottieWrapper from '../LottieWrapper'
import biometricAnimation from '../../../animation/biometric-authentication.json'

import { CheckCircle, Edit2, FileText, Info } from 'lucide-react'
const Step2LongText = ({
  animationKey,
  hasPastedText,
  hasUploadedFiles,
  totalChunks,
  totalWords,
  onOpenPasteModal,
  onOpenUploadModal,
  onBack,
  onNext,
  hasLongText
}) => {
  const { t } = useTranslation()

  return (
    <div className="block animate-fade-in-slow h-[calc(100%-100px)] relative max-md:h-auto">
      <div className="grid grid-cols-2 h-full gap-0 relative min-h-0 overflow-hidden max-md:grid-cols-1 max-md:overflow-visible">
        {/* Animation Container - Hidden on tablet portrait */}
        <div className="flex items-center justify-center w-full h-full p-10 box-border bg-transparent max-md:hidden">
          <div className="!w-lottie-md !h-lottie-md max-w-full max-h-full max-md:!w-lottie-sm max-md:!h-lottie-sm filter-yellow-to-blue">
            <LottieWrapper key={`step2-${animationKey}`} animationData={biometricAnimation} loop={true} />
          </div>
        </div>
        
        {/* Compact Animation for tablet/mobile */}
        <div className="hidden max-md:flex items-center justify-center py-6 bg-transparent">
          <div className="!w-lottie-xs !h-lottie-xs filter-yellow-to-blue">
            <LottieWrapper key={`step2-mobile-${animationKey}`} animationData={biometricAnimation} loop={true} />
          </div>
        </div>
        
        {/* Form Container */}
        <div className="py-2.5 pl-0 pr-10 flex flex-col justify-between bg-transparent overflow-y-auto h-full relative scrollbar-hidden max-md:h-auto max-md:overflow-visible max-md:px-6 max-sm:px-5">
          <div className="w-[95%] max-md:w-full">
            <h1 className="text-2xl font-semibold text-gray-800 mb-3 leading-tight">
              {t('profileSetup.provideLongText')}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {t('profileSetup.pasteOrUpload')}
            </p>
          
            {/* Option Cards */}
            <div className="grid grid-cols-2 gap-5 mb-10 max-w-form max-md:grid-cols-1">
              {/* Paste Text Card */}
              <div 
                className={cn("bg-white/60 border border-gray-200 rounded-2xl py-8 px-6","cursor-pointer transition-all duration-200 relative overflow-hidden","hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-sm",
                  hasPastedText &&"border-text-link bg-white/75"
                )}
                onClick={onOpenPasteModal}
              >
                <div className="w-16 h-16 bg-text-link/15 rounded-2xl flex items-center justify-center mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="stroke-text-link" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('profileSetup.pasteText')}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{t('profileSetup.pasteArticles')}</p>
                </div>
                {hasPastedText && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-text-link rounded-full flex items-center justify-center animate-scale-in shadow-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Files Card */}
              <div 
                className={cn("bg-white/60 border border-gray-200 rounded-2xl py-8 px-6","cursor-pointer transition-all duration-200 relative overflow-hidden","hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-sm",
                  hasUploadedFiles &&"border-text-link bg-white/75"
                )}
                onClick={onOpenUploadModal}
              >
                <div className="w-16 h-16 bg-text-link/15 rounded-2xl flex items-center justify-center mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="stroke-text-link" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('profileSetup.uploadDocuments')}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{t('profileSetup.uploadFiles')}</p>
                </div>
                {hasUploadedFiles && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-text-link rounded-full flex items-center justify-center animate-scale-in shadow-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            {totalChunks > 0 ? (
              <div className={cn("flex items-center justify-between gap-4 py-3.5 px-4 pr-4","bg-bg-secondary rounded-xl border border-gray-200","mt-5 max-w-form animate-slide-in"
              )}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
                    <CheckCircle className="opacity-65" />
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-600">{t('profileSetup.saved')}:</span>
                    <span className="text-2xl font-bold text-gray-800 tracking-tight leading-none">{totalWords}</span>
                    <span className="text-sm font-medium text-gray-600">/ 5000 {t('common.words')}</span>
                    <span className="text-sm font-medium text-gray-600">({totalChunks} {t('profileSetup.sections')})</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {hasPastedText && (
                    <button 
                      className={cn("inline-flex items-center gap-1.5 py-2 px-3.5","bg-white border border-gray-300 rounded-lg","text-sm font-medium text-gray-600","cursor-pointer transition-all duration-200","hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
                      )}
                      onClick={onOpenPasteModal}
                      data-tooltip={t('profileSetup.viewEditPastedText')}
                    >
                      <Edit2 />
                      <span>{t('profileSetup.editText')}</span>
                    </button>
                  )}
                  {hasUploadedFiles && (
                    <button 
                      className={cn("inline-flex items-center gap-1.5 py-2 px-3.5","bg-white border border-gray-300 rounded-lg","text-sm font-medium text-gray-600","cursor-pointer transition-all duration-200","hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
                      )}
                      onClick={onOpenUploadModal}
                      data-tooltip={t('profileSetup.viewManageFiles')}
                    >
                      <FileText />
                      <span>{t('profileSetup.manageFiles')}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={cn("flex items-center gap-3 py-3.5 px-4","bg-bg-secondary rounded-xl border border-gray-200","mt-5 max-w-form"
              )}>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
                  <Info className="opacity-65" />
                </div>
                <span className="text-sm text-gray-600">{t('profileSetup.provide1000to5000')}</span>
              </div>
            )}

          </div>
          
          {/* Button Group - Fixed at bottom */}
          <div className="flex gap-3 justify-end pt-6 pb-4 w-[95%] max-md:w-full max-sm:flex-col-reverse shrink-0">
              <button 
                className={cn("py-3 px-7 text-md font-semibold border border-transparent rounded-lg","cursor-pointer transition-all duration-200 inline-flex items-center gap-2","bg-gray-100 text-gray-700 border-gray-200","hover:bg-gray-200 hover:border-gray-400","max-sm:w-full max-sm:justify-center"
                )}
                onClick={onBack}
              >
                {t('common.back')}
              </button>
              <button 
                className={cn("py-3 px-7 text-md font-semibold border border-transparent rounded-lg","cursor-pointer transition-all duration-200 inline-flex items-center gap-2","bg-text-link text-white border-text-link","hover:enabled:bg-primary hover:enabled:border-primary","hover:enabled:-translate-y-px hover:enabled:shadow-md","disabled:opacity-50 disabled:cursor-not-allowed","max-sm:w-full max-sm:justify-center"
                )}
                disabled={!hasLongText}
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

export default Step2LongText
