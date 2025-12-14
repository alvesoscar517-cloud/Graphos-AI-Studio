import { Suspense, lazy } from 'react'
import LazyLottie from '../Common/LazyLottie'
import threeDotsAnimation from '../../animation/Three dots loading.json'

// Use refactored version with better code organization
const ProfileSetup = lazy(() => import('./ProfileSetupRefactored'))

// Loading skeleton - centered on screen
const LoadingSkeleton = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--color-bg-primary)'
    }}>
      <LazyLottie 
        animationData={threeDotsAnimation} 
        loop={true}
        style={{ width: 120, height: 90 }}
      />
    </div>
  )
}

const ProfileSetupWrapper = () => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProfileSetup />
    </Suspense>
  )
}

export default ProfileSetupWrapper
