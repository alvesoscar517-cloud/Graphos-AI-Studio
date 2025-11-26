import './ProfileCard.css'

const ProfileCard = ({ profile, onSelect, onUse }) => {
  // Theme icon mapping
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
  
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Hôm nay'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div 
      className="profile-card" 
      onClick={() => onSelect(profile)}
    >
      <div className="profile-card-header">
        <div className={`profile-card-icon theme-icon-${profile.theme || 'work'}`}>
          <img src={`/icon/${getThemeIcon(profile.theme)}.svg`} alt={profile.profile_name} />
        </div>
      </div>
      
      <h4 className="profile-card-title">{profile.profile_name}</h4>
      
      <div className="profile-card-meta">
        <div className="profile-card-meta-item">
          <img src="/icon/file-text.svg" alt="Samples" />
          <span>{profile.sample_count || 0} mẫu</span>
        </div>
        <div className="profile-card-meta-item">
          <img src="/icon/type.svg" alt="Words" />
          <span>{formatNumber(profile.total_words || 0)} words</span>
        </div>
      </div>

      <div className="profile-card-stats">
        <div className="profile-stat">
          <span className="profile-stat-label">SCORE</span>
          <span className={`profile-stat-value quality-score-${profile.quality_rating || 'ok'}`}>
            {profile.quality_score || profile.qualityScore || 'N/A'}
          </span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-label">AVG SENTENCE</span>
          <span className="profile-stat-value">
            {profile.statistics?.avg_sentence_length?.toFixed(0) || 
             profile.avg_sentence_length?.toFixed(0) || '0'}
          </span>
        </div>
      </div>

      <div className="profile-card-tags">
        <span className="profile-tag">
          <img src="/icon/briefcase.svg" alt="Office" />
          Office
        </span>
        <span className="profile-tag">
          <img src="/icon/user.svg" alt="Cá nhân" />
          Cá nhân
        </span>
      </div>

      <div className="profile-card-footer">
        <span className="profile-card-updated">
          <img src="/icon/clock.svg" alt="Thời gian" />
          {formatDate(profile.created_at)}
        </span>
        <button 
          className="profile-card-action"
          onClick={(e) => {
            e.stopPropagation()
            if (onUse) {
              onUse(profile)
            } else {
              onSelect(profile)
            }
          }}
        >
          <img src="/icon/play.svg" alt="Use" />
          Use
        </button>
      </div>
    </div>
  )
}

export default ProfileCard
