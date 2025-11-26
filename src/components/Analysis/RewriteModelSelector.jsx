import './RewriteModelSelector.css'

const REWRITE_MODELS = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    speed: { icon: '/icon/gauge.svg', text: 'Very Fast' },
    description: 'Mô hình thử nghiệm mới nhất, xử lý nhanh và hỗ trợ nhiều loại nội dung như văn bản, hình ảnh',
    details: [
      { icon: '/icon/zap.svg', text: 'Experimental' },
      { icon: '/icon/sparkles.svg', text: 'New Features' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#ea4335'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    speed: { icon: '/icon/gauge.svg', text: 'Ultra Fast' },
    description: 'Mô hình nhỏ gọn, tiết kiệm chi phí nhất, phù hợp cho các tác vụ đơn giản và xử lý số lượng lớn',
    details: [
      { icon: '/icon/file-text.svg', text: 'Short Text' },
      { icon: '/icon/dollar-sign.svg', text: 'Low Cost' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#34a853'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    speed: { icon: '/icon/gauge.svg', text: 'Fast' },
    description: 'Mô hình cân bằng giữa tốc độ và chất lượng, có khả năng suy luận tốt, phù hợp cho hầu hết các tác vụ',
    details: [
      { icon: '/icon/layers.svg', text: 'Versatile' },
      { icon: '/icon/star.svg', text: 'Recommended' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#4285f4'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    speed: { icon: '/icon/gauge.svg', text: 'Slower' },
    description: 'Mô hình mạnh nhất, cho kết quả chất lượng cao nhất, phù hợp cho nội dung quan trọng cần độ chính xác cao',
    details: [
      { icon: '/icon/award.svg', text: 'Important Text' },
      { icon: '/icon/trending-up.svg', text: 'High Quality' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#4285f4'
  }
]

const RewriteModelSelector = ({ selectedModel, onModelSelect }) => {
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
