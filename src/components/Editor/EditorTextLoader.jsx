// @ts-nocheck
/**
 * EditorTextLoader - Modern text editor loading animation
 * Designed specifically for rewrite/humanize operations
 * Features shimmer effect with text-like skeleton lines
 * Adapts to container size for optimal display
 */
import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Single shimmer line with looping staggered animation
 * @param {Object} props
 * @param {string} props.width - Width of the line (CSS value)
 * @param {number} [props.delay] - Animation delay in seconds
 * @param {string} [props.height] - Tailwind height class
 * @param {number} [props.loopDelay] - Delay before loop restarts
 */
const ShimmerLine = memo(function ShimmerLine({ 
  width, 
  delay = 0,
  height = 'h-4',
  loopDelay = 0
}) {
  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0, x: -8 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        x: [-8, 0, 0, -8]
      }}
      transition={{ 
        duration: 2.5,
        delay: delay + loopDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
        repeat: Infinity,
        repeatDelay: 0.5,
        times: [0, 0.15, 0.85, 1]
      }}
    >
      <div
        className={cn("relative overflow-hidden rounded-md",
          height,"bg-fill-secondary"
        )}
        style={{ width }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(var(--color-text-primary-rgb), 0.06) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay * 0.3,
          }}
        />
      </div>
    </motion.div>
  )
})

/**
 * Paragraph block with multiple shimmer lines - looping animation
 * @param {Object} props
 * @param {number} [props.lines] - Number of lines in paragraph
 * @param {number} [props.baseDelay] - Base animation delay
 * @param {number} [props.loopDelay] - Delay for loop cycle
 * @param {string} [props.className] - Additional CSS classes
 */
const ShimmerParagraph = memo(function ShimmerParagraph({ 
  lines = 4, 
  baseDelay = 0,
  loopDelay = 0,
  className = ''
}) {
  // Generate varied line widths for natural text appearance
  const lineWidths = useMemo(() => {
    const widths = []
    for (let i = 0; i < lines; i++) {
      if (i === lines - 1) {
        // Last line is shorter (40-70%)
        widths.push(`${40 + Math.random() * 30}%`)
      } else {
        // Other lines are longer (75-100%)
        widths.push(`${75 + Math.random() * 25}%`)
      }
    }
    return widths
  }, [lines])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {lineWidths.map((width, index) => (
        <ShimmerLine
          key={index}
          width={width}
          delay={baseDelay + index * 0.08}
          loopDelay={loopDelay}
        />
      ))}
    </div>
  )
})

/**
 * Calculate optimal layout based on container dimensions
 * @param {number} height - Container height in pixels
 * @param {number} width - Container width in pixels
 * @returns {{ paragraphs: number, linesPerParagraph: number, layout: string }}
 */
function calculateLayout(height, width) {
  // Line height ~28px (h-4 + gap-3), paragraph gap ~24px
  const lineHeight = 28
  const paragraphGap = 24
  const padding = 48 // p-6 = 24px * 2
  
  const availableHeight = height - padding
  const availableWidth = width - padding
  
  // Determine layout type based on dimensions
  // Small: < 300px height (compact view)
  // Medium: 300-500px height (standard view)
  // Large: > 500px height (full screen view)
  
  if (availableHeight < 250) {
    // Compact: 1-2 paragraphs, fewer lines
    return {
      paragraphs: 1,
      linesPerParagraph: Math.max(2, Math.floor(availableHeight / lineHeight)),
      layout: 'compact'
    }
  }
  
  if (availableHeight < 400) {
    // Small: 2 paragraphs
    const linesPerPara = Math.floor((availableHeight - paragraphGap) / (2 * lineHeight))
    return {
      paragraphs: 2,
      linesPerParagraph: Math.max(3, Math.min(5, linesPerPara)),
      layout: 'small'
    }
  }
  
  if (availableHeight < 600) {
    // Medium: 3 paragraphs
    const linesPerPara = Math.floor((availableHeight - 2 * paragraphGap) / (3 * lineHeight))
    return {
      paragraphs: 3,
      linesPerParagraph: Math.max(3, Math.min(5, linesPerPara)),
      layout: 'medium'
    }
  }
  
  // Large/Full screen: 4-5 paragraphs
  const maxParagraphs = Math.min(5, Math.floor((availableHeight + paragraphGap) / (4 * lineHeight + paragraphGap)))
  const linesPerPara = Math.floor((availableHeight - (maxParagraphs - 1) * paragraphGap) / (maxParagraphs * lineHeight))
  
  return {
    paragraphs: Math.max(3, maxParagraphs),
    linesPerParagraph: Math.max(4, Math.min(6, linesPerPara)),
    layout: 'large'
  }
}

/**
 * Main EditorTextLoader component
 * Shows skeleton text with shimmer effect during rewrite/humanize
 * Automatically adapts to container size
 * @param {Object} props
 * @param {boolean} [props.visible] - Whether to show the loader
 * @param {string} [props.className] - Additional CSS classes
 */
const EditorTextLoader = memo(function EditorTextLoader({
  visible = false,
  className = ''
}) {
  const containerRef = useRef(null)
  const [layout, setLayout] = useState({ paragraphs: 3, linesPerParagraph: 4, layout: 'medium' })
  
  // Measure container and calculate optimal layout
  useEffect(() => {
    if (!visible || !containerRef.current) return
    
    const updateLayout = () => {
      if (containerRef.current) {
        const { height, width } = containerRef.current.getBoundingClientRect()
        setLayout(calculateLayout(height, width))
      }
    }
    
    // Initial measurement
    updateLayout()
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(containerRef.current)
    
    return () => resizeObserver.disconnect()
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          className={cn("absolute inset-0 z-20","bg-bg-tertiary","flex flex-col","overflow-hidden",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Content area matching editor padding */}
          <div className={cn("flex-1 overflow-hidden","p-6 max-md:p-4",
            // Center content vertically for compact layouts
            layout.layout === 'compact' &&"flex items-center"
          )}>
            {/* Shimmer paragraphs */}
            <div className={cn("flex flex-col gap-6",
              // Adjust max-width based on layout
              layout.layout === 'large' ?"max-w-4xl" :"max-w-3xl",
              layout.layout === 'compact' &&"gap-4 w-full"
            )}>
              {Array.from({ length: layout.paragraphs }).map((_, pIndex) => (
                <ShimmerParagraph
                  key={pIndex}
                  lines={
                    pIndex === layout.paragraphs - 1 
                      ? Math.max(2, layout.linesPerParagraph - 1) 
                      : layout.linesPerParagraph
                  }
                  baseDelay={pIndex * 0.12}
                  loopDelay={pIndex * 0.15}
                />
              ))}
            </div>
          </div>

          {/* Subtle processing indicator at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
              animate={{
                x: ['-100%', '400%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default EditorTextLoader
