import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser, useAuth } from '../../stores/authStore'
import CreditBalance from '../CreditBalance'
import UpgradePlanModal from '../UpgradePlanModal'
import AccountSettings from '../Auth/AccountSettings'
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
  const [showAccountSettings, setShowAccountSettings] = useState(false)
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

        <div className="px-5 pb-4 space-y-2">
          <button 
            onClick={() => setShowAccountSettings(true)}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg text-sm font-medium",
              "bg-transparent border border-border-light",
              "text-text-secondary cursor-pointer",
              "hover:bg-bg-hover hover:text-text-primary hover:border-border-hover",
              "transition-colors flex items-center justify-center gap-2"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('auth.accountSettings')}
          </button>
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
          <a 
            href="https://graphosai.com/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-text-muted cursor-pointer hover:underline no-underline"
          >
            {t('auth.privacyPolicy')}
          </a>
          <span className="mx-1.5">•</span>
          <a 
            href="https://graphosai.com/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-text-muted cursor-pointer hover:underline no-underline"
          >
            {t('auth.termsOfService')}
          </a>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" 
            onClick={() => setShowAccountSettings(false)}
          />
          <div className="relative bg-bg-primary dark:bg-bg-secondary border border-border dark:border-border-light rounded-2xl shadow-2xl dark:shadow-black/50 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('auth.accountSettings')}
              </h2>
              <button 
                onClick={() => setShowAccountSettings(false)}
                className="p-1.5 rounded-lg hover:bg-bg-hover dark:hover:bg-bg-primary transition-colors text-text-muted hover:text-text-primary"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>
            <AccountSettings />
          </div>
        </div>
      )}
    </Portal>
  )
}

export default UserProfilePopup
