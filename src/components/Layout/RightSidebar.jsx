// @ts-nocheck
import { logger } from '@/utils/logger'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotes } from '../../contexts/NotesContext'
import { useProfiles } from '../../contexts/ProfileContext'
import { useRewrite, useAIProcessingActions, useAIProcessing } from '@/stores'
import { rewriteTextStream, startIterativeHumanize, pollAndStreamHumanizeJob } from '../../services/api'
import { getLocalizedContentError } from '../../utils/errorMessages'
import { handleCreditError } from '../../utils/creditHandler'
import modal from '../../utils/modal'
import ProfileSelector from '../Analysis/ProfileSelector'
import CompatibilityCard from '../Analysis/CompatibilityCard'
import AIDetectionCard from '../Analysis/AIDetectionCard'
import DeviationCard from '../Analysis/DeviationCard'
import StatisticsCard from '../Analysis/StatisticsCard'
import ModelSelector from '../Analysis/ModelSelector'
import WritingPreferences from '../Analysis/WritingPreferences'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import { cn } from '../../lib/utils'
import BackgroundGradient from '../Common/BackgroundGradient'
import Icon from '../Common/Icon'
import LazyLottie from '../Common/LazyLottie'

// Breakpoints for responsive behavior
const BREAKPOINT_MOBILE = 768
const BREAKPOINT_TABLET = 1024

// Sidebar widths
const WIDTH_DESKTOP = 300
const WIDTH_TABLET = 280

