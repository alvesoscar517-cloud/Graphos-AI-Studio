/**
 * OptimizedSection - Performance-optimized section wrapper
 * Features: Lazy rendering, animation on scroll, reduced motion support
 */
import { memo, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useAnimateOnScroll } from '@hooks/useIntersectionObserver'
import { usePrefersReducedMotion } from '@hooks/useOptimizedAnimation'
import LoadingSpinner from './LoadingSpinner'

/**
 * Section wrapper that animates on scroll with performance optimizations
 */
const OptimizedSection = memo(({
  children,
  className = '',
  id,
  ariaLabel,
  animationType = 'fadeUp', // 'fadeUp' | 'fadeIn' | 'scale' | 'none'
  delay = 0,
  threshold = 0.1,
  as: Component = 'section',
  ...props
}) => {
  const [ref, isVisible] = useAnimateOnScroll(threshold)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Animation variants
  const variants = {
    fadeUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 }
    },
    none: {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    }
  }

  // Skip animation if reduced motion preferred
  const shouldAnimate = !prefersReducedMotion && animationType !== 'none'
  const selectedVariant = variants[animationType] || variants.fadeUp

  if (!shouldAnimate) {
    return (
      <Component
        ref={ref}
        id={id}
        className={className}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Component>
    )
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      aria-label={ariaLabel}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={selectedVariant}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      {...props}
    >
      {children}
    </motion.section>
  )
})

OptimizedSection.displayName = 'OptimizedSection'

/**
 * Lazy section that only renders content when in viewport
 */
export const LazySection = memo(({
  children,
  fallback,
  className = '',
  rootMargin = '100px',
  ...props
}) => {
  const [ref, isVisible] = useAnimateOnScroll(0)

  return (
    <div ref={ref} className={className} {...props}>
      {isVisible ? (
        <Suspense fallback={fallback || <SectionLoader />}>
          {children}
        </Suspense>
      ) : (
        fallback || <SectionLoader />
      )}
    </div>
  )
})

LazySection.displayName = 'LazySection'

/**
 * Default section loading placeholder
 */
const SectionLoader = () => (
  <div 
    className="flex items-center justify-center py-24" 
    role="status" 
    aria-label="Loading section"
  >
    <LoadingSpinner size="md" />
  </div>
)

/**
 * Staggered children animation wrapper
 */
export const StaggerContainer = memo(({
  children,
  className = '',
  staggerDelay = 0.05,
  ...props
}) => {
  const [ref, isVisible] = useAnimateOnScroll(0.1)
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

StaggerContainer.displayName = 'StaggerContainer'

/**
 * Staggered child item
 */
export const StaggerItem = memo(({
  children,
  className = '',
  ...props
}) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

StaggerItem.displayName = 'StaggerItem'

export default OptimizedSection
