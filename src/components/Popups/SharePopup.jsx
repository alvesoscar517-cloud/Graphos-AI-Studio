import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../../services/api/client'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const SharePopup = ({ item, onClose }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)
  const [shareUrl, setShareUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shareId, setShareId] = useState(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    if (item) {
      createShare()
    }
  }, [item])

  const createShare = async () => {
    setIsLoading(true)
    try {
      const shareData = {
        type: item.type === 'chat' ? 'conversation' : 'note',
        title: item.title,
        content: item.type === 'text' ? item.data.content : null,
        messages: item.type === 'chat' ? item.data.messages : null,
        metadata: {
          createdAt: item.data.created?.toISOString() || item.data.created_at || new Date().toISOString(),
          updatedAt: item.updated.toISOString()
        }
      }

      const { data } = await apiClient.post('/api/share', shareData)
      setShareId(data.shareId)
      setShareUrl(data.shareUrl)
    } catch (error) {
      console.error('Failed to create share:', error)
      modal.error(t('share.unableToCreate'))
      
      // Fallback to demo URL for development
      const mockShareId = 'demo-' + Math.random().toString(36).substr(2, 9)
      setShareId(mockShareId)
      const extensionId = chrome?.runtime?.id || 'your-extension-id'
      setShareUrl(`https://chromewebstore.google.com/detail/ai-content-authenticator/${extensionId}?share=${mockShareId}`)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      modal.toast(t('common.copied'), t('share.linkCopied'), 'success')
    } catch (error) {
      console.error('Failed to copy:', error)
      modal.error(t('share.unableToCopy'))
    }
  }

  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(item.title)
    
    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  if (!item) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-modal backdrop-blur-xs p-5 animate-fade-in">
      <div 
        ref={popupRef}
        className={cn(
          "bg-bg-secondary rounded-4xl w-full max-w-modal-sm",
          "shadow-modal overflow-hidden relative",
          "animate-slide-up"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-lg font-semibold text-text-primary m-0 tracking-tight">
            {t('home.appName')}
          </h2>
          <button 
            onClick={onClose}
            className={cn(
              "bg-transparent border-none w-8 h-8 rounded-full",
              "flex items-center justify-center cursor-pointer transition-all duration-150",
              "text-text-secondary shrink-0",
              "hover:bg-bg-hover"
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-3 pb-7">
          <h3 className="text-text-secondary text-md font-normal m-0 mb-5 tracking-tight">
            {t('share.shareThisItem')}
          </h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className={cn(
                "w-10 h-10 border-4 border-border",
                "border-t-accent rounded-full",
                "animate-spin"
              )} />
              <p className="text-text-secondary text-sm m-0">
                {t('share.creatingLink')}
              </p>
            </div>
          ) : (
            <>
              {/* Social Buttons */}
              <div className="flex gap-3 justify-start mb-6">
                <button 
                  onClick={() => shareToSocial('linkedin')}
                  data-tooltip="LinkedIn"
                  data-tooltip-position="bottom"
                  className={cn(
                    "w-share-btn h-share-btn border-none rounded-3xl",
                    "flex items-center justify-center cursor-pointer",
                    "transition-all duration-150 shadow-sm",
                    "bg-linkedin hover:scale-105 hover:shadow-md",
                    "active:scale-[0.98]"
                  )}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => shareToSocial('facebook')}
                  data-tooltip="Facebook"
                  data-tooltip-position="bottom"
                  className={cn(
                    "w-share-btn h-share-btn border-none rounded-3xl",
                    "flex items-center justify-center cursor-pointer",
                    "transition-all duration-150 shadow-sm",
                    "bg-facebook hover:scale-105 hover:shadow-md",
                    "active:scale-[0.98]"
                  )}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => shareToSocial('reddit')}
                  data-tooltip="Reddit"
                  data-tooltip-position="bottom"
                  className={cn(
                    "w-share-btn h-share-btn border-none rounded-3xl",
                    "flex items-center justify-center cursor-pointer",
                    "transition-all duration-150 shadow-sm",
                    "bg-reddit hover:scale-105 hover:shadow-md",
                    "active:scale-[0.98]"
                  )}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => shareToSocial('twitter')}
                  data-tooltip="X"
                  data-tooltip-position="bottom"
                  className={cn(
                    "w-share-btn h-share-btn border-none rounded-3xl",
                    "flex items-center justify-center cursor-pointer",
                    "transition-all duration-150 shadow-sm",
                    "bg-toast-bg hover:scale-105 hover:shadow-md",
                    "active:scale-[0.98]"
                  )}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => shareToSocial('whatsapp')}
                  data-tooltip="WhatsApp"
                  data-tooltip-position="bottom"
                  className={cn(
                    "w-share-btn h-share-btn border-none rounded-3xl",
                    "flex items-center justify-center cursor-pointer",
                    "transition-all duration-150 shadow-sm",
                    "bg-whatsapp hover:scale-105 hover:shadow-md",
                    "active:scale-[0.98]"
                  )}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </button>
              </div>

              {/* URL Container */}
              <div className="flex gap-2 bg-bg-primary p-1 rounded-xl items-center max-sm:flex-col">
                <input 
                  type="text" 
                  value={shareUrl}
                  readOnly
                  className={cn(
                    "flex-1 border-none bg-transparent px-3.5 py-2.5",
                    "text-sm text-text-primary outline-none",
                    "font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',system-ui,sans-serif]",
                    "max-sm:w-full"
                  )}
                />
                <button 
                  onClick={copyToClipboard}
                  className={cn(
                    "bg-apple-blue text-white border-none px-5 py-2.5 rounded-lg",
                    "text-sm font-medium cursor-pointer transition-all duration-150",
                    "whitespace-nowrap flex items-center gap-1.5",
                    "hover:bg-apple-blue-hover active:scale-[0.96]",
                    "max-sm:w-full max-sm:justify-center"
                  )}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  {t('common.copy')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SharePopup
