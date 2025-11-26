/**
 * Step 1: Profile Name and Theme Selection
 */
import LottieWrapper from '../LottieWrapper'
import { THEMES } from '../hooks/useProfileSetup'
import loaderCatAnimation from '../../../animation/loader-cat.json'

const Step1NameTheme = ({
  animationKey,
  profileName,
  setProfileName,
  selectedTheme,
  setSelectedTheme,
  onNext,
  onCancel,
  isCancelling
}) => {
  return (
    <div className="step-content active">
      <div className="content-wrapper">
        <div className="animation-container">
          <LottieWrapper key={`step1-${animationKey}`} animationData={loaderCatAnimation} loop={true} />
        </div>
        <div className="form-container">
          <div className="step1-form-content">
            <h1 className="step-title">Start Refining Your Writing Style</h1>
            <p className="step-description">
              Set an easy-to-remember name. You can create multiple profiles (in Premium plan) to switch between different writing styles.
            </p>

            <div className="input-group">
              <label htmlFor="profileName">Tên Hồ sơ</label>
              <input
                type="text"
                id="profileName"
                placeholder="Ví dụ: Blog cá nhân, Email cho sếp, Khách hàng B2B..."
                maxLength="50"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <div className="input-hint">Tối đa 50 ký tự</div>
            </div>
            
            <div className="input-group">
              <label id="theme-label">Theme</label>
              <div 
                className="theme-selector-wrapper"
                role="radiogroup"
                aria-labelledby="theme-label"
              >
                <div className="theme-selector-grid">
                  {THEMES.map((theme, index) => (
                    <button
                      key={theme.id}
                      className={`theme-btn ${selectedTheme === theme.id ? 'theme-selected' : ''}`}
                      data-theme={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      role="radio"
                      aria-checked={selectedTheme === theme.id}
                      aria-label={`Chọn chủ đề ${theme.name}`}
                      tabIndex={selectedTheme === theme.id ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault()
                          const nextIndex = (index + 1) % THEMES.length
                          setSelectedTheme(THEMES[nextIndex].id)
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          e.preventDefault()
                          const prevIndex = (index - 1 + THEMES.length) % THEMES.length
                          setSelectedTheme(THEMES[prevIndex].id)
                        }
                      }}
                    >
                      <img 
                        src={`/icon/${theme.icon}.svg`} 
                        alt=""
                        aria-hidden="true"
                        className="theme-btn-icon"
                      />
                      <span className="theme-btn-label">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-secondary" 
                onClick={onCancel}
                disabled={isCancelling}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                disabled={!profileName.trim() || isCancelling}
                onClick={onNext}
              >
                Tiếp theo
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1NameTheme
