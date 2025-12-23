import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser, useAuth, useAuthStore } from '../../stores/authStore'
import CreditBalance from '../CreditBalance'
import UpgradePlanModal from '../UpgradePlanModal'
import Icon from '../Common/Icon'
import Portal from '../Common/Portal'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'
import { uploadAvatar, validateAvatarFile, AVATAR_CONFIG } from '../../services/avatarService'

const UserProfilePopup = ({ onClose }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)
  const fileInputRef = useRef(null)
  const user = useUser()
  const { signOut } = useAuth()
  const updateUser = useAuthStore(state => state.updateUser)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [creditRefreshKey, setCreditRefreshKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Check if user is email user (not Google)
  const isEmailUser = user?.provider === 'email' || (!user?.picture?.includes('googleusercontent'))

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
    setCreditRefreshKey(prev => prev + 1)
    setShowUpgradeModal(false)
  }

  const handleAvatarClick = () => {
    if (isEmailUser && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      modal.toast(validation.error, '', 'error')
      return
    }

    setIsUploading(true)
    try {
      const userId = user?.userId || user?.uid || user?.id
      const result = await uploadAvatar(file, userId)
      
      if (result.success) {
        updateUser({ picture: result.avatarUrl })
        modal.toast(t('profile.avatarUpdated', 'Avatar updated'), '', 'success')
      } else {
        modal.toast(result.error || t('profile.avatarFailed', 'Failed to update avatar'), '', 'error')
      }
    } catch (err) {
      modal.toast(t('profile.avatarFailed', 'Failed to update avatar'), '', 'error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Portal>
      <div 
        ref={popupRef}
        className={cn("popup fixed bottom-[56px] left-3 w-popup-md","z-popup overflow-hidden","sm:w-popup-lg"
        )}
      >
        {/* Profile Header */}
        <div className="py-[27px] px-5 text-center">
          {/* Avatar with upload hover for email users */}
          <div className="relative inline-block group">
            {user?.picture ? (
              <img 
                src={user.picture} 
                className={cn("w-avatar-3xl h-avatar-3xl rounded-full mx-auto",
                  isEmailUser &&"cursor-pointer"
                )}
                alt="User Avatar"
                onClick={handleAvatarClick}
              />
            ) : (
              <div 
                className={cn("w-avatar-3xl h-avatar-3xl rounded-full mx-auto bg-gradient-to-br from-gradient-orange-start to-gradient-orange-end p-1.5 flex items-center justify-center",
                  isEmailUser &&"cursor-pointer"
                )}
                onClick={handleAvatarClick}
              >
                <Icon name="user-circle" size="xl" className="w-12 h-12" themed={false} />
              </div>
            )}
            
            {/* Upload overlay for email users */}
            {isEmailUser && (
              <div 
                className={cn("absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-opacity","bg-black/50 opacity-0 group-hover:opacity-100",
                  isUploading &&"opacity-100"
                )}
                onClick={handleAvatarClick}
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_CONFIG.ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <h3 className="text-xl font-normal text-text-primary mb-[7px] mt-3.5">
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
            className={cn("w-full py-2.5 px-4 rounded-lg text-sm font-medium","bg-transparent border border-border-light","text-text-secondary cursor-pointer","hover:bg-bg-hover hover:text-text-primary hover:border-border-hover","transition-colors flex items-center justify-center gap-2"
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
    </Portal>
  )
}

export default UserProfilePopup
