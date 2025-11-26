import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../../contexts/ProfileContext'
import { deleteProfile as deleteProfileAPI } from '../../services/api'
import { invalidateProfileDetailCache } from '../../utils/profileDetailCache'
import modal from '../../utils/modal'
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
    modal.toast('Profile Selected', profile.profile_name, 'success')
  }

  const handleDeleteProfile = async (e, profileId) => {
    e.stopPropagation()
    const confirmed = await modal.confirm(
      'Are you sure you want to delete this profile? This action cannot be undone.',
      'Confirm Delete Profile',
      { confirmText: 'Delete', danger: true }
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
        modal.error('Unable to delete profile: ' + result.error)
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
          <div className={`profile-selector-icon theme-icon-${currentProfile?.theme || 'work'}`}>
            <img src={`/icon/${getThemeIcon(currentProfile?.theme)}.svg`} alt="Profile" />
          </div>
          <div className="profile-selector-info">
            <h3>{currentProfile?.profile_name || 'No Profile'}</h3>
            <p className="model-id">
              {currentProfile ? `${currentProfile.sample_count || 0} text samples` : 'Click to select profile'}
            </p>
          </div>
          <img src="/icon/chevron-down.svg" alt="Select" className="profile-selector-arrow" />
        </div>
        <p className="model-description">
          {currentProfile 
            ? 'Active writing style profile' 
            : 'Select a writing style profile to start analyzing and rewriting content.'}
        </p>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Writing Style Profile</h2>
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
                  <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-monster-wrapper">
                    <img 
                      src="/icon for background/monster-chibi.svg" 
                      alt="Monster Chibi" 
                      className="empty-monster-icon"
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
                      <div className={`profile-modal-icon theme-icon-${profile.theme || 'work'}`}>
                        <img src={`/icon/${getThemeIcon(profile.theme)}.svg`} alt={profile.profile_name} />
                      </div>
                      <div className="profile-modal-info">
                        <div className="profile-modal-name-row">
                          <h3 className="profile-modal-name">{profile.profile_name}</h3>
                          {currentProfile?.profile_id === profile.profile_id ? (
                            <span className="profile-modal-badge selected">[SELECTED]</span>
                          ) : profile.status === 'ready' ? (
                            <span className="profile-modal-badge ready">[READY]</span>
                          ) : (
                            <span className="profile-modal-badge pending">[PROCESSING]</span>
                          )}
                          {(profile.quality_score || profile.qualityScore) && (
                            <span className={`profile-modal-badge quality quality-${profile.quality_rating || profile.qualityRating || 'ok'}`}>
                              {profile.quality_score || profile.qualityScore}/100
                            </span>
                          )}
                        </div>
                        <div className="profile-modal-meta">
                          <span className="profile-modal-meta-item">
                            <img src="/icon/file-text.svg" alt="Samples" />
                            {profile.sample_count || 0} mẫu
                          </span>
                          {profile.statistics?.totalWords && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/type.svg" alt="Words" />
                                {profile.statistics.totalWords.toLocaleString()} từ
                              </span>
                            </>
                          )}
                          {profile.statistics?.totalSentences && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/align-left.svg" alt="Sentences" />
                                {profile.statistics.totalSentences.toLocaleString()} sentences
                              </span>
                            </>
                          )}
                          {profile.created_at && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/calendar.svg" alt="Created" />
                                {new Date(profile.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                    
                    <div className="profile-modal-card-body">
                      <div className="profile-modal-tags">
                        <span className="profile-modal-tag">
                          <img src="/icon/mic.svg" alt="Tone" />
                          {profile.voice_profile?.tone ? (
                            profile.voice_profile.tone === 'professional' ? 'Professional' :
                            profile.voice_profile.tone === 'casual' ? 'Casual' :
                            profile.voice_profile.tone === 'academic' ? 'Academic' :
                            profile.voice_profile.tone === 'creative' ? 'Creative' :
                            profile.voice_profile.tone === 'friendly' ? 'Friendly' :
                            profile.voice_profile.tone
                          ) : 'N/A'}
                        </span>
                        <span className="profile-modal-tag">
                          <img src="/icon/award.svg" alt="Formality" />
                          Trang trọng: {profile.voice_profile?.formality_level || 'N/A'}/10
                        </span>
                        <span className="profile-modal-tag">
                          <img src="/icon/bar-chart.svg" alt="Length" />
                          Sentence {profile.voice_profile?.sentence_patterns?.typical_length ? (
                            profile.voice_profile.sentence_patterns.typical_length === 'short' ? 'Short' :
                            profile.voice_profile.sentence_patterns.typical_length === 'medium' ? 'Medium' :
                            profile.voice_profile.sentence_patterns.typical_length === 'long' ? 'Long' :
                            profile.voice_profile.sentence_patterns.typical_length
                          ) : 'N/A'}
                        </span>
                        <span className="profile-modal-tag">
                          <img src="/icon/hash.svg" alt="Avg" />
                          Avg: {profile.statistics?.avgSentenceLength ? profile.statistics.avgSentenceLength.toFixed(1) : 'N/A'} words/sentence
                        </span>
                      </div>
                    </div>
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
