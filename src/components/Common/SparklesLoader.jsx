// @ts-nocheck
/**
 * SparklesLoader - AI processing indicator with sparkles animation
 * Uses Sparkles Loop Loader AI animation with ultra-thin blur overlay
 * 
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'sm' | 'md' | 'lg'} [props.size] - Size of the loader
 * @param {boolean} [props.showOverlay] - Whether to show blur overlay
 * @param {string} [props.overlayClassName] - Additional CSS classes for overlay
 */
import { memo } from 'react'
import sparklesAnimation from '../../animation/Sparkles Loop Loader AI.json'
import { cn } from '../../lib/utils'
import LazyLottie from './LazyLottie'

const SparklesLoader = memo(function SparklesLoader(props) {
  const { 
    className = '',
    size = 'md',
    showOverlay = true,
    overlayClassName = ''
  } = props
  const sizeStyles = {
    sm: { width: 192, height: 192 },
    md: { width: 288, height: 288 },
    lg: { width: 384, height: 384 }
  }

  const loader = (
    <LazyLottie 
      animationData={sparklesAnimation} 
      loop={true} 
      style={sizeStyles[size] || sizeStyles.md}
    />
  )

  if (!showOverlay) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {loader}
      </div>
    )
  }

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center z-10","bg-bg-secondary/30 backdrop-blur-[1px]","rounded-xl transition-all duration-200",
      overlayClassName,
      className
    )}>
      {loader}
    </div>
  )
})

export default SparklesLoader
