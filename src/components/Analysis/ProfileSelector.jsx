import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Lottie from 'lottie-react'
import { useProfiles } from '../../contexts/ProfileContext'
import { deleteProfile as deleteProfileAPI } from '../../services/api'
import { invalidateProfileDetailCache } from '../../utils/profileDetailCache'
import modal from '../../utils/modal'
import catAnimation from '../../animation/cat-playing-animation.json'
import './Analysis.css'
import '../Popups/ProfileModal.css'

const ProfileSelector = ({ currentProfile, onProfileSelect }) => {
  const navigate = useNavigate()
  const { profiles, loading, loadProfiles, removeProfile } = useProfiles()
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleClick = () => {
    console.log('🖱️ ProfileSelector clicked, opening modal')
    setShowModal(true)
  }

  const handleSelectProfile = (profile) => {
    onProfileSelect(profile)
    setShowModal(false)
    modal.toast('Đã chọn hồ sơ', profile.profile_name, 'success')
  }

  const handleDeleteProfile = async (e, profileId) => {
    e.stopPropagation()
    const confirmed = await modal.confirm(
      'Bạn có chắc muốn xóa hồ sơ này? Hành động này không thể hoàn tác.',
      'Xác nhận xóa hồ sơ',
      { confirmText: 'Xóa', danger: true }
    )
    
    if (confirmed) {
      const result = await deleteProfileAPI(profileId)
      if (result.success) {
        modal.toast('Đã xóa hồ sơ', '', 'success')
        removeProfile(profileId)
        
        // Invalidate cache for deleted profile
        invalidateProfileDetailCache(profileId)
        
        // If deleted profile was active, clear it
        if (currentProfile && currentProfile.profile_id === profileId) {
          onProfileSelect(null)
        }
      } else {
        modal.error('Không thể xóa hồ sơ: ' + result.error)
      }
    }
  }

  const filteredProfiles = profiles.filter(p => 
    p.profile_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profile_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Theme icon mapping
  const getThemeIcon = (theme) => {
    const themeIcons = {
      'work': 'briefcase',
      'personal': 'user',
      'academic': 'graduation-cap',
      'creative': 'palette',
      'business': 'trending-up',
      'social': 'message-circle',
      'technical': 'code',
      'other': 'more-horizontal'
    }
    return themeIcons[theme] || 'user-round'
  }

  return (
    <>
      <div className="model-selector clickable" onClick={handleClick}>
        <div className="profile-selector-header">
          <div className="profile-selector-icon">
            <img src={`/icon/${getThemeIcon(currentProfile?.theme)}.svg`} alt="Profile" />
          </div>
          <div className="profile-selector-info">
            <h3>{currentProfile?.profile_name || 'Chưa có hồ sơ'}</h3>
            <p className="model-id">
              {currentProfile ? `${currentProfile.sample_count || 0} mẫu văn bản` : 'Nhấn để chọn hồ sơ'}
            </p>
          </div>
          <img src="/icon/chevron-down.svg" alt="Select" className="profile-selector-arrow" />
        </div>
        <p className="model-description">
          {currentProfile 
            ? 'Hồ sơ văn phong đang hoạt động' 
            : 'Chọn hồ sơ văn phong để bắt đầu phân tích và viết lại nội dung.'}
        </p>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chọn hồ sơ văn phong</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt="Close" />
              </button>
            </div>
            
            <div className="modal-search">
              <img src="/icon/search.svg" alt="Search" className="modal-search-icon" />
              <input 
                type="text" 
                className="modal-search-input" 
                placeholder="Tìm kiếm hồ sơ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="modal-search-clear show" onClick={() => setSearchTerm('')}>
                  <img src="/icon/x.svg" alt="Clear" />
                </button>
              )}
            </div>

            <div className="modal-models-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="modal-spinner"></div>
                  <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Đang tải...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-animation-wrapper">
                    <Lottie
                      animationData={catAnimation}
                      loop={true}
                      autoplay={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <p className="empty-text">
                    {searchTerm ? 'Không tìm thấy hồ sơ' : 'Chưa có hồ sơ nào'}
                  </p>
                  {!searchTerm && (
                    <button className="profile-modal-create-btn" onClick={() => navigate('/profile-setup')}>
                      <img src="/icon/plus.svg" alt="Create" />
                      <span>Tạo hồ sơ mới</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredProfiles.map(profile => (
                  <div 
                    key={profile.profile_id}
                    className={`profile-modal-card ${currentProfile?.profile_id === profile.profile_id ? 'selected' : ''}`}
                    onClick={() => handleSelectProfile(profile)}
                  >
                    <div className="profile-modal-card-header">
                      <div className="profile-modal-icon">
                        <img src={`/icon/${getThemeIcon(profile.theme)}.svg`} alt={profile.profile_name} />
                      </div>
                      <div className="profile-modal-info">
                        <div className="profile-modal-name-row">
                          <h3 className="profile-modal-name">{profile.profile_name}</h3>
                          {profile.status === 'ready' ? (
                            <span className="profile-modal-badge ready">Sẵn sàng</span>
                          ) : (
                            <span className="profile-modal-badge pending">Đang xử lý</span>
                          )}
                        </div>
                        <div className="profile-modal-meta">
                          <span className="profile-modal-meta-item">
                            <img src="/icon/file-text.svg" alt="Samples" />
                            {profile.sample_count || 0} mẫu
                          </span>
                          {profile.statistics && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/type.svg" alt="Words" />
                                {profile.statistics.totalWords?.toLocaleString() || 0} từ
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button 
                        className="profile-modal-delete-btn" 
                        onClick={(e) => handleDeleteProfile(e, profile.profile_id)}
                        title="Xóa hồ sơ"
                      >
                        <img src="/icon/trash-2.svg" alt="Delete" />
                      </button>
                    </div>
                    
                    {profile.voice_profile && (
                      <div className="profile-modal-card-body">
                        <div className="profile-modal-tags">
                          {profile.voice_profile.tone && (
                            <span className="profile-modal-tag">
                              {profile.voice_profile.tone === 'professional' ? 'Chuyên nghiệp' :
                               profile.voice_profile.tone === 'casual' ? 'Thân mật' :
                               profile.voice_profile.tone === 'academic' ? 'Học thuật' :
                               profile.voice_profile.tone === 'creative' ? 'Sáng tạo' :
                               profile.voice_profile.tone === 'friendly' ? 'Thân thiện' :
                               profile.voice_profile.tone}
                            </span>
                          )}
                          {profile.voice_profile.formality_level && (
                            <span className="profile-modal-tag">
                              Trang trọng: {profile.voice_profile.formality_level}/10
                            </span>
                          )}
                          {profile.statistics?.readabilityScore && (
                            <span className="profile-modal-tag">
                              Flesch: {profile.statistics.readabilityScore.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default ProfileSelector
