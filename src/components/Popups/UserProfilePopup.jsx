import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import CreditBalance from '../CreditBalance'
import UpgradePlanModal from '../UpgradePlanModal'
import modal from '../../utils/modal'
import './Popups.css'

const UserProfilePopup = ({ onClose }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)
  const { user, signOut, authMethod, hasGoogleLinked, linkGoogleAccount } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [creditRefreshKey, setCreditRefreshKey] = useState(0)
  const [linkingGoogle, setLinkingGoogle] = useState(false)

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

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true)
    try {
      await linkGoogleAccount()
      modal.toast(t('auth.email.googleLinked') || 'Google account linked successfully!', '', 'success')
    } catch (err) {
      modal.toast(err.message || t('auth.email.linkFailed'), '', 'error')
    } finally {
      setLinkingGoogle(false)
    }
  }

  return (
    <>
      <div className="user-profile-popup show" ref={popupRef} style={{ display: 'block' }}>
        <div className="profile-header">
          <img 
            src={user?.picture || "/icon/user-circle.svg"} 
            className="profile-avatar" 
            alt="User Avatar"
            style={user?.picture ? { background: 'none', padding: 0, borderRadius: '50%' } : {}}
          />
          <h3 className="profile-name">{user?.name || t('auth.notSignedIn')}</h3>
          <p className="profile-email">{user?.email || t('auth.pleaseSignIn')}</p>
        </div>
        
        {/* Credit Balance Section */}
        <div className="profile-credits-section">
          <CreditBalance 
            key={creditRefreshKey}
            userId={user?.id || localStorage.getItem('userId')}
            onUpgradeClick={handleUpgradeClick}
          />
        </div>
        
        <div className="profile-divider"></div>
        
        {/* Link Google Account button for email users who haven't linked yet */}
        {authMethod === 'email' && !hasGoogleLinked && (
          <button 
            className="profile-action-btn google-link-btn-profile" 
            onClick={handleLinkGoogle}
            disabled={linkingGoogle}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {linkingGoogle 
              ? (t('auth.email.linking') || 'Linking...') 
              : (t('auth.email.linkGoogle') || 'Link Google Account')
            }
          </button>
        )}

        {/* Show linked status if Google is linked */}
        {authMethod === 'email' && hasGoogleLinked && (
          <div className="google-linked-status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{t('auth.email.driveSyncEnabled') || 'Google Drive sync enabled'}</span>
          </div>
        )}
        
        <button className="profile-action-btn" onClick={handleSignOut}>
          {t('auth.signOut')}
        </button>
        <div className="profile-divider"></div>
        <div className="profile-footer">
          <a href="#" className="profile-link">{t('auth.privacyPolicy')}</a>
          <span className="profile-separator">•</span>
          <a href="#" className="profile-link">{t('auth.termsOfService')}</a>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  )
}

export default UserProfilePopup
