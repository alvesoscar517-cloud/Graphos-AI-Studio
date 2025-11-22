import './RewriteModelSelector.css'

const REWRITE_MODELS = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    speed: { icon: '/icon/gauge.svg', text: 'Rất nhanh' },
    description: 'Mô hình thử nghiệm thế hệ 2.0 với tốc độ cao và khả năng đa phương thức',
    details: [
      { icon: '/icon/zap.svg', text: 'Thử nghiệm' },
      { icon: '/icon/sparkles.svg', text: 'Tính năng mới' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#ea4335'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    speed: { icon: '/icon/gauge.svg', text: 'Cực nhanh' },
    description: 'Mô hình nhỏ nhất và tiết kiệm nhất, được xây dựng cho việc sử dụng quy mô lớn',
    details: [
      { icon: '/icon/file-text.svg', text: 'Văn bản ngắn' },
      { icon: '/icon/dollar-sign.svg', text: 'Chi phí thấp' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#34a853'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    speed: { icon: '/icon/gauge.svg', text: 'Nhanh' },
    description: 'Mô hình lai với khả năng suy luận, cửa sổ ngữ cảnh 1M token và ngân sách suy nghĩ',
    details: [
      { icon: '/icon/layers.svg', text: 'Đa năng' },
      { icon: '/icon/star.svg', text: 'Khuyến nghị' }
    ],
    icon: '/icon/Gemini.svg',
    color: '#4285f4'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    speed: { icon: '/icon/gauge.svg', text: 'Chậm hơn' },
    description: 'Mô hình mạnh mẽ nhất với khả năng xử lý phức tạp và chất lượng cao nhất',
    details: [
      { icon: '/icon/award.svg', text: 'Văn bản quan trọng' },
      { icon: '/icon/trending-up.svg', text: 'Chất lượng cao' }
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

// Helper function to convert hex color to CSS filter
function getColorFilter(hexColor) {
  const colorMap = {
    '#34a853': 'invert(58%) sepia(78%) saturate(446%) hue-rotate(81deg) brightness(94%) contrast(87%)',
    '#4285f4': 'invert(38%) sepia(98%) saturate(2618%) hue-rotate(203deg) brightness(95%) contrast(89%)',
    '#ea4335': 'invert(35%) sepia(95%) saturate(2578%) hue-rotate(347deg) brightness(96%) contrast(90%)'
  }
  return colorMap[hexColor] || ''
}

export default RewriteModelSelector