const RightSidebar = ({ hidden, onClose, onAnalysisComplete, onModeChange }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentNote, updateNote } = useNotes()
  const { currentProfile, selectProfile } = useProfiles()
  const { selectedModel, setSelectedModel, writingPreferences, setWritingPreferences } = useRewrite()
  const { startProcessing, startStreaming, stopProcessing } = useAIProcessingActions()
  const { isProcessing } = useAIProcessing()
  const [mode, setMode] = useState('analysis') // 'analysis' or 'rewrite'
  const [isDragging, setIsDragging] = useState(false)
  const [isInteractingWithSlider, setIsInteractingWithSlider] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  // Ref for scroll container to preserve scroll position
  const scrollContainerRef = useRef(null)
  const scrollPositionRef = useRef(0)
  
  // Save scroll position before any state update that might cause re-render
  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop
    }
  }, [])
  
  // Restore scroll position after render
  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current
        }
      })
    }
  }, [])

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < BREAKPOINT_MOBILE)
      setIsTablet(width >= BREAKPOINT_MOBILE && width < BREAKPOINT_TABLET)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Auto-close sidebar on mobile when hidden prop changes
  useEffect(() => {
    if (isMobile && !hidden) {
      // Add body scroll lock when sidebar is open on mobile
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobile, hidden])

  // Calculate sidebar width based on screen size
  const sidebarWidth = isMobile ? '100%' : isTablet ? WIDTH_TABLET : WIDTH_DESKTOP

  // Notify parent when mode changes
  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const hasText = currentNote && currentNote.content && currentNote.content.trim().length > 0
  const hasProfile = currentProfile !== null

  // Check if at least one feature is enabled for rewrite/humanize
  const hasAnyFeatureEnabled = () => {
    const prefs = writingPreferences || {}
    // If no profile, only anti-AI and iterative refinement matter
    if (!hasProfile) {
      return prefs.useAntiAIDetection || prefs.useIterativeRefinement
    }
    // If has profile, check all features
    return prefs.useAntiAIDetection || prefs.useIterativeRefinement ||
           prefs.useVocabularyPreferences || prefs.useKeyCharacteristics ||
           prefs.useSentencePatterns || prefs.useRewriteInstructions
  }

  // Rewrite handler
  const handleRewrite = async () => {
    const text = currentNote?.content
    if (!text || text.trim().length === 0) {
      modal.alert(t('rewrite.pleaseEnterTextFirst'), t('rewrite.noText'))
      return
    }

    // Check if at least one feature is enabled
    if (!hasAnyFeatureEnabled()) return
    if (isRewriting) return

    const useIterative = writingPreferences?.useIterativeRefinement
    
    const originalText = text
    
    if (useIterative) {
      logger.log('[LAUNCH] Starting async iterative humanization...')
      setIsRewriting(true)
      startProcessing('humanize')
      
      // Clear editor content immediately to show loading animation
      updateNote(currentNote.id, { content: '' })
      
      try {
        // Start async job - profile_id is optional for generic humanization
        const startResult = await startIterativeHumanize(
          currentProfile?.profile_id || null,
          originalText,
          {
            maxIterations: 3,
            targetProbability: writingPreferences?.targetAIProbability || 35,
            model: selectedModel,
            writingPreferences: writingPreferences
          }
        )
        
        if (!startResult.success) {
          throw new Error(startResult.error || t('rewrite.humanizationFailed'))
        }
        
        logger.log('[LAUNCH] Job started:', startResult.jobId, 'Estimated:', startResult.estimatedTime?.display)
        
        // Variables for streaming animation
        let fullText = ''
        let displayedText = ''
        let isAnimating = false
        let hasStartedStreaming = false
        
        const animateText = () => {
          if (displayedText.length < fullText.length) {
            const remaining = fullText.length - displayedText.length
            // Adaptive speed: faster when buffer is large, slower when catching up (synced with Workspace)
            const charsToAdd = Math.max(1, Math.min(5, Math.ceil(remaining / 15)))
            displayedText = fullText.substring(0, displayedText.length + charsToAdd)
            updateNote(currentNote.id, { content: displayedText })
            requestAnimationFrame(animateText)
          } else {
            isAnimating = false
          }
        }
        
        // Poll for progress, then stream result when completed
        const result = await pollAndStreamHumanizeJob(startResult.jobId, {
          onProgress: (progress) => {
            logger.log('[PROGRESS]', progress)
          },
          onChunk: (chunk) => {
            // First chunk - start streaming
            if (!hasStartedStreaming) {
              hasStartedStreaming = true
              logger.log('[SYNC] First chunk - starting stream')
              startStreaming()
              updateNote(currentNote.id, { content: '' })
              displayedText = ''
            }
            
            fullText += chunk
            
            if (!isAnimating) {
              isAnimating = true
              animateText()
            }
          },
          onComplete: (metadata) => {
            logger.log('[COMPLETE] Streaming finished:', metadata)
          },
          pollInterval: 1500,
          maxWaitTime: 300000
        })
        
        // Wait for animation to complete
        const waitForAnimation = () => {
          return new Promise((resolve) => {
            const checkAnimation = () => {
              if (!isAnimating && displayedText.length >= fullText.length) {
                resolve()
              } else {
                requestAnimationFrame(checkAnimation)
              }
            }
            checkAnimation()
          })
        }
        
        if (hasStartedStreaming) {
          await waitForAnimation()
        } else if (result.success && result.data) {
          // Fallback if streaming didn't work - direct update
          startStreaming()
          updateNote(currentNote.id, { content: result.data.rewritten_text })
        }
        
        if (!result.success) {
          throw new Error(result.error || t('rewrite.humanizationFailed'))
        }
      } catch (error) {
        console.error('[FAIL] Error in iterative humanize:', error)
        
        // Restore original text on error
        updateNote(currentNote.id, { content: originalText })
        
        const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
        
        if (!wasCreditError) {
          const localizedError = getLocalizedContentError(error.message, t)
          modal.errorWithReport(localizedError || t('rewrite.humanizationFailed'), error, 'Error', 'RightSidebar.handleHumanize')
        }
      } finally {
        setIsRewriting(false)
        stopProcessing()
      }
      return
    }
    
    // Standard streaming rewrite
    logger.log('[LAUNCH] Starting rewrite process...')
    setIsRewriting(true)
    startProcessing('rewrite')
    
    // Clear editor content immediately to show loading animation
    updateNote(currentNote.id, { content: '' })
    
    try {
      let fullText = ''
      let displayedText = ''
      let hasStartedStreaming = false
      let chunkCount = 0
      let isAnimating = false
      
      const animateText = () => {
        if (displayedText.length < fullText.length) {
          const remaining = fullText.length - displayedText.length
          // Adaptive speed: faster when buffer is large, slower when catching up (synced with Workspace)
          const charsToAdd = Math.max(1, Math.min(5, Math.ceil(remaining / 15)))
          
          displayedText = fullText.substring(0, displayedText.length + charsToAdd)
          updateNote(currentNote.id, { content: displayedText })
          
          requestAnimationFrame(animateText)
        } else {
          isAnimating = false
        }
      }
      
      await rewriteTextStream(
        currentProfile?.profile_id || null,
        originalText,
        selectedModel,
        writingPreferences,
        (chunk, type) => {
          // Skip reasoning chunks - feature removed
          if (type === 'reasoning') {
            return
          }
          
          chunkCount++
          logger.log(`[PACKAGE] Chunk ${chunkCount} received:`, chunk.substring(0, 50) + '...')
          
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            logger.log('[SYNC] First chunk - starting stream')
            startStreaming()
            updateNote(currentNote.id, { content: '' })
            displayedText = ''
          }
          
          fullText += chunk
          
          if (!isAnimating) {
            isAnimating = true
            animateText()
          }
          
          logger.log(`[WRITE] Buffer: ${fullText.length} chars, Displayed: ${displayedText.length} chars`)
        }
      )
      
      const waitForAnimation = () => {
        return new Promise((resolve) => {
          const checkAnimation = () => {
            if (!isAnimating && displayedText.length >= fullText.length) {
              resolve()
            } else {
              requestAnimationFrame(checkAnimation)
            }
          }
          checkAnimation()
        })
      }
      
      await waitForAnimation()
      
      logger.log(`[SUCCESS] Rewrite completed successfully - ${chunkCount} chunks received`)
      
    } catch (error) {
      console.error('[FAIL] Error rewriting:', error)
      
      // Restore original text on error
      updateNote(currentNote.id, { content: originalText })
      
      const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
      
      if (!wasCreditError) {
        const localizedError = getLocalizedContentError(error.message, t)
        modal.errorWithReport(localizedError || t('rewrite.rewriteFailed'), error, 'Error', 'RightSidebar.handleRewrite')
      }
    } finally {
      setIsRewriting(false)
      stopProcessing()
    }
  }

  const rewriteLabel = writingPreferences?.useIterativeRefinement 
    ? t('rewrite.humanize') 
    : t('rewrite.rewrite')

  // Handle pointer down to detect slider interaction
  const handlePointerDown = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
      setIsInteractingWithSlider(true)
    }
  }

  const handlePointerUp = () => {
    setIsInteractingWithSlider(false)
  }

  // Mobile overlay backdrop
  const MobileBackdrop = () => (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    />
  )

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && !hidden && <MobileBackdrop />}
      </AnimatePresence>

      <motion.aside 
        className={cn(
          "bg-bg-tertiary",
          "overflow-y-auto overflow-x-hidden flex flex-col",
          "h-full shrink-0",
          "touch-pan-y overscroll-contain scrollbar-none",
          "rounded-md", // Floating panel effect
          isDragging ? "z-[100] shadow-xl" : "z-sidebar",
          // Mobile: full width overlay from right
          isMobile && "fixed inset-y-0 right-0 rounded-none shadow-2xl z-[100] max-w-[85vw]"
        )}
        initial={false}
        animate={{
          width: hidden ? 0 : sidebarWidth,
          opacity: hidden ? 0 : 1,
          x: isMobile && hidden ? '100%' : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        drag={hidden || isInteractingWithSlider || isMobile ? false : "x"}
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false)
          if (info.offset.x > 80 && !hidden) onClose?.()
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          pointerEvents: hidden ? 'none' : 'auto',
          overflow: hidden ? 'hidden' : undefined,
          minWidth: isDragging ? WIDTH_DESKTOP : undefined
        }}
      >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 py-3 px-4 h-14 justify-start shrink-0",
        isMobile && "px-3"
      )}>
        {/* Mode Toggle - Pill Slider */}
        <div className="relative flex p-1 rounded-full flex-1 bg-bg-secondary border border-border-light">
          {/* Sliding Pill Indicator */}
          <motion.div
            className={cn(
              "absolute top-1 bottom-1 rounded-full",
              "bg-bg-primary border border-border-light",
              "shadow-sm"
            )}
            initial={false}
            animate={{
              left: mode === 'analysis' ? '4px' : 'calc(50% + 0px)',
              width: 'calc(50% - 4px)'
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          />
          
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 z-10",
              "bg-transparent border-none rounded-full cursor-pointer",
              "text-xs font-medium transition-colors duration-200",
              mode === 'analysis' ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
              isMobile && "py-2"
            )}
            onClick={() => handleModeChange('analysis')}
          >
            <Icon 
              name="bar-chart-4" 
              alt={t('rightSidebar.analysis')} 
              size="sm"
              color="muted"
              themed
            />
            <span>{t('rightSidebar.analysis')}</span>
          </button>
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 z-10",
              "bg-transparent border-none rounded-full cursor-pointer",
              "text-xs font-medium transition-colors duration-200",
              mode === 'rewrite' ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
              isMobile && "py-2"
            )}
            onClick={() => handleModeChange('rewrite')}
          >
            <Icon 
              name="pen" 
              alt={t('rightSidebar.rewrite')} 
              size="sm"
              color="muted"
              themed
            />
            <span>{t('rightSidebar.rewrite')}</span>
          </button>
        </div>

        {/* Close Button */}
        <button 
          className={cn(
            "shrink-0 p-1.5",
            "bg-transparent border-none rounded-full cursor-pointer",
            "flex items-center justify-center",
            "w-8 h-8 transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onClose}
          data-tooltip={t('common.close')} 
          data-tooltip-position="left"
        >
          <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
        </button>
      </div>

      {/* Settings Panel */}
      <div 
        ref={scrollContainerRef}
        className={cn(
          "flex flex-col gap-4 p-4 flex-1 overflow-y-auto overflow-x-hidden",
          isMobile && "gap-3 p-3"
        )}
      >
        <ProfileSelector 
          currentProfile={currentProfile}
          onProfileSelect={handleProfileSelect}
        />

        {mode === 'analysis' ? (
          <div className="flex flex-col gap-3">
            <CompatibilityCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
              onAnalysisStart={saveScrollPosition}
              onAnalysisEnd={restoreScrollPosition}
            />

            <AIDetectionCard 
              disabled={!hasText}
              text={currentNote?.content || ''}
              onAnalysisStart={saveScrollPosition}
              onAnalysisEnd={restoreScrollPosition}
            />

            <DeviationCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
              onAnalysisComplete={onAnalysisComplete}
              onAnalysisStart={saveScrollPosition}
              onAnalysisEnd={restoreScrollPosition}
            />

            <StatisticsCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
              onAnalysisStart={saveScrollPosition}
              onAnalysisEnd={restoreScrollPosition}
            />
          </div>
        ) : (
          <>
            <ModelSelector 
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
            <WritingPreferences
              currentProfile={currentProfile}
              preferences={writingPreferences}
              onPreferencesChange={setWritingPreferences}
              onSliderInteraction={setIsInteractingWithSlider}
            />
            
            {/* Rewrite Button */}
            <div className="flex flex-col gap-2">
              <BackgroundGradient 
                className="rounded-xl bg-bg-primary"
                containerClassName="w-full"
                animate={!isRewriting && hasText && hasAnyFeatureEnabled()}
              >
                <button
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-4",
                    "rounded-xl font-semibold text-sm cursor-pointer",
                    "transition-all duration-200",
                    "bg-bg-primary text-blue-600",
                    "hover:bg-bg-hover",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  onClick={handleRewrite}
                  disabled={!hasText || !hasAnyFeatureEnabled() || isRewriting || isProcessing}
                >
                  {isRewriting ? (
                    // @ts-ignore - LazyLottie props are correct
                    <LazyLottie 
                      animationData={threeDotsAnimation} 
                      loop={true}
                      style={{ width: 40, height: 16 }}
                    />
                  ) : (
                    <>
                      <img 
                        src={`/icon/${writingPreferences?.useIterativeRefinement ? "user-check" : "pen"}.svg`}
                        alt={rewriteLabel}
                        className="w-4 h-4 filter-icon-primary"
                      />
                      <span>{rewriteLabel}</span>
                    </>
                  )}
                </button>
              </BackgroundGradient>
            </div>
          </>
        )}
      </div>
    </motion.aside>
    </>
  )
}

export default RightSidebar
