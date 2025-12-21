/**
 * Avatar Upload Component
 * 
 * Allows email users to upload custom avatars.
 * Google users see their Google profile picture (read-only).
 * 
 * Requirements: 8.1.1, 8.1.2, 8.1.11
 */

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { validateAvatarFile, uploadAvatar, removeAvatar, AVATAR_CONFIG } from '../../services/avatarService'

const AvatarUpload = ({ 
  user, 
  authMethod, 
  onAvatarChange,
  size = 'md' // 'sm' | 'md' | 'lg'
}) => {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const isGoogleUser = authMethod === 'google'
  const currentAvatar = previewUrl || user?.avatar || user?.picture

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-28 h-28 text-3xl'
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate
    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target.result)
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      const userId = user?.id || user?.uid || user?.userId
      const result = await uploadAvatar(file, userId)
      
      if (result.success) {
        onAvatarChange?.(result.avatarUrl)
      } else {
        setError(result.error)
        setPreviewUrl(null)
      }
    } catch (err) {
      setError(err.message)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    setError(null)
    setIsUploading(true)
    
    try {
      const userId = user?.id || user?.uid || user?.userId
      const result = await removeAvatar(userId)
      
      if (result.success) {
        setPreviewUrl(null)
        onAvatarChange?.(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Display */}
      <div className="relative group">
        <div className={cn(
          "rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark",
          "flex items-center justify-center text-white font-semibold",
          "ring-2 ring-border ring-offset-2 ring-offset-bg-primary",
          sizeClasses[size]
        )}>
          {currentAvatar ? (
            <img 
              src={currentAvatar} 
              alt={user?.name || 'Avatar'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </div>

        {/* Upload overlay - only for email users */}
        {!isGoogleUser && (
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-black/50 opacity-0 group-hover:opacity-100",
              "flex items-center justify-center",
              "transition-opacity duration-200",
              "cursor-pointer",
              isUploading && "opacity-100"
            )}
          >
            {isUploading ? (
              <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
          </button>
        )}

        {/* Google badge for Google users */}
        {isGoogleUser && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-bg-secondary border border-border flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_CONFIG.ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Actions - only for email users */}
      {!isGoogleUser && (
        <div className="flex items-center gap-2">
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg",
              "bg-primary/10 text-primary",
              "hover:bg-primary/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          >
            {t('profile.changePhoto', 'Change photo')}
          </button>
          
          {(currentAvatar && currentAvatar !== user?.picture) && (
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg",
                "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                "hover:bg-red-200 dark:hover:bg-red-900/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              {t('profile.removePhoto', 'Remove')}
            </button>
          )}
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-text-muted text-center max-w-48">
        {isGoogleUser 
          ? t('profile.googlePhotoInfo', 'Photo from your Google account')
          : t('profile.uploadInfo', `JPG, PNG or GIF. Max ${AVATAR_CONFIG.MAX_SIZE_MB}MB`)
        }
      </p>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}

export default AvatarUpload
