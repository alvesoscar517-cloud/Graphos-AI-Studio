import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SharePopup from '../Popups/SharePopup'
import { cn } from '../../lib/utils'

const ShareButton = ({ item, className = '', size = 'medium', tooltip }) => {
  const { t } = useTranslation()
  const [showSharePopup, setShowSharePopup] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    setShowSharePopup(true)
  }

  const tooltipText = tooltip || t('common.share')

  const sizeClasses = {
    small: 'w-7 h-7 p-1.5 [&_img]:w-3.5 [&_img]:h-3.5',
    medium: 'w-8 h-8 p-2',
    large: 'w-10 h-10 p-2.5 [&_img]:w-[18px] [&_img]:h-[18px]'
  }

  return (
    <>
      {showSharePopup && (
        <SharePopup 
          item={item}
          onClose={() => setShowSharePopup(false)}
        />
      )}
      <button 
        className={cn(
          "bg-transparent border border-border-hover rounded-lg",
          "cursor-pointer transition-all duration-200",
          "flex items-center justify-center text-text-secondary",
          "hover:bg-bg-secondary hover:border-primary hover:-translate-y-0.5",
          "active:translate-y-0",
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        data-tooltip={tooltipText}
        data-tooltip-position="top"
      >
        <img 
          src="/icon/share-2.svg" 
          alt={t('common.share')} 
          className="w-4 h-4 opacity-70 transition-opacity duration-200 hover:opacity-100 icon-invert"
        />
      </button>
    </>
  )
}

export default ShareButton
