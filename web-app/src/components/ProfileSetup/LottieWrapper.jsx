import { useEffect, useRef, useState, lazy, Suspense, memo } from 'react'

// Lazy load lottie-react
const Lottie = lazy(() => import('lottie-react'))

/**
 * @param {{ animationData: any, loop?: boolean }} props
 */
const LottieWrapper = memo(function LottieWrapper({ animationData, loop = true }) {
  const lottieRef = useRef(null)
  const mountedRef = useRef(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    // Small delay to ensure component is fully mounted before showing animation
    const readyTimeout = setTimeout(() => {
      if (mountedRef.current) {
        setIsReady(true)
      }
    }, 50)
    
    // Cleanup function to destroy Lottie instance
    return () => {
      mountedRef.current = false
      clearTimeout(readyTimeout)
      
      // Immediately stop the animation to prevent memory leaks
      if (lottieRef.current) {
        try {
          lottieRef.current.stop()
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  // Don't render Lottie until component is ready
  if (!isReady) {
    return (
      <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div className="w-full h-full animate-pulse bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-gray-200 rounded" />}>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={loop}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  )
})

export default LottieWrapper
