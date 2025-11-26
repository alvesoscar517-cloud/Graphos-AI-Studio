import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfiles, getProfileDetails } from '../../services/api'
import { getCachedProfiles, setCachedProfiles, checkCacheInvalidation } from '../../utils/profileCache'
import { getCachedProfileDetail, setCachedProfileDetail } from '../../utils/profileDetailCache'
import ProfileCarousel from './Home/ProfileCarousel'
import ProfileDetailPopup from '../Popups/ProfileDetailPopup'
import modal from '../../utils/modal'
import './HomeView.css'

const HomeView = ({ onToggleLeftSidebar, onViewChange }) => {
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
      modal.error('Unable to load profile list')
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
      modal.error('Unable to load profile details')
    }
  }

  const handleUseProfile = (profile) => {
    localStorage.setItem('activeProfileId', profile.profile_id)
    localStorage.setItem('activeProfileName', profile.profile_name)
    modal.toast('Profile selected', profile.profile_name, 'success')
    setShowDetailPopup(false)
    
    // Switch to editor with new note
    onViewChange('aistudio-editor', { createNew: true })
  }

  const handleUseProfileFromCard = (profile) => {
    // Set active profile
    localStorage.setItem('activeProfileId', profile.profile_id)
    localStorage.setItem('activeProfileName', profile.profile_name)
    modal.toast('Profile selected', profile.profile_name, 'success')
    
    // Switch to editor with new note
    onViewChange('aistudio-editor', { createNew: true })
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
          data-tooltip="Toggle sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
      </header>

      <div className="home-content">
        <div className="home-hero">
          <h2 className="hero-title">AI Content Authenticator</h2>
          <p className="hero-subtitle">
            <span>Professional tool for analyzing and refining content style</span>
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
            <h3>Create Style Profile</h3>
          </div>
          <div className="action-card" onClick={() => onViewChange('aistudio-editor', { createNew: true })} style={{ cursor: 'pointer' }}>
            <div className="action-icon-wrapper">
              <img src="/icon/file-search.svg" alt="Analyze" className="action-icon" />
            </div>
            <h3>Analyze Content</h3>
          </div>
          <div className="action-card" onClick={() => onViewChange('history')} style={{ cursor: 'pointer' }}>
            <div className="action-icon-wrapper">
              <img src="/icon/bar-chart.svg" alt="Monitor" className="action-icon" />
            </div>
            <h3>Track Statistics</h3>
          </div>
        </div>

        <div className="whats-new">
          <h3 className="section-title">Featured Features</h3>
          <div className="news-grid">
            <div className="news-card" onClick={handleCreateProfile} style={{ cursor: 'pointer' }}>
              <div className="news-icon-wrapper">
                <img src="/icon/fingerprint.svg" alt="Voice Profile" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Style Refinement</h4>
                <p>Create unique writing style profiles from your text samples</p>
              </div>
            </div>
            <div className="news-card" onClick={() => onViewChange('aistudio-editor', { createNew: true })} style={{ cursor: 'pointer' }}>
              <div className="news-icon-wrapper">
                <img src="/icon/shield-check.svg" alt="AI Detection" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>AI Detection</h4>
                <p>Determine the percentage of AI-generated content with high accuracy</p>
              </div>
            </div>
            <div className="news-card" onClick={() => onViewChange('aistudio-editor', { createNew: true })} style={{ cursor: 'pointer' }}>
              <div className="news-icon-wrapper">
                <img src="/icon/wand-sparkles.svg" alt="Rewrite" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Smart Rewriting</h4>
                <p>Automatically adjust text to match your unique voice</p>
              </div>
            </div>
            <div className="news-card" onClick={() => onViewChange('history')} style={{ cursor: 'pointer' }}>
              <div className="news-icon-wrapper">
                <img src="/icon/chart-line.svg" alt="Analytics" className="news-icon" />
              </div>
              <div className="news-content">
                <h4>Statistical Analysis</h4>
                <p>Get detailed insights into complexity and writing style characteristics</p>
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
