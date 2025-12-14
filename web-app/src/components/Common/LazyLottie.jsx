// @ts-nocheck
/**
 * LazyLottie - Lazy loaded Lottie component
 * Reduces initial bundle size by loading lottie-react only when needed
 */

import { lazy, Suspense, memo } from 'react'

// Lazy load lottie-react
const LottieComponent = lazy(() => import('lottie-react'))

// Simple loading placeholder
const LottiePlaceholder = ({ width, height, className }) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className || ''}`}
    style={{ width: width || 100, height: height || 100 }}
  />
)

/**
 * LazyLottie - Drop-in replacement for Lottie with lazy loading
 * 
 * @param {Object} props - Component props
 * @param {Object} props.animationData - Lottie animation JSON data
 * @param {boolean} [props.loop=true] - Whether to loop the animation
 * @param {boolean} [props.autoplay=true] - Whether to autoplay the animation
 * @param {Object} [props.style] - Inline styles
 * @param {string} [props.className] - CSS class name
 * @param {number|string} [props.width] - Width of the animation
 * @param {number|string} [props.height] - Height of the animation
 */
const LazyLottie = memo((props) => {
  const { 
    animationData, 
    loop = true, 
    autoplay = true, 
    style,
    className = '',
    width,
    height,
    ...rest 
  } = props

  // Calculate dimensions for placeholder
  const placeholderWidth = width || style?.width || 100
  const placeholderHeight = height || style?.height || 100

  return (
    <Suspense fallback={<LottiePlaceholder width={placeholderWidth} height={placeholderHeight} className={className} />}>
      <LottieComponent
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={style}
        className={className}
        {...rest}
      />
    </Suspense>
  )
})

LazyLottie.displayName = 'LazyLottie'

export default LazyLottie
