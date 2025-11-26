/**
 * Step 3: Short Text Samples
 */
import LottieWrapper from '../LottieWrapper'
import contactMailAnimation from '../../../animation/contact-mail.json'

const Step3ShortSamples = ({
  animationKey,
  shortText,
  setShortText,
  samples,
  shortTextWordCount,
  currentSampleIndex,
  setCurrentSampleIndex,
  isEditingMode,
  setIsEditingMode,
  onAddSample,
  onNavigateSample,
  onBack,
  onNext,
  MIN_SAMPLES,
  MAX_SAMPLES,
  MIN_SAMPLE_WORDS,
  MAX_SAMPLE_WORDS
}) => {
  const canAddMore = !isEditingMode && samples.length < MAX_SAMPLES
  const isValidWordCount = shortTextWordCount >= MIN_SAMPLE_WORDS && shortTextWordCount <= MAX_SAMPLE_WORDS

  return (
    <div className="step-content active">
      <div className="content-wrapper">
        <div className="animation-container">
          <LottieWrapper key={`step3-${animationKey}`} animationData={contactMailAnimation} loop={true} />
        </div>
        <div className="form-container">
          <div className="step3-form-content">
            <h1 className="step-title">Provide Short Text Samples</h1>
            <p className="step-description">
              Provide {MIN_SAMPLES}-{MAX_SAMPLES} short text samples ({MIN_SAMPLE_WORDS}-{MAX_SAMPLE_WORDS} words) like emails, messages so AI learns how you greet, use words, and express emotions.
            </p>
            
            <div className="modern-textarea-container">
              <textarea
                id="shortText"
                placeholder={samples.length >= MAX_SAMPLES && !isEditingMode 
                  ? `Reached ${MAX_SAMPLES} sample limit. Click checkmark to edit samples.` 
                  : "Paste your email or message samples here..."}
                rows="8"
                value={shortText}
                onChange={(e) => setShortText(e.target.value)}
                disabled={samples.length >= MAX_SAMPLES && !isEditingMode}
              />

              <div className="sample-action-buttons">
                {isEditingMode && (
                  <button 
                    className="btn btn-secondary cancel-edit-btn"
                    onClick={() => {
                      setShortText('')
                      setIsEditingMode(false)
                      setCurrentSampleIndex(-1)
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </button>
                )}
                <button 
                  className="btn btn-primary add-sample-btn"
                  disabled={!shortText.trim() || !canAddMore && !isEditingMode || !isValidWordCount}
                  onClick={onAddSample}
                >
                  {isEditingMode ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Cập nhật mẫu
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {samples.length >= MAX_SAMPLES ? `[COMPLETE] ${MAX_SAMPLES} samples` : 'Add Sample'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="sample-progress-smart">
              <button 
                className="sample-nav-btn"
                onClick={() => onNavigateSample('prev')}
                disabled={samples.length === 0}
                title="View previous sample"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="sample-progress-center">
                <div className="sample-progress-text">
                  {isEditingMode ? (
                    <>Viewing: <span>Sample #{currentSampleIndex + 1}</span> / {samples.length}</>
                  ) : (
                    <>Progress: <span>{samples.length}</span> / {MIN_SAMPLES} minimum samples</>
                  )}
                </div>
                <div className="sample-checkmarks-modern">
                  {Array.from({ length: Math.max(MIN_SAMPLES, samples.length) }, (_, i) => i).map(i => (
                    <button 
                      key={i}
                      className={`checkmark-btn ${i < samples.length ? 'completed' : ''} ${isEditingMode && i === currentSampleIndex ? 'active' : ''}`}
                      disabled={i >= samples.length}
                      onClick={() => {
                        if (i < samples.length) {
                          setCurrentSampleIndex(i)
                          setShortText(samples[i])
                          setIsEditingMode(true)
                        }
                      }}
                      title={i < samples.length ? `View sample #${i + 1}` : ''}
                    >
                      {isEditingMode && i === currentSampleIndex ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="sample-nav-btn"
                onClick={() => onNavigateSample('next')}
                disabled={samples.length === 0}
                title="View next sample"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div className="button-group">
              <button className="btn btn-secondary" onClick={onBack}>Back</button>
              <button 
                className="btn btn-primary"
                disabled={samples.length < MIN_SAMPLES}
                onClick={onNext}
              >
                Next
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

export default Step3ShortSamples
