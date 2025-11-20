import { useEffect, useRef } from 'react'
import './ProfileDetailPopup.css'

const ProfileDetailPopup = ({ profile, onClose, onUse }) => {
  const popupRef = useRef(null)

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

  if (!profile) return null

  const stats = profile.statistics || {}
  const voiceProfile = profile.voice_profile || {}
  const vocabPrefs = voiceProfile.vocabulary_preferences || {}
  const sentencePatterns = voiceProfile.sentence_patterns || {}

  // Format tone
  const formatTone = (tone) => {
    const toneMap = {
      'professional': 'Chuyên nghiệp',
      'casual': 'Thân mật',
      'academic': 'Học thuật',
      'creative': 'Sáng tạo',
      'friendly': 'Thân thiện',
      'formal': 'Trang trọng',
      'neutral': 'Trung lập'
    }
    return toneMap[tone] || tone
  }

  // Format sentence length
  const formatSentenceLength = (length) => {
    const lengthMap = {
      'short': 'Ngắn',
      'medium': 'Trung bình',
      'long': 'Dài'
    }
    return lengthMap[length] || length
  }

  // Format structure preference
  const formatStructure = (structure) => {
    const structureMap = {
      'simple': 'Đơn giản',
      'complex': 'Phức tạp',
      'varied': 'Đa dạng'
    }
    return structureMap[structure] || structure
  }

  return (
    <div className="profile-detail-overlay">
      <div className="profile-detail-popup" ref={popupRef}>
        <div className="profile-detail-header">
          <div className="profile-detail-title-section">
            <h2>{profile.profile_name}</h2>
            <span className={`profile-status-badge ${profile.status}`}>
              {profile.status === 'ready' ? 'Sẵn sàng' : 'Đang xử lý'}
            </span>
          </div>
          <button className="profile-detail-close" onClick={onClose}>
            <img src="/icon/x.svg" alt="Close" />
          </button>
        </div>

        <div className="profile-detail-content">
          {/* Overview Section */}
          <section className="profile-detail-section">
            <h3>
              <img src="/icon/info.svg" alt="Info" />
              Tổng quan
            </h3>
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span className="label">Số lượng mẫu</span>
                <span className="value">{profile.sample_count || 0} mẫu</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Tổng số từ</span>
                <span className="value">{stats.totalWords?.toLocaleString() || 0} từ</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Tổng số câu</span>
                <span className="value">{stats.totalSentences?.toLocaleString() || 0} câu</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Ngày tạo</span>
                <span className="value">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
            </div>
          </section>

          {/* Statistical Features */}
          <section className="profile-detail-section">
            <h3>
              <img src="/icon/bar-chart.svg" alt="Stats" />
              Đặc điểm thống kê
            </h3>
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span className="label">Độ dài từ TB</span>
                <span className="value">{stats.avgWordLength?.toFixed(2) || 0} ký tự</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Độ dài câu TB</span>
                <span className="value">{stats.avgSentenceLength?.toFixed(1) || 0} từ</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Độ phong phú từ vựng</span>
                <span className="value">{((stats.vocabularyRichness || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Tỷ lệ dấu câu</span>
                <span className="value">{((stats.punctuationRatio || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Điểm dễ đọc (Flesch)</span>
                <span className="value">{stats.readabilityScore?.toFixed(0) || 0}/100</span>
              </div>
            </div>
          </section>

          {/* Voice Profile */}
          {voiceProfile.tone && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/mic.svg" alt="Voice" />
                Phong cách văn phong
              </h3>
              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <span className="label">Giọng văn</span>
                  <span className="value">{formatTone(voiceProfile.tone)}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Mức độ trang trọng</span>
                  <span className="value">{voiceProfile.formality_level || 0}/10</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Độ dài câu</span>
                  <span className="value">{formatSentenceLength(sentencePatterns.typical_length)}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Cấu trúc</span>
                  <span className="value">{formatStructure(sentencePatterns.structure_preference)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Key Characteristics */}
          {voiceProfile.key_characteristics && voiceProfile.key_characteristics.length > 0 && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/list.svg" alt="Characteristics" />
                Đặc điểm chính
              </h3>
              <ul className="profile-characteristics-list">
                {voiceProfile.key_characteristics.map((char, index) => (
                  <li key={index}>
                    <img src="/icon/check-circle.svg" alt="Check" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Vocabulary Preferences */}
          {(vocabPrefs.common_phrases?.length > 0 || vocabPrefs.preferred_connectors?.length > 0) && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/book-open.svg" alt="Vocabulary" />
                Từ vựng ưa thích
              </h3>
              
              {vocabPrefs.common_phrases?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>Cụm từ thường dùng</h4>
                  <div className="profile-tags">
                    {vocabPrefs.common_phrases.map((phrase, index) => (
                      <span key={index} className="profile-tag">{phrase}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.preferred_connectors?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>Từ nối ưa thích</h4>
                  <div className="profile-tags">
                    {vocabPrefs.preferred_connectors.map((connector, index) => (
                      <span key={index} className="profile-tag">{connector}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.avoid_words?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>Từ nên tránh</h4>
                  <div className="profile-tags avoid">
                    {vocabPrefs.avoid_words.map((word, index) => (
                      <span key={index} className="profile-tag avoid">{word}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Rewrite Instructions */}
          {voiceProfile.rewrite_instructions && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/file-text.svg" alt="Instructions" />
                Hướng dẫn viết lại
              </h3>
              <div className="profile-instructions">
                <p>{voiceProfile.rewrite_instructions}</p>
              </div>
            </section>
          )}

          {/* Opening Style */}
          {sentencePatterns.opening_style && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/align-left.svg" alt="Opening" />
                Phong cách mở đầu
              </h3>
              <div className="profile-instructions">
                <p>{sentencePatterns.opening_style}</p>
              </div>
            </section>
          )}
        </div>

        <div className="profile-detail-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
          {onUse && profile.status === 'ready' && (
            <button className="btn-primary" onClick={onUse}>
              <img src="/icon/check.svg" alt="Use" />
              Sử dụng hồ sơ này
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileDetailPopup
