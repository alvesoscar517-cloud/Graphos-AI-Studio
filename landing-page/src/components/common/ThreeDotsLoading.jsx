/**
 * ThreeDotsLoading Component
 * Unified loading animation for all demos - uses Lottie animation like main app
 */
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/ThreeDotsLoading.json'

/**
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Size of the animation
 * @param {string} [props.className] - Additional CSS classes
 */
const ThreeDotsLoading = ({ size = 'md', className = '' }) => {
  const sizeConfig = {
    sm: { width: 30, height: 12 },
    md: { width: 42, height: 17 },
    lg: { width: 60, height: 24 }
  }

  const { width, height } = sizeConfig[size] || sizeConfig.md

  return (
    <Lottie
      animationData={threeDotsAnimation}
      loop={true}
      style={{ width, height }}
      className={className}
    />
  )
}

export default ThreeDotsLoading
