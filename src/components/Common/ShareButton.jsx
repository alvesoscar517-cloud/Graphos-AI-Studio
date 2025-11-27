import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SharePopup from '../Popups/SharePopup'
import './ShareButton.css'

const ShareButton = ({ item, className = '', size = 'medium', tooltip }) => {
  const { t } = useTranslation()
  const [showSharePopup, setShowSharePopup] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    setShowSharePopup(true)
  }

  const tooltipText = tooltip || t('common.share')

  return (
    <>
      {showSharePopup && (
        <SharePopup 
          item={item}
          onClose={() => setShowSharePopup(false)}
        />
      )}
      <button 
        className={`share-button ${className} share-button-${size}`}
        onClick={handleClick}
        data-tooltip={tooltipText}
        data-tooltip-position="top"
      >
        <img src="/icon/share-2.svg" alt={t('common.share')} />
      </button>
    </>
  )
}

export default ShareButton
