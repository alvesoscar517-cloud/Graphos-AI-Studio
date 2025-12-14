import { logger } from '../../utils/logger'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../../contexts/ProfileContext'
import { deleteProfile as deleteProfileAPI } from '../../services/api'
import { invalidateProfileDetailCache } from '../../utils/profileDetailCache'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

const ProfileSelector = ({ currentProfile, onProfileSelect }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profiles, loading, loadProfiles, removeProfile } = useProfiles()
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleClick = () => {
    setShowModal(true)
  }

  const handleSelectProfile = (profile) => {
    onProfileSelect(profile)
    setShowModal(false)
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
        removeProfile(profileId)
        invalidateProfileDetailCache(profileId)
        if (currentProfile && currentProfile.profile_id === profileId) {
          onProfileSelect(null)
        }
      } else {
        modal.errorWithReport(t('profile.unableToDelete') + ': ' + result.error, new Error(result.error), 'Error', 'ProfileSelector.handleDelete')
      }
    }
  }

  const filteredProfiles = profiles.filter(p => 
    p.profile_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profile_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getThemeColor = (theme) => {
    const colors = {
      'work': 'text-primary',
      'personal': 'text-success',
      'academic': 'text-purple-500',
      'creative': 'text-pink-500',
      'business': 'text-orange-500',
      'social': 'text-cyan-500',
      'technical': 'text-text-muted',
      'other': 'text-text-muted'
    }
    return colors[theme] || 'text-primary'
  }

  return (
    <>
      {/* Selector Card */}
      <div 
        className={cn(
          "bg-bg-secondary border border-border-light rounded-xl",
          "py-3 px-3 pb-2 cursor-pointer transition-all duration-200",
          "flex flex-col items-center text-center gap-1",
          "hover:border-border-hover hover:shadow-md"
        )}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="card-icon !w-12 !h-12">
            <img 
              src={`/icon/${getThemeIcon(currentProfile?.theme)}.svg`} 
              alt={t('nav.profile')} 
              className="w-6 h-6 filter-icon-primary"
            />
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            <h3 className="text-xs font-medium text-text-primary m-0 leading-tight">
              {currentProfile?.profile_name || t('profile.noProfile')}
            </h3>
            <p className="text-[11px] text-text-secondary m-0">
              {currentProfile 
                ? (currentProfile._isPlaceholder 
                    ? t('common.loading') 
                    : t('profile.textSamples', { count: currentProfile.sample_count || 0 }))
                : t('profile.clickToSelect')}
            </p>
          </div>
        </div>
        <Icon name="chevron-down" size="sm" color="muted" />
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-modal-nested animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className={cn(
              "bg-bg-primary rounded-3xl w-full max-w-md h-[520px]",
              "flex flex-col shadow-modal animate-slide-up",
              "max-md:max-w-[calc(100%-32px)] max-md:h-[80vh] max-md:max-h-[520px] max-md:rounded-2xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Search */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-text-primary m-0">
                  {t('profile.selectWritingStyleProfile')}
                </h2>
                <button 
                  className="bg-transparent border-none p-2 cursor-pointer rounded-full flex items-center justify-center hover:bg-bg-tertiary"
                  onClick={() => setShowModal(false)}
                >
                  <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Icon 
                  name="search" 
                  alt={t('common.search')} 
                  size="md"
                  color="muted"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input 
                  type="text" 
                  className={cn(
                    "w-full py-2.5 pl-10 pr-10 text-sm",
                    "bg-bg-secondary border border-border-light rounded-lg",
                    "text-text-primary placeholder:text-text-muted",
                    "outline-none transition-all duration-200",
                    "focus:border-accent focus:ring-2 focus:ring-primary/20"
                  )}
                  placeholder={t('profile.searchProfiles')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer rounded hover:bg-bg-hover"
                    onClick={() => setSearchTerm('')}
                  >
                    <Icon name="x" alt={t('common.close')} size="md" color="muted" />
                  </button>
                )}
              </div>
            </div>

            {/* Profiles List */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-border-light border-t-primary rounded-full animate-spin" />
                  <p className="mt-4 text-sm text-text-secondary">{t('common.loading')}</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <img 
                    src="/icon for background/monster-chibi.svg" 
                    alt={t('common.noProfiles')} 
                    className="w-32 h-32 mb-4 opacity-60 icon-invert"
                  />
                  <p className="text-sm text-text-secondary mb-4">
                    {searchTerm ? t('profile.noProfilesFound') : t('profile.noProfilesYet')}
                  </p>
                  {!searchTerm && (
                    <button 
                      className={cn(
                        "inline-flex items-center gap-2 py-2.5 px-4",
                        "bg-primary text-white text-sm font-medium rounded-xl",
                        "border-none cursor-pointer transition-all duration-200",
                        "hover:bg-primary-hover"
                      )}
                      onClick={() => navigate('/profile-setup')}
                    >
                      <Icon name="plus" alt={t('profile.createNewProfile')} size="md" themed={false} className="invert" />
                      <span>{t('profile.createNewProfile')}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Clear selection option - only show when a profile is selected */}
                  {currentProfile && !searchTerm && (
                    <div 
                      className={cn(
                        "bg-bg-secondary border border-border-light rounded-xl",
                        "p-4 cursor-pointer transition-all duration-200",
                        "hover:border-border-hover hover:shadow-sm",
                        "flex items-center gap-3"
                      )}
                      onClick={() => handleSelectProfile(null)}
                    >
                      <div className="card-icon !w-10 !h-10 shrink-0 bg-fill-tertiary">
                        <Icon name="user-x" size="md" color="muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-primary m-0">
                          {t('profile.clearSelection')}
                        </h3>
                        <p className="text-xs text-text-muted m-0 mt-0.5">
                          {t('profile.clearSelectionDesc')}
                        </p>
                      </div>
                    </div>
                  )}
                  {filteredProfiles.map(profile => (
                    <div 
                      key={profile.profile_id}
                      className={cn(
                        "bg-bg-secondary border border-border-light rounded-xl",
                        "p-4 cursor-pointer transition-all duration-200",
                        "hover:border-border-hover hover:shadow-sm"
                      )}
                      onClick={() => handleSelectProfile(profile)}
                    >
                      {/* Card Header */}
                      <div className="flex items-center gap-3">
                        <div className="card-icon !w-10 !h-10 shrink-0">
                          <img 
                            src={`/icon/${getThemeIcon(profile.theme)}.svg`} 
                            alt={profile.profile_name} 
                            className="w-5 h-5 filter-icon-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-text-primary m-0 truncate">
                              {profile.profile_name}
                            </h3>
                            {currentProfile?.profile_id === profile.profile_id ? (
                              <span className="text-[10px] py-0.5 px-2 bg-primary/15 text-primary rounded-md font-medium shrink-0">
                                {t('model.inUse')}
                              </span>
                            ) : profile.status === 'ready' ? (
                              <span className="text-[10px] py-0.5 px-2 bg-success/15 text-success rounded-md font-medium shrink-0">
                                {t('profile.ready').toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-[10px] py-0.5 px-2 bg-warning/15 text-warning rounded-md font-medium shrink-0">
                                {t('profile.processing').toUpperCase()}
                              </span>
                            )}
                          </div>
                          {(profile.quality_score || profile.qualityScore) && (
                            <span className={cn(
                              "text-sm font-semibold",
                              (profile.quality_rating || profile.qualityRating) === 'excellent' && "text-success",
                              (profile.quality_rating || profile.qualityRating) === 'good' && "text-primary",
                              (profile.quality_rating || profile.qualityRating) === 'ok' && "text-warning",
                              !(profile.quality_rating || profile.qualityRating) && "text-text-secondary"
                            )}>
                              {profile.quality_score || profile.qualityScore}/100
                            </span>
                          )}
                        </div>
                        <button 
                          className={cn(
                            "p-2 bg-transparent border-none rounded-lg cursor-pointer shrink-0",
                            "opacity-40 transition-all duration-200",
                            "hover:opacity-100 hover:bg-error/10"
                          )}
                          onClick={(e) => handleDeleteProfile(e, profile.profile_id)}
                          data-tooltip={t('common.delete')}
                          data-tooltip-position="left"
                        >
                          <Icon name="trash-2" alt={t('common.delete')} size="md" />
                        </button>
                      </div>
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Icon name="file-text" alt={t('common.samples')} size="xs" color="muted" />
                          {profile.sample_count || 0} {t('common.samples')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Icon name="calendar" alt={t('profile.createdDate')} size="xs" color="muted" />
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Card Body - Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border-light">
                        <span className="flex items-center gap-1 text-[10px] py-1 px-2 bg-fill-tertiary border border-border-light rounded-md text-text-secondary">
                          <Icon name="mic" alt={t('profile.tone')} size="xs" color="muted" />
                          {profile.voice_profile?.tone ? t(`tones.${profile.voice_profile.tone}`, { defaultValue: profile.voice_profile.tone }) : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] py-1 px-2 bg-fill-tertiary border border-border-light rounded-md text-text-secondary">
                          <Icon name="award" alt={t('profile.formalityLevel')} size="xs" color="muted" />
                          {profile.voice_profile?.formality_level || 'N/A'}/10
                        </span>
                        <span className="flex items-center gap-1 text-[10px] py-1 px-2 bg-fill-tertiary border border-border-light rounded-md text-text-secondary">
                          <Icon name="bar-chart" alt={t('profile.sentenceLength')} size="xs" color="muted" />
                          {profile.voice_profile?.sentence_patterns?.typical_length ? t(`sentenceLengths.${profile.voice_profile.sentence_patterns.typical_length}`, { defaultValue: profile.voice_profile.sentence_patterns.typical_length }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
