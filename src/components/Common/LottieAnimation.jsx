import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Lottie from 'lottie-react'

const LottieAnimation = ({ animationPath, width = 100, height = 100, loop = true, autoplay = true, className = '' }) => {
  const { t } = useTranslation()
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    // Load animation data dynamically
    fetch(animationPath)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error))
  }, [animationPath])

  if (!animationData) {
    return (
      <div className={className} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '12px', color: '#999' }}>{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        className={className}
      />
    </div>
  )
}

export default LottieAnimation
