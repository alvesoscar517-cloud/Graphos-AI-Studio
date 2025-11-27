import { useTranslation } from 'react-i18next'
import './RewriteModelSelector.css'

const RewriteModelSelector = ({ selectedModel, onModelSelect }) => {
  const { t } = useTranslation()

  const REWRITE_MODELS = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash',
      speed: { icon: '/icon/gauge.svg', text: t('model.veryFast') },
      description: t('model.geminiFlashExp'),
      details: [
        { icon: '/icon/zap.svg', text: t('model.experimental') },
        { icon: '/icon/sparkles.svg', text: t('model.newFeatures') }
      ],
      icon: '/icon/Gemini.svg',
      color: '#ea4335'
    },
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      speed: { icon: '/icon/gauge.svg', text: t('model.ultraFast') },
      description: t('model.geminiFlashLite'),
      details: [
        { icon: '/icon/file-text.svg', text: t('model.shortText') },
        { icon: '/icon/dollar-sign.svg', text: t('model.lowCost') }
      ],
      icon: '/icon/Gemini.svg',
      color: '#34a853'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      speed: { icon: '/icon/gauge.svg', text: t('model.fast') },
      description: t('model.geminiFlash'),
      details: [
        { icon: '/icon/layers.svg', text: t('model.versatile') },
        { icon: '/icon/star.svg', text: t('model.recommended') }
      ],
      icon: '/icon/Gemini.svg',
      color: '#4285f4'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      speed: { icon: '/icon/gauge.svg', text: t('model.slower') },
      description: t('model.geminiPro'),
      details: [
        { icon: '/icon/award.svg', text: t('model.importantText') },
        { icon: '/icon/trending-up.svg', text: t('model.highQuality') }
      ],
      icon: '/icon/Gemini.svg',
      color: '#4285f4'
    }
  ]

  const handleModelClick = (model) => {
    onModelSelect(model.id)
  }

  return (
    <div className="rewrite-model-selector">
      <div className="rewrite-models-list">
        {REWRITE_MODELS.map((model) => (
          <div
            key={model.id}
            className={`rewrite-model-card ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => handleModelClick(model)}
          >
            {selectedModel === model.id && (
              <div className="rewrite-model-indicator"></div>
            )}
            
            <div className="rewrite-model-header">
              <div className="rewrite-model-icon">
                <img src={model.icon} alt={model.name} />
              </div>
              
              <div className="rewrite-model-info">
                <h4>{model.name}</h4>
                <div className="rewrite-model-speed">
                  <img src={model.speed.icon} alt="speed" />
                  <span>{model.speed.text}</span>
                </div>
              </div>
            </div>

            <div className="rewrite-model-desc">
              <img src="/icon/info.svg" alt="info" />
              <span className="rewrite-model-desc-text">{model.description}</span>
            </div>

            <div className="rewrite-model-details">
              {model.details.map((detail, idx) => (
                <div key={idx} className="rewrite-model-detail-item">
                  <img src={detail.icon} alt="" />
                  <span>{detail.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RewriteModelSelector
