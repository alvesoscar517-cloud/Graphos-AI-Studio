import { useState } from 'react'
import { createPortal } from 'react-dom'
import './ModelSelector.css'

const MODELS = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    speed: 'Very Fast',
    description: 'Mô hình thử nghiệm mới nhất, xử lý nhanh và hỗ trợ nhiều loại nội dung như văn bản, hình ảnh',
    tags: ['Experimental', 'New Features'],
    icon: '/icon/Gemini.svg'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    speed: 'Ultra Fast',
    description: 'Mô hình nhỏ gọn, tiết kiệm chi phí nhất, phù hợp cho các tác vụ đơn giản và xử lý số lượng lớn',
    tags: ['Short Text', 'Low Cost'],
    icon: '/icon/Gemini.svg'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    speed: 'Fast',
    description: 'Mô hình cân bằng giữa tốc độ và chất lượng, có khả năng suy luận tốt, phù hợp cho hầu hết các tác vụ',
    tags: ['Versatile', 'Recommended'],
    icon: '/icon/Gemini.svg'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    speed: 'Slower',
    description: 'Mô hình mạnh nhất, cho kết quả chất lượng cao nhất, phù hợp cho nội dung quan trọng cần độ chính xác cao',
    tags: ['Important Text', 'High Quality'],
    icon: '/icon/Gemini.svg'
  }
]

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const [showModal, setShowModal] = useState(false)

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
        <img src="/icon/chevron-down.svg" alt="Select" className="model-selector-arrow" />
      </div>

      {showModal && createPortal(
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-content model-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select AI Model</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt="Close" />
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
                          <span className="model-modal-badge">[IN USE]</span>
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
                    {model.tags.map((tag, idx) => {
                      const getTagIcon = (tagName) => {
                        const iconMap = {
                          'Experimental': 'zap',
                          'New Features': 'sparkles',
                          'Short Text': 'file-text',
                          'Low Cost': 'dollar-sign',
                          'Versatile': 'layers',
                          'Recommended': 'star',
                          'Important Text': 'file',
                          'High Quality': 'award'
                        }
                        return iconMap[tagName] || 'tag'
                      }
                      
                      return (
                        <span key={idx} className="model-modal-tag">
                          <img src={`/icon/${getTagIcon(tag)}.svg`} alt="" />
                          {tag}
                        </span>
                      )
                    })}
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
