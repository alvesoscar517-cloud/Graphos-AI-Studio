import { useState } from 'react'
import SharePopup from '../Popups/SharePopup'
import './ShareButton.css'

const ShareButton = ({ item, className = '', size = 'medium', tooltip = 'Share' }) => {
  const [showSharePopup, setShowSharePopup] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    setShowSharePopup(true)
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
        className={`share-button ${className} share-button-${size}`}
        onClick={handleClick}
        data-tooltip={tooltip}
        data-tooltip-position="top"
      >
        <img src="/icon/share-2.svg" alt="Share" />
      </button>
    </>
  )
}

export default ShareButton
