/**
 * Hooks Index - Export all custom hooks
 * Enhanced: Dec 2025 - Performance optimization hooks
 */

// Intersection Observer hooks
export {
  useIntersectionObserver,
  useLazyLoad,
  useAnimateOnScroll,
  useVisibility
} from './useIntersectionObserver'

// Animation optimization hooks
export {
  usePrefersReducedMotion,
  useAnimationVariants,
  useCountUp,
  useParallax,
  useResizeObserver
} from './useOptimizedAnimation'

// Route preloading
export { default as usePreloadRoutes } from './usePreloadRoutes'
