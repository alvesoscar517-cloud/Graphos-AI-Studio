import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

/**
 * ReasoningDisplay - Shows AI reasoning/thinking process in realtime
 * Displays streaming reasoning content with auto-collapse when complete
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
  
  // Auto-expand when reasoning starts, auto-collapse when complete
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
  
  if (!isActive && !content) return null
  
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full bg-bg-secondary/80 backdrop-blur-sm rounded-lg border border-border-light overflow-hidden",
        className
      )}
    >
      {/* Header - Collapsible trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3",
          "bg-transparent border-none cursor-pointer",
          "hover:bg-bg-hover/50 transition-colors",
          "text-left"
        )}
      >
        {/* Thinking indicator */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isComplete ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 flex-shrink-0"
            >
              <Icon name="loader-2" size="sm" color="primary" />
            </motion.div>
          ) : (
            <Icon name="check-circle" size="sm" color="success" className="flex-shrink-0" />
          )}
          
          <span className="text-sm font-medium text-text-secondary truncate">
            {isComplete 
              ? t('reasoning.thoughtFor', { time: formatTime(elapsedTime) })
              : t('reasoning.thinking')
            }
          </span>
        </div>
        
        {/* Time indicator */}
        {!isComplete && elapsedTime > 0 && (
          <span className="text-xs text-text-muted flex-shrink-0">
            {formatTime(elapsedTime)}
          </span>
        )}
        
        {/* Expand/Collapse icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <Icon name="chevron-down" size="sm" color="muted" />
        </motion.div>
      </button>
      
      {/* Content - Collapsible */}
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
                "px-4 pb-4 max-h-[200px] overflow-y-auto",
                "text-sm text-text-secondary leading-relaxed",
                "whitespace-pre-wrap break-words",
                "scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent"
              )}
            >
              {content || (
                <span className="text-text-muted italic">
                  {t('reasoning.startingAnalysis')}
                </span>
              )}
              
              {/* Typing cursor when streaming */}
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle"
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
