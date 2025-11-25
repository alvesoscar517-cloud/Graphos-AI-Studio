import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import modal from '../../utils/modal'
import CreditBalance from '../CreditBalance'
import UpgradePlanModal from '../UpgradePlanModal'
import './Popups.css'

const UserProfilePopup = ({ onClose }) => {
  const popupRef = useRef(null)
  const { user, signOut } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

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

  const handleUpgradeSuccess = (data) => {
    modal.toast('Nâng cấp thành công!', `Đã thêm ${data.creditsAdded} credits`, 'success')
    // Refresh credit balance will happen automatically via CreditBalance component
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
        onUpgrade={handleUpgradeSuccess}
      />
    </>
  )
}

export default UserProfilePopup
