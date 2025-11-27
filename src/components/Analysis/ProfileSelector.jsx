import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../../contexts/ProfileContext'
import { deleteProfile as deleteProfileAPI } from '../../services/api'
import { invalidateProfileDetailCache } from '../../utils/profileDetailCache'
import modal from '../../utils/modal'
import './Analysis.css'
import '../Popups/ProfileModal.css'

const ProfileSelector = ({ currentProfile, onProfileSelect }) => {
  const { t } = useTranslation()
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
    modal.toast(t('profile.profileSelected'), profile.profile_name, 'success')
  }

  const handleDeleteProfile = async (e, profileId) => {
    e.stopPropagation()
    const confirmed = await modal.confirm(
      t('profile.confirmDeleteProfile'),
      t('profile.confirmDeleteTitle'),
      { confirmText: t('common.delete'), danger: true }
    )
    
    if (confirmed) {
      const result = await deleteProfileAPI(profileId)
      if (result.success) {
        modal.toast(t('profile.profileDeleted'), '', 'success')
        removeProfile(profileId)
        
        // Invalidate cache for deleted profile
        invalidateProfileDetailCache(profileId)
        
        // If deleted profile was active, clear it
        if (currentProfile && currentProfile.profile_id === profileId) {
          onProfileSelect(null)
        }
      } else {
        modal.error(t('profile.unableToDelete') + ': ' + result.error)
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
            <h3>{currentProfile?.profile_name || t('profile.noProfile')}</h3>
            <p className="model-id">
              {currentProfile ? t('profile.textSamples', { count: currentProfile.sample_count || 0 }) : t('profile.clickToSelect')}
            </p>
          </div>
          <img src="/icon/chevron-down.svg" alt="Select" className="profile-selector-arrow" />
        </div>
        <p className="model-description">
          {currentProfile 
            ? t('profile.activeProfile') 
            : t('profile.selectProfileDesc')}
        </p>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('profile.selectWritingStyleProfile')}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt={t('common.close')} />
              </button>
            </div>
            
            <div className="modal-search">
              <img src="/icon/search.svg" alt={t('common.search')} className="modal-search-icon" />
              <input 
                type="text" 
                className="modal-search-input" 
                placeholder={t('profile.searchProfiles')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="modal-search-clear show" onClick={() => setSearchTerm('')}>
                  <img src="/icon/x.svg" alt={t('common.close')} />
                </button>
              )}
            </div>

            <div className="modal-models-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="modal-spinner"></div>
                  <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
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
                    {searchTerm ? t('profile.noProfilesFound') : t('profile.noProfilesYet')}
                  </p>
                  {!searchTerm && (
                    <button className="profile-modal-create-btn" onClick={() => navigate('/profile-setup')}>
                      <img src="/icon/plus.svg" alt={t('profile.createNewProfile')} />
                      <span>{t('profile.createNewProfile')}</span>
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
                            <span className="profile-modal-badge selected">{t('profile.selected')}</span>
                          ) : profile.status === 'ready' ? (
                            <span className="profile-modal-badge ready">[{t('profile.ready').toUpperCase()}]</span>
                          ) : (
                            <span className="profile-modal-badge pending">[{t('profile.processing').toUpperCase()}]</span>
                          )}
                          {(profile.quality_score || profile.qualityScore) && (
                            <span className={`profile-modal-badge quality quality-${profile.quality_rating || profile.qualityRating || 'ok'}`}>
                              {profile.quality_score || profile.qualityScore}/100
                            </span>
                          )}
                        </div>
                        <div className="profile-modal-meta">
                          <span className="profile-modal-meta-item">
                            <img src="/icon/file-text.svg" alt={t('common.samples')} />
                            {profile.sample_count || 0} {t('common.samples')}
                          </span>
                          {profile.statistics?.totalWords && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/type.svg" alt={t('common.words')} />
                                {profile.statistics.totalWords.toLocaleString()} {t('common.words')}
                              </span>
                            </>
                          )}
                          {profile.statistics?.totalSentences && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/align-left.svg" alt={t('common.sentences')} />
                                {profile.statistics.totalSentences.toLocaleString()} {t('common.sentences')}
                              </span>
                            </>
                          )}
                          {profile.created_at && (
                            <>
                              <span className="profile-modal-meta-divider">•</span>
                              <span className="profile-modal-meta-item">
                                <img src="/icon/calendar.svg" alt={t('profile.createdDate')} />
                                {new Date(profile.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button 
                        className="profile-modal-delete-btn" 
                        onClick={(e) => handleDeleteProfile(e, profile.profile_id)}
                        data-tooltip={t('common.delete')}
                        data-tooltip-position="left"
                      >
                        <img src="/icon/trash-2.svg" alt={t('common.delete')} />
                      </button>
                    </div>
                    
                    <div className="profile-modal-card-body">
                      <div className="profile-modal-tags">
                        <span className="profile-modal-tag">
                          <img src="/icon/mic.svg" alt={t('profile.tone')} />
                          {profile.voice_profile?.tone ? t(`tones.${profile.voice_profile.tone}`, { defaultValue: profile.voice_profile.tone }) : 'N/A'}
                        </span>
                        <span className="profile-modal-tag">
                          <img src="/icon/award.svg" alt={t('profile.formalityLevel')} />
                          {t('profile.formalityLevel')}: {profile.voice_profile?.formality_level || 'N/A'}/10
                        </span>
                        <span className="profile-modal-tag">
                          <img src="/icon/bar-chart.svg" alt={t('profile.sentenceLength')} />
                          {t('profile.sentenceLength')} {profile.voice_profile?.sentence_patterns?.typical_length ? t(`sentenceLengths.${profile.voice_profile.sentence_patterns.typical_length}`, { defaultValue: profile.voice_profile.sentence_patterns.typical_length }) : 'N/A'}
                        </span>
                        <span className="profile-modal-tag">
                          <img src="/icon/hash.svg" alt={t('analysis.avgSentenceLength')} />
                          {t('analysis.avgSentenceLength')}: {profile.statistics?.avgSentenceLength ? profile.statistics.avgSentenceLength.toFixed(1) : 'N/A'} {t('profile.wordsPerSentence')}
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
