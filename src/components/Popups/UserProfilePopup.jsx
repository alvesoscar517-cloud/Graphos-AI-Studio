import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import CreditBalance from '../CreditBalance'
import UpgradePlanModal from '../UpgradePlanModal'
import modal from '../../utils/modal'
import './Popups.css'

const UserProfilePopup = ({ onClose }) => {
  const popupRef = useRef(null)
  const { user, signOut } = useAuth()
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
      'Bạn có chắc muốn đăng xuất?',
      'Xác nhận đăng xuất',
      { confirmText: 'Đăng xuất', danger: true }
    )
    
    if (confirmed) {
      await signOut()
      onClose()
      modal.toast('Đã đăng xuất', '', 'success')
    }
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const handlePurchaseSuccess = () => {
    // Force refresh credit balance by changing key
    setCreditRefreshKey(prev => prev + 1);
    setShowUpgradeModal(false);
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
          <h3 className="profile-name">{user?.name || 'Chưa đăng nhập'}</h3>
          <p className="profile-email">{user?.email || 'Vui lòng đăng nhập'}</p>
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
        
        <button className="profile-action-btn" onClick={handleSignOut}>
          Đăng xuất
        </button>
        <div className="profile-divider"></div>
        <div className="profile-footer">
          <a href="#" className="profile-link">Chính sách bảo mật</a>
          <span className="profile-separator">•</span>
          <a href="#" className="profile-link">Điều khoản dịch vụ</a>
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
