import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LottieAnimation from '../../Common/LottieAnimation'
import TextScramble from '../../Common/TextScramble'
import '../../Common/TextScramble.css'
import './EmptyProfileCard.css'

const EmptyProfileCard = () => {
  const navigate = useNavigate()
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  const phrases = [
    'Tạo hồ sơ văn phong độc đáo của bạn',
    'Phân tích và hiệu chỉnh nội dung thông minh',
    'Bảo vệ phong cách viết cá nhân',
    'Phát hiện nội dung AI chính xác'
  ]

  useEffect(() => {
    // Chuyển câu mỗi 4.5 giây (1.5s scramble + 3s hiển thị)
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  const handleCreateProfile = () => {
    navigate('/profile-setup')
  }

  return (
    <div className="empty-profile-section">
      <div className="empty-profile-card">
        <div className="empty-card-content">
          <div className="empty-card-left">
            <div className="empty-welcome">
              <h3 className="empty-welcome-title">
                Chào mừng bạn đến với<br />
                <span className="app-name">AI Content Authenticator</span>
              </h3>
            </div>

            <div className="typing-container">
              <div className="typing-icon">
                <img src="/icon/fingerprint.svg" alt="Fingerprint" />
              </div>
              <p className="typing-text">
                <TextScramble 
                  key={currentPhraseIndex} 
                  className="text-scramble"
                >
                  {phrases[currentPhraseIndex]}
                </TextScramble>
              </p>
            </div>

            <button className="create-profile-btn" onClick={handleCreateProfile}>
              <img src="/icon/plus-circle.svg" alt="Create" />
              <span>Tạo hồ sơ đầu tiên</span>
              <img src="/icon/arrow-right.svg" alt="Arrow" className="arrow-icon" />
            </button>
          </div>

          <div className="empty-card-right">
            <div className="animation-container">
              <LottieAnimation 
                animationPath="/animation/FaceID.json"
                width="100%"
                height="100%"
                loop={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyProfileCard
