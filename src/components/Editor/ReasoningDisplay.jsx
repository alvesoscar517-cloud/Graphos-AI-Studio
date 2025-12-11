import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'
import LazyLottie from '../Common/LazyLottie'
import threeDotsAnimation from '../../animation/Three dots loading.json'

/**
 * ReasoningDisplay - Shows AI working/processing progress in realtime
 * Displays inline in editor without background, transparent design
 */
const ReasoningDisplay = memo(function ReasoningDisplay({ 
  content = '', 
  isActive = false,
  isComplete = false,
  startTime = null,
  className = ''
}) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const contentRef = useRef(null)
  
  // Auto-expand when reasoning starts
  useEffect(() => {
    if (isActive && !isComplete) {
      setIsExpanded(true)
    }
  }, [isActive, isComplete])
  
  // Track elapsed time
  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsedTime(0)
      return
    }
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isActive, startTime])
  
  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current && isExpanded) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content, isExpanded])
  
  // Debug log
  useEffect(() => {
    console.log('[ReasoningDisplay] Render:', { isActive, contentLength: content?.length || 0, isComplete })
  }, [isActive, content, isComplete])
  
  if (!isActive && !content) return null
  
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("overflow-hidden", className)}
    >
      {/* Header - Collapsible trigger - no background */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 py-1",
          "bg-transparent border-none cursor-pointer",
          "hover:opacity-80 transition-opacity",
          "text-left"
        )}
      >
        {/* Working indicator with three dots */}
        <div className="flex items-center gap-2 min-w-0">
          {!isComplete ? (
            <div className="flex-shrink-0 flex items-center justify-center">
              <LazyLottie 
                animationData={threeDotsAnimation} 
                loop={true}
                style={{ width: 40, height: 20 }}
              />
            </div>
          ) : (
            <Icon name="check-circle" size="sm" color="success" className="flex-shrink-0" />
          )}
          
          <span className="text-sm font-medium text-text-secondary">
            {isComplete 
              ? t('reasoning.thoughtFor', { time: formatTime(elapsedTime) })
              : t('reasoning.thinking')
            }
          </span>
        </div>
        
        {/* Time indicator */}
        {!isComplete && elapsedTime > 0 && (
          <span className="text-xs text-text-muted tabular-nums">
            {formatTime(elapsedTime)}
          </span>
        )}
        
        {/* Expand/Collapse icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <Icon name="chevron-down" size="xs" color="muted" />
        </motion.div>
      </button>
      
      {/* Content - Collapsible - no background */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div 
              ref={contentRef}
              className={cn(
                "pl-7 pr-2 pb-2 max-h-[160px] overflow-y-auto",
                "text-[13px] text-text-muted leading-relaxed",
                "whitespace-pre-wrap break-words",
                "scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent"
              )}
            >
              {content || (
                <span className="italic">
                  {t('reasoning.startingAnalysis')}
                </span>
              )}
              
              {/* Typing cursor when streaming */}
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-3 bg-text-muted ml-0.5 align-middle rounded-full"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default ReasoningDisplay
