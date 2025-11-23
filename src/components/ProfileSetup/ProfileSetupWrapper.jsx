import { Suspense, lazy } from 'react'

const ProfileSetup = lazy(() => import('./ProfileSetup'))

const ProfileSetupWrapper = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Đang tải...
      </div>
    }>
      <ProfileSetup />
    </Suspense>
  )
}

export default ProfileSetupWrapper
