import { useEffect, useRef, lazy, Suspense } from 'react'

// Lazy load lottie-react
const Lottie = lazy(() => import('lottie-react'))

const LottieWrapper = ({ animationData, loop = true }) => {
  const lottieRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    // Cleanup function to destroy Lottie instance
    return () => {
      mountedRef.current = false
      
      // Use setTimeout to ensure cleanup happens after React finishes
      setTimeout(() => {
        if (lottieRef.current) {
          try {
            lottieRef.current.stop()
            lottieRef.current.destroy()
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }, 0)
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />}>
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
}

export default LottieWrapper
