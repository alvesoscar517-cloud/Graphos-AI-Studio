import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser, useAuth } from '../../stores/authStore'
import CreditBalance from '../CreditBalance'
import UpgradePlanModal from '../UpgradePlanModal'
import Icon from '../Common/Icon'
import Portal from '../Common/Portal'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const UserProfilePopup = ({ onClose }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)
  const user = useUser() // Use Zustand store for user data
  const { signOut } = useAuth() // Keep signOut from context for now
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [creditRefreshKey, setCreditRefreshKey] = useState(0)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  const handleSignOut = async () => {
    const confirmed = await modal.confirm(
      t('auth.confirmSignOut'),
      t('auth.confirmSignOutTitle'),
      { confirmText: t('auth.signOut'), danger: true }
    )
    
    if (confirmed) {
      await signOut()
      onClose()
      modal.toast(t('auth.signedOut'), '', 'success')
    }
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const handlePurchaseSuccess = () => {
    setCreditRefreshKey(prev => prev + 1);
    setShowUpgradeModal(false);
  }

  return (
    <Portal>
      <div 
        ref={popupRef}
        className={cn(
          "popup fixed bottom-[56px] left-3 w-popup-md",
          "z-popup overflow-hidden",
          "sm:w-popup-lg"
        )}
      >
        {/* Profile Header */}
        <div className="py-[27px] px-5 text-center">
          {user?.picture ? (
            <img 
              src={user.picture} 
              className="w-avatar-3xl h-avatar-3xl rounded-full mx-auto mb-3.5"
              alt="User Avatar"
            />
          ) : (
            <div className="w-avatar-3xl h-avatar-3xl rounded-full mx-auto mb-3.5 bg-gradient-to-br from-gradient-orange-start to-gradient-orange-end p-1.5 flex items-center justify-center">
              <Icon name="user-circle" size="xl" className="w-12 h-12" themed={false} />
            </div>
          )}
          <h3 className="text-xl font-normal text-text-primary mb-[7px]">
            {user?.name || t('auth.notSignedIn')}
          </h3>
          <p className="text-xs text-text-secondary mb-0 max-w-[260px] mx-auto overflow-hidden text-ellipsis whitespace-nowrap text-center">
            {user?.email || t('auth.pleaseSignIn')}
          </p>
        </div>
        
        {/* Credit Balance Section */}
        <div className="p-0">
          <CreditBalance 
            userId={user?.userId || user?.uid || user?.id || localStorage.getItem('userId')}
            onUpgradeClick={handleUpgradeClick}
          />
        </div>

        <div className="px-5 pb-4">
          <button 
            onClick={handleSignOut}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg text-sm font-medium",
              "bg-transparent border border-border-light",
              "text-text-secondary cursor-pointer",
              "hover:bg-bg-hover hover:text-text-primary hover:border-border-hover",
              "transition-colors flex items-center justify-center gap-2"
            )}
          >
            <Icon name="log-out" size="sm" />
            {t('auth.signOut')}
          </button>
        </div>
        <div className="py-2 px-5 text-center text-[10px] text-text-muted">
          <span className="text-text-muted cursor-pointer hover:underline">
            {t('auth.privacyPolicy')}
          </span>
          <span className="mx-1.5">•</span>
          <span className="text-text-muted cursor-pointer hover:underline">
            {t('auth.termsOfService')}
          </span>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </Portal>
  )
}

export default UserProfilePopup
