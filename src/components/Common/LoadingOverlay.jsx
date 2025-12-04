import { lazy, Suspense, useState, useEffect } from 'react'
import { cn } from '../../lib/utils'

// Lazy load lottie-react
const LazyLottie = lazy(() => import('lottie-react'))

// Simple spinner fallback
const SpinnerFallback = () => (
  <div className="w-20 h-15 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

// Separate component to handle async loading
const LottieLoader = () => {
  const [animationData, setAnimationData] = useState(null)
  
  useEffect(() => {
    import('../../animation/Three dots loading.json')
      .then(module => setAnimationData(module.default))
  }, [])
  
  if (!animationData) return <SpinnerFallback />
  
  return (
    <LazyLottie 
      animationData={animationData} 
      loop={true}
      style={{ width: 80, height: 60 }}
    />
  )
}

const LoadingOverlay = ({ show }) => {
  if (!show) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-black/40",
      "backdrop-blur-xl",
      "flex items-center justify-center z-modal-backdrop",
      "animate-fade-in"
    )}
    style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-lg",
        "bg-bg-primary/80 shadow-elevated",
        "animate-scale-in-bounce"
      )}>
        <Suspense fallback={<SpinnerFallback />}>
          <LottieLoader />
        </Suspense>
      </div>
    </div>
  )
}

export default LoadingOverlay
