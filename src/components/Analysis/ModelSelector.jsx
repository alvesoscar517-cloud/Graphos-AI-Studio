import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import './ModelSelector.css'

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)

  const MODELS = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash',
      speed: t('model.veryFast'),
      description: t('model.geminiFlashExp'),
      tags: [t('model.experimental'), t('model.newFeatures')],
      icon: '/icon/Gemini.svg'
    },
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      speed: t('model.ultraFast'),
      description: t('model.geminiFlashLite'),
      tags: [t('model.shortText'), t('model.lowCost')],
      icon: '/icon/Gemini.svg'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      speed: t('model.fast'),
      description: t('model.geminiFlash'),
      tags: [t('model.versatile'), t('model.recommended')],
      icon: '/icon/Gemini.svg'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      speed: t('model.slower'),
      description: t('model.geminiPro'),
      tags: [t('model.importantText'), t('model.highQuality')],
      icon: '/icon/Gemini.svg'
    }
  ]

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  const handleSelectModel = (model) => {
    onModelSelect(model.id)
    setShowModal(false)
  }

  return (
    <>
      <div className="model-selector clickable" onClick={() => setShowModal(true)}>
        <div className="model-selector-header">
          <div className="model-selector-icon">
            <img src={currentModel.icon} alt="Model" />
          </div>
          <div className="model-selector-info">
            <h3>{currentModel.name}</h3>
            <p className="model-id">
              <img src="/icon/gauge.svg" alt="Speed" />
              {currentModel.speed}
            </p>
          </div>
        </div>
        <img src="/icon/chevron-down.svg" alt={t('common.select')} className="model-selector-arrow" />
      </div>

      {showModal && createPortal(
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-content model-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('model.selectAIModel')}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt={t('common.close')} />
              </button>
            </div>

            <div className="modal-models-list">
              {MODELS.map(model => (
                <div
                  key={model.id}
                  className={`model-modal-card ${selectedModel === model.id ? 'selected' : ''}`}
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="model-modal-header">
                    <div className="model-modal-icon">
                      <img src={model.icon} alt={model.name} />
                    </div>
                    <div className="model-modal-info">
                      <h3>
                        {model.name}
                        {selectedModel === model.id && (
                          <span className="model-modal-badge">{t('model.inUse')}</span>
                        )}
                      </h3>
                      <div className="model-modal-speed">
                        <img src="/icon/gauge.svg" alt="speed" />
                        <span>{model.speed}</span>
                      </div>
                    </div>
                  </div>

                  <div className="model-modal-desc">
                    <img src="/icon/info.svg" alt="info" />
                    <span>{model.description}</span>
                  </div>

                  <div className="model-modal-tags">
                    {model.tags.map((tag, idx) => (
                      <span key={idx} className="model-modal-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default ModelSelector
