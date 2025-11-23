import { useState } from 'react'
import { createPortal } from 'react-dom'
import './ModelSelector.css'

const MODELS = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    speed: 'Rất nhanh',
    description: 'Mô hình thử nghiệm thế hệ 2.0 với tốc độ cao và khả năng đa phương thức',
    tags: ['Thử nghiệm', 'Tính năng mới'],
    icon: '/icon/Gemini.svg'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    speed: 'Cực nhanh',
    description: 'Mô hình nhỏ nhất và tiết kiệm nhất, được xây dựng cho việc sử dụng quy mô lớn',
    tags: ['Văn bản ngắn', 'Chi phí thấp'],
    icon: '/icon/Gemini.svg'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    speed: 'Nhanh',
    description: 'Mô hình lai với khả năng suy luận, cửa sổ ngữ cảnh 1M token và ngân sách suy nghĩ',
    tags: ['Đa năng', 'Khuyến nghị'],
    icon: '/icon/Gemini.svg'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    speed: 'Chậm hơn',
    description: 'Mô hình mạnh mẽ nhất với khả năng xử lý phức tạp và chất lượng cao nhất',
    tags: ['Văn bản quan trọng', 'Chất lượng cao'],
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
              <h2>Chọn mô hình AI</h2>
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
                          <span className="model-modal-badge">Đang dùng</span>
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
                          'Thử nghiệm': 'zap',
                          'Tính năng mới': 'sparkles',
                          'Văn bản ngắn': 'file-text',
                          'Chi phí thấp': 'dollar-sign',
                          'Đa năng': 'layers',
                          'Khuyến nghị': 'star',
                          'Văn bản quan trọng': 'file',
                          'Chất lượng cao': 'award'
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
