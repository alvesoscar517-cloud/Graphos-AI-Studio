import { useState, useEffect } from 'react'
import './WritingPreferences.css'

const WritingPreferences = ({ currentProfile, preferences, onPreferencesChange }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences || {
    useVocabularyPreferences: true,
    useKeyCharacteristics: true,
    useSentencePatterns: true,
    useRewriteInstructions: true
  })

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
    }
  }, [preferences])

  const handleToggle = (key) => {
    const updated = { ...localPreferences, [key]: !localPreferences[key] }
    setLocalPreferences(updated)
    onPreferencesChange(updated)
  }

  if (!currentProfile) {
    return null
  }

  const preferenceItems = [
    {
      key: 'useVocabularyPreferences',
      icon: '/icon/book-open.svg',
      title: 'Từ vựng ưa thích',
      description: 'Cụm từ thường dùng, từ nối và từ nên tránh'
    },
    {
      key: 'useKeyCharacteristics',
      icon: '/icon/list.svg',
      title: 'Đặc điểm chính',
      description: 'Các đặc điểm văn phong đã phân tích'
    },
    {
      key: 'useSentencePatterns',
      icon: '/icon/align-left.svg',
      title: 'Cấu trúc câu',
      description: 'Phong cách mở đầu và cấu trúc đặc trưng'
    },
    {
      key: 'useRewriteInstructions',
      icon: '/icon/file-text.svg',
      title: 'Hướng dẫn viết lại',
      description: 'Hướng dẫn viết lại tùy chỉnh'
    }
  ]

  return (
    <div className="wp-container">
      <div className="wp-header">
        <img src="/icon/sliders.svg" alt="Settings" className="wp-header-icon" />
        <h4 className="wp-header-title">TÙY CHỌN NÂNG CAO</h4>
      </div>

      <div className="wp-list">
        {preferenceItems.map((item) => (
          <div key={item.key} className="wp-item">
            <div className="wp-item-left">
              <img src={item.icon} alt={item.title} className="wp-item-icon" />
              <div className="wp-item-content">
                <div className="wp-item-title">{item.title}</div>
                <div className="wp-item-desc">{item.description}</div>
              </div>
            </div>
            <label className="wp-toggle">
              <input
                type="checkbox"
                checked={localPreferences[item.key]}
                onChange={() => handleToggle(item.key)}
                className="wp-toggle-input"
              />
              <span className="wp-toggle-track">
                <span className="wp-toggle-thumb"></span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WritingPreferences
