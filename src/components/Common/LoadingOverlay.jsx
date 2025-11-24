import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import './LoadingOverlay.css'

const LoadingOverlay = ({ show }) => {
  if (!show) return null

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
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
