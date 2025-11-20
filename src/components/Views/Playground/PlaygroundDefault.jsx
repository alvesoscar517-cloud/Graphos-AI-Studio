import { useState } from 'react'
import './PlaygroundDefault.css'

const PlaygroundDefault = ({ onToggleLeftSidebar, onCreateNote }) => {
  const [activeTab, setActiveTab] = useState('featured')

  const tabs = [
    { id: 'featured', label: 'Nổi bật' },
    { id: 'analysis', label: 'Phân tích' },
    { id: 'rewrite', label: 'Viết lại' },
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'detection', label: 'Phát hiện' },
    { id: 'stats', label: 'Thống kê' }
  ]

  const models = [
    {
      id: 1,
      icon: 'file-text.svg',
      title: 'Phân tích Văn phong',
      description: 'Tính toán mức độ tương đồng giữa văn bản và hồ sơ văn phong mục tiêu',
      badge: 'New',
      categories: ['featured', 'analysis']
    },
    {
      id: 2,
      icon: 'shield-check.svg',
      title: 'Phát hiện nội dung AI',
      description: 'Ước tính xác suất văn bản được tạo ra bởi mô hình AI',
      categories: ['featured', 'detection']
    },
    {
      id: 3,
      icon: 'edit-3.svg',
      title: 'Viết lại theo Văn phong',
      description: 'Sử dụng AI để viết lại văn bản theo giọng văn thương hiệu',
      badge: 'New',
      categories: ['featured', 'rewrite']
    }
  ]

  const filteredModels = models.filter(model => 
    activeTab === 'featured' || model.categories.includes(activeTab)
  )

  return (
    <div className="playground-default-view">
      <header className="playground-topbar">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Ẩn/hiện sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
        <span className="playground-topbar-title">Playground</span>
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={onCreateNote}
            data-tooltip="Tạo note mới"
          >
            <img src="/icon/plus.svg" alt="New Note" />
          </button>
          <button className="icon-btn" data-tooltip="Chia sẻ">
            <img src="/icon/share-2.svg" alt="Share" />
          </button>
          <button className="icon-btn" data-tooltip="Thêm">
            <img src="/icon/more-vertical.svg" alt="More" />
          </button>
        </div>
      </header>

      <div className="playground-welcome-content">
        <div className="playground-studio-header">
          <h1 className="studio-title">AI Content Authenticator</h1>
        </div>

        <div className="studio-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`studio-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {activeTab === tab.id && <span className="tab-dot"></span>}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="studio-models-list">
          {filteredModels.map(model => (
            <div key={model.id} className="studio-model-item" onClick={onCreateNote}>
              <div className="model-item-icon">
                <img src={`/icon/${model.icon}`} alt={model.title} />
              </div>
              <div className="model-item-content">
                <div className="model-item-header">
                  <h3 className="model-item-title">{model.title}</h3>
                  {model.badge && <span className="model-badge">{model.badge}</span>}
                </div>
                <p className="model-item-description">{model.description}</p>
              </div>
              <div className="model-item-actions">
                <button className="model-action-btn" onClick={(e) => { e.stopPropagation(); }} data-tooltip="Copy">
                  <img src="/icon/copy.svg" alt="Copy" />
                </button>
                <button className="model-action-btn" onClick={(e) => { e.stopPropagation(); onCreateNote(); }} data-tooltip="Open">
                  <img src="/icon/external-link.svg" alt="Open" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlaygroundDefault
