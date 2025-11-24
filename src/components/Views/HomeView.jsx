import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfiles, getProfileDetails } from '../../services/api'
import { getCachedProfiles, setCachedProfiles, checkCacheInvalidation } from '../../utils/profileCache'
import { getCachedProfileDetail, setCachedProfileDetail } from '../../utils/profileDetailCache'
import { useNotes } from '../../contexts/NotesContext'
import ProfileCarousel from './Home/ProfileCarousel'
import ProfileDetailPopup from '../Popups/ProfileDetailPopup'
import modal from '../../utils/modal'
import './HomeView.css'

const HomeView = ({ onToggleLeftSidebar, onViewChange }) => {
  const { createNote } = useNotes()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showDetailPopup, setShowDetailPopup] = useState(false)
  
  useEffect(() => {
    loadProfilesData()
  }, [])

  const loadProfilesData = async () => {
    try {
      // Check if cache should be invalidated
      checkCacheInvalidation()

      // Try to get from cache first
      const cached = getCachedProfiles()
      if (cached) {
        setProfiles(cached)
        setLoading(false)
        return
      }

      // Load from API
      setLoading(true)
      const data = await loadProfiles()
      setProfiles(data)
      setCachedProfiles(data)
    } catch (error) {
      console.error('Error loading profiles:', error)
      modal.error('Không thể tải danh sách hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProfile = async (profile) => {
    try {
      // Check cache first
      const cached = getCachedProfileDetail(profile.profile_id)
      if (cached) {
        setSelectedProfile(cached)
        setShowDetailPopup(true)
        return
      }

      // Load full profile details from API
      const fullProfile = await getProfileDetails(profile.profile_id)
      
      // Cache the result
      setCachedProfileDetail(profile.profile_id, fullProfile)
      
      setSelectedProfile(fullProfile)
      setShowDetailPopup(true)
    } catch (error) {
      console.error('Error loading profile details:', error)
      modal.error('Không thể tải chi tiết hồ sơ')
    }
  }

  const handleUseProfile = (profile) => {
    localStorage.setItem('activeProfileId', profile.profile_id)
    localStorage.setItem('activeProfileName', profile.profile_name)
    modal.toast('Đã chọn hồ sơ', profile.profile_name, 'success')
    setShowDetailPopup(false)
    
    // Create new note and switch to editor
    createNote()
    onViewChange('playground-editor')
  }

  const handleUseProfileFromCard = (profile) => {
    // Set active profile
    localStorage.setItem('activeProfileId', profile.profile_id)
    localStorage.setItem('activeProfileName', profile.profile_name)
    modal.toast('Đã chọn hồ sơ', profile.profile_name, 'success')
    
    // Create new note and switch to editor
    createNote()
    onViewChange('playground-editor')
  }
  
  const handleCreateProfile = () => {
    navigate('/profile-setup')
  }

  return (
    <div className="home-view">
      <header className="home-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Ẩn/hiện sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
      </header>

      <div className="home-content">
        <div className="home-hero">
          <h2 className="hero-title">AI Content Authenticator</h2>
          <p className="hero-subtitle">
            <span>Công cụ chuyên nghiệp phân tích và hiệu chỉnh văn phong nội dung</span>
            <button className="new-app-btn" onClick={handleCreateProfile}>
              <img src="/icon/plus.svg" alt="Plus" />
              <span>New profile</span>
            </button>
          </p>
        </div>

        <div className="quick-actions">
          <div className="action-card" onClick={handleCreateProfile} style={{ cursor: 'pointer' }}>
            <div className="action-icon-wrapper">
              <img src="/icon/user-round.svg" alt="Profile" className="action-icon" />
            </div>
            <h3>Tạo Hồ sơ Văn phong</h3>
          </div>
          <div className="action-card" onClick={() => onViewChange('playground-editor')} style={{ cursor: 'pointer' }}>
            <div className="action-icon-wrapper">
              <img src="/icon/file-search.svg" alt="Analyze" className="action-icon" />
            </div>
            <h3>Phân tích Nội dung</h3>
          </div>
          <div className="action-card" onClick={() => onViewChange('history')} style={{ cursor: 'pointer' }}>
            <div className="action-icon-wrapper">
              <img src="/icon/bar-chart.svg" alt="Monitor" className="action-icon" />
            </div>
            <h3>Theo dõi Thống kê</h3>
          </div>
        </div>

        <div className="whats-new">
          <h3 className="section-title">Tính năng nổi bật</h3>
          <div className="news-grid">
            <div className="news-card">
              <div className="news-icon-wrapper">
                <img src="/icon/fingerprint.svg" alt="Voice Profile" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Hiệu chỉnh Văn phong</h4>
                <p>Tạo hồ sơ văn phong độc đáo từ các mẫu văn bản của bạn</p>
              </div>
            </div>
            <div className="news-card">
              <div className="news-icon-wrapper">
                <img src="/icon/shield-check.svg" alt="AI Detection" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Phát hiện AI</h4>
                <p>Xác định tỷ lệ nội dung được tạo bởi AI với độ chính xác cao</p>
              </div>
            </div>
            <div className="news-card">
              <div className="news-icon-wrapper">
                <img src="/icon/wand-sparkles.svg" alt="Rewrite" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Viết lại thông minh</h4>
                <p>Tự động điều chỉnh văn bản theo đúng giọng văn của bạn</p>
              </div>
            </div>
            <div className="news-card">
              <div className="news-icon-wrapper">
                <img src="/icon/chart-line.svg" alt="Analytics" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Phân tích Thống kê</h4>
                <p>Đánh giá chi tiết về độ phức tạp và đặc điểm văn phong</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <ProfileCarousel 
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onUseProfile={handleUseProfileFromCard}
            loading={loading}
          />
        </div>
      </div>

      {showDetailPopup && selectedProfile && (
        <ProfileDetailPopup
          profile={selectedProfile}
          onClose={() => setShowDetailPopup(false)}
          onUse={() => handleUseProfile(selectedProfile)}
        />
      )}
    </div>
  )
}

export default HomeView
