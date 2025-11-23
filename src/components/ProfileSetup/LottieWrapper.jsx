import { useEffect, useRef } from 'react'
import Lottie from 'lottie-react'

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
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default LottieWrapper
