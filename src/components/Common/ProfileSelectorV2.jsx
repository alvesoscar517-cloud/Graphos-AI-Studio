/**
 * Profile Selector V2
 * Uses TanStack Query for profiles with optimistic updates
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  useProfilesQuery, 
  useActiveProfile,
  useDeleteProfile 
} from '@/hooks/queries'
import { useToasts } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const ProfileSelectorV2 = ({ onCreateNew, onEdit }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccess, showError } = useToasts()

  // TanStack Query hooks
  const { data: profiles = [], isLoading, error, refetch } = useProfilesQuery()
  const { activeProfile, setActiveProfile } = useActiveProfile()
  const deleteProfile = useDeleteProfile()

  const handleSelect = (profile) => {
    setActiveProfile(profile)
    setIsOpen(false)
    showSuccess(`Switched to ${profile.profile_name}`)
  }

  const handleDelete = async (profileId, e) => {
    e.stopPropagation()
    
    if (!confirm(t('profiles.confirmDelete', 'Are you sure you want to delete this profile?'))) {
      return
    }

    try {
      await deleteProfile.mutateAsync(profileId)
      showSuccess(t('profiles.deleted', 'Profile deleted'))
      
      // Clear active if deleted
      if (activeProfile?.profile_id === profileId) {
        setActiveProfile(null)
      }
    } catch (err) {
      showError(err.message || t('profiles.deleteFailed', 'Failed to delete profile'))
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "bg-fill-tertiary hover:bg-fill-secondary text-text-primary",
          "border border-transparent hover:border-border-primary"
        )}
      >
        <div className="w-6 h-6 rounded-full bg-system-blue/20 flex items-center justify-center">
          <span className="text-xs font-medium text-system-blue">
            {activeProfile?.profile_name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <span className="text-sm font-medium truncate max-w-[120px]">
          {activeProfile?.profile_name || t('profiles.selectProfile', 'Select Profile')}
        </span>
        <svg 
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">
                {t('profiles.voiceProfiles', 'Voice Profiles')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('profiles.selectToUse', 'Select a profile to use')}
              </p>
            </div>

            {/* Profile List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-red-500 mb-2">
                    {t('profiles.loadError', 'Failed to load profiles')}
                  </p>
                  <button 
                    onClick={() => refetch()}
                    className="text-xs text-system-blue hover:underline"
                  >
                    {t('common.retry', 'Retry')}
                  </button>
                </div>
              ) : profiles.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {t('profiles.noProfiles', 'No profiles yet')}
                </div>
              ) : (
                <div className="py-1">
                  {profiles.map((profile) => (
                    <div
                      key={profile.profile_id}
                      onClick={() => handleSelect(profile)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                        "hover:bg-gray-50",
                        activeProfile?.profile_id === profile.profile_id && "bg-blue-50"
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        activeProfile?.profile_id === profile.profile_id 
                          ? "bg-system-blue text-white" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        <span className="text-sm font-medium">
                          {profile.profile_name?.[0]?.toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          activeProfile?.profile_id === profile.profile_id 
                            ? "font-medium text-system-blue" 
                            : "text-gray-900"
                        )}>
                          {profile.profile_name}
                        </p>
                        {profile.writing_style && (
                          <p className="text-xs text-gray-500 truncate">
                            {profile.writing_style}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(profile)
                              setIsOpen(false)
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(profile.profile_id, e)}
                          disabled={deleteProfile.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Active indicator */}
                      {activeProfile?.profile_id === profile.profile_id && (
                        <svg className="w-5 h-5 text-system-blue shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {onCreateNew && (
              <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    onCreateNew()
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg",
                    "text-sm font-medium text-system-blue",
                    "hover:bg-system-blue/10 transition-colors"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('profiles.createNew', 'Create New Profile')}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProfileSelectorV2
