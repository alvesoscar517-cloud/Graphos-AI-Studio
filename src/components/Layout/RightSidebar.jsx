// @ts-nocheck
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import Icon from '../Common/Icon'
import LazyLottie from '../Common/LazyLottie'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import { cn } from '../../lib/utils'

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
  const [humanizeProgress, setHumanizeProgress] = useState(null) // Local state for progress display

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

  // Get progress text for humanize
  const getProgressText = () => {
    if (!humanizeProgress) return null
    const { currentStep, currentIteration, totalIterations, aiProbability, iterationsUsed, reachedTarget } = humanizeProgress
    
    switch (currentStep) {
      case 'queued':
        return t('rewrite.humanizeProgress.queued')
      case 'loading_profile':
        return t('rewrite.humanizeProgress.loading_profile')
      case 'rewriting':
        return t('rewrite.humanizeProgress.rewriting', { current: currentIteration, total: totalIterations })
      case 'checking':
        return aiProbability 
          ? `${t('rewrite.humanizeProgress.checking')} (${aiProbability}%)`
          : t('rewrite.humanizeProgress.checking')
      case 'completed':
        return `${reachedTarget ? '✓' : '⚠'} ${t('rewrite.completedIterations', { count: iterationsUsed || 1 })} - AI: ${aiProbability}%`
      case 'failed':
        return t('rewrite.humanizeProgress.failed')
      default:
        return t('rewrite.humanizing')
    }
  }

  // Rewrite handler
  const handleRewrite = async () => {
    const text = currentNote?.content
    if (!text || text.trim().length === 0) {
      modal.alert(t('rewrite.pleaseEnterTextFirst'), t('rewrite.noText'))
      return
    }

    // For iterative humanize, profile is optional
    const useIterative = writingPreferences?.useIterativeRefinement
    if (!useIterative && !currentProfile) return
    if (isRewriting) return
    
    const originalText = text
    
    if (useIterative) {
      console.log('[LAUNCH] Starting async iterative humanization...')
      setIsRewriting(true)
      startProcessing('humanize') // Use 'humanize' type to show progress on editor
      
      try {
        // Start async job - profile_id is optional for generic humanization
        const startResult = await startIterativeHumanize(
          currentProfile?.profile_id || null,
          originalText,
          {
            maxIterations: 3,
            targetProbability: writingPreferences?.targetAIProbability || 35,
            model: selectedModel
          }
        )
        
        if (!startResult.success) {
          throw new Error(startResult.error || t('rewrite.humanizationFailed'))
        }
        
        console.log('[LAUNCH] Job started:', startResult.jobId, 'Estimated:', startResult.estimatedTime?.display)
        
        // Variables for streaming animation
        let fullText = ''
        let displayedText = ''
        let isAnimating = false
        let hasStartedStreaming = false
        
        const animateText = () => {
          if (displayedText.length < fullText.length) {
            const remaining = fullText.length - displayedText.length
            const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
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
            console.log('[PROGRESS]', progress)
            setHumanizeProgress(progress.progress)
          },
          onChunk: (chunk) => {
            // First chunk - clear editor and start streaming
            if (!hasStartedStreaming) {
              hasStartedStreaming = true
              console.log('[SYNC] First chunk - clearing editor, starting stream')
              startStreaming() // Stop shimmer effect
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
            console.log('[COMPLETE] Streaming finished:', metadata)
            // Show final result in progress area
            setHumanizeProgress({
              currentStep: 'completed',
              aiProbability: metadata.finalAIProbability,
              iterationsUsed: metadata.iterationsUsed,
              reachedTarget: metadata.reachedTarget
            })
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
          updateNote(currentNote.id, { content: result.data.rewritten_text })
          setHumanizeProgress({
            currentStep: 'completed',
            aiProbability: result.data.final_ai_probability,
            iterationsUsed: result.data.iterations_used,
            reachedTarget: result.data.reached_target
          })
        }
        
        if (!result.success) {
          throw new Error(result.error || t('rewrite.humanizationFailed'))
        }
        
        // Clear progress after 3 seconds
        setTimeout(() => {
          setHumanizeProgress(null)
        }, 3000)
      } catch (error) {
        console.error('[FAIL] Error in iterative humanize:', error)
        
        const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
        
        if (!wasCreditError) {
          const localizedError = getLocalizedContentError(error.message, t)
          modal.error(localizedError || t('rewrite.humanizationFailed'))
        }
        setHumanizeProgress(null)
      } finally {
        setIsRewriting(false)
        stopProcessing()
      }
      return
    }
    
    // Standard streaming rewrite
    console.log('[LAUNCH] Starting rewrite process...')
    setIsRewriting(true)
    startProcessing('rewrite')
    
    try {
      let fullText = ''
      let displayedText = ''
      let hasStartedStreaming = false
      let chunkCount = 0
      let isAnimating = false
      
      const animateText = () => {
        if (displayedText.length < fullText.length) {
          const remaining = fullText.length - displayedText.length
          const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
          
          displayedText = fullText.substring(0, displayedText.length + charsToAdd)
          updateNote(currentNote.id, { content: displayedText })
          
          requestAnimationFrame(animateText)
        } else {
          isAnimating = false
        }
      }
      
      await rewriteTextStream(
        currentProfile.profile_id,
        originalText,
        selectedModel,
        writingPreferences,
        (chunk) => {
          chunkCount++
          console.log(`[PACKAGE] Chunk ${chunkCount} received:`, chunk.substring(0, 50) + '...')
          
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            console.log('[SYNC] First chunk - clearing editor, stopping shimmer')
            startStreaming() // Stop shimmer effect when streaming starts
            updateNote(currentNote.id, { content: '' })
            displayedText = ''
          }
          
          fullText += chunk
          
          if (!isAnimating) {
            isAnimating = true
            animateText()
          }
          
          console.log(`✍️ Buffer: ${fullText.length} chars, Displayed: ${displayedText.length} chars`)
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
      
      console.log(`[SUCCESS] Rewrite completed successfully - ${chunkCount} chunks received`)
      
    } catch (error) {
      console.error('[FAIL] Error rewriting:', error)
      
      const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
      
      if (!wasCreditError) {
        const localizedError = getLocalizedContentError(error.message, t)
        modal.error(localizedError || t('rewrite.rewriteFailed'))
      }
      updateNote(currentNote.id, { content: originalText })
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

  return (
    <motion.aside 
      className={cn(
        "bg-bg-tertiary",
        "overflow-y-auto overflow-x-hidden flex flex-col",
        "h-full shrink-0",
        "touch-pan-y overscroll-contain scrollbar-none",
        "rounded-md", // Floating panel effect
        isDragging ? "z-[100] shadow-xl" : "z-sidebar"
      )}
      initial={false}
      animate={{
        width: hidden ? 0 : 300,
        opacity: hidden ? 0 : 1,
        x: 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      drag={hidden || isInteractingWithSlider ? false : "x"}
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
        minWidth: isDragging ? 300 : undefined
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 py-3 px-4 h-14 justify-start shrink-0">
        {/* Mode Toggle - Glass Slider */}
        <div className="relative flex p-1 rounded-xl flex-1 bg-bg-secondary border border-border-light">
          {/* Sliding Glass Indicator */}
          <motion.div
            className={cn(
              "absolute top-1 bottom-1 rounded-lg",
              "bg-fill-tertiary border border-border-light",
              "shadow-sm backdrop-blur-sm"
            )}
            initial={false}
            animate={{
              left: mode === 'analysis' ? '4px' : '50%',
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
              "bg-transparent border-none rounded-lg cursor-pointer",
              "text-xs font-medium transition-colors duration-200",
              mode === 'analysis' ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
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
              "bg-transparent border-none rounded-lg cursor-pointer",
              "text-xs font-medium transition-colors duration-200",
              mode === 'rewrite' ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
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
      <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto overflow-x-hidden">
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
            />

            <AIDetectionCard 
              disabled={!hasText}
              text={currentNote?.content || ''}
            />

            <DeviationCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
              onAnalysisComplete={onAnalysisComplete}
            />

            <StatisticsCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
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
              <button
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 px-4",
                  "rounded-xl font-semibold text-sm cursor-pointer",
                  "transition-all duration-200",
                  "bg-fill-tertiary text-blue-600 border border-border-light",
                  "hover:bg-bg-hover hover:border-border-hover",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={handleRewrite}
                disabled={!hasText || (!hasProfile && !writingPreferences?.useIterativeRefinement) || isRewriting || isProcessing}
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
              
              {/* Progress display for Iterative Humanize */}
              {humanizeProgress && writingPreferences?.useIterativeRefinement && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "text-center py-2 px-3 rounded-lg text-xs",
                    humanizeProgress.currentStep === 'completed' 
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : humanizeProgress.currentStep === 'failed'
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  )}
                >
                  {getProgressText()}
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.aside>
  )
}

export default RightSidebar
