import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import { cn } from '../../lib/utils'

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
        <Lottie 
          animationData={threeDotsAnimation} 
          loop={true}
          style={{ width: 80, height: 60 }}
        />
      </div>
    </div>
  )
}

export default LoadingOverlay
