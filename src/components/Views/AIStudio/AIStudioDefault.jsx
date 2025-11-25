import { useState } from 'react'
import './AIStudioDefault.css'

const AIStudioDefault = ({ onToggleLeftSidebar, onCreateNote }) => {
  const [activeTab, setActiveTab] = useState('content')

  const tabs = [
    { id: 'content', label: 'AI Content' },
    { id: 'authenticator', label: 'Authenticator' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'tools', label: 'Tools' }
  ]

  const models = [
    // AI Content tab
    {
      id: 1,
      icon: 'edit-3.svg',
      title: 'Viết lại theo Văn phong',
      description: 'Sử dụng AI để viết lại văn bản theo giọng văn thương hiệu',
      badge: 'New',
      categories: ['content'],
      action: 'rewrite'
    },
    {
      id: 2,
      icon: 'upload.svg',
      title: 'Tải file lên',
      description: 'Tải file .txt, .pdf, .docx lên để phân tích và chỉnh sửa',
      categories: ['content'],
      action: 'upload'
    },
    {
      id: 3,
      icon: 'sliders.svg',
      title: 'Tùy chỉnh viết lại',
      description: 'Điều chỉnh độ sáng tạo, độ dài và phong cách viết lại',
      categories: ['content'],
      action: 'preferences'
    },
    // Authenticator tab
    {
      id: 4,
      icon: 'shield-check.svg',
      title: 'Phát hiện nội dung AI',
      description: 'Ước tính xác suất văn bản được tạo ra bởi mô hình AI',
      categories: ['authenticator'],
      action: 'detect'
    },
    {
      id: 5,
      icon: 'target.svg',
      title: 'Điểm tương thích',
      description: 'Tính toán mức độ tương đồng giữa văn bản và hồ sơ văn phong',
      badge: 'New',
      categories: ['authenticator'],
      action: 'compatibility'
    },
    {
      id: 6,
      icon: 'user.svg',
      title: 'Quản lý Hồ sơ',
      description: 'Tạo và quản lý các hồ sơ văn phong của bạn',
      categories: ['authenticator'],
      action: 'profile'
    },
    // Analysis tab
    {
      id: 7,
      icon: 'alert-triangle.svg',
      title: 'Tìm câu lệch chuẩn',
      description: 'Xác định các câu có độ lệch cao và nhận gợi ý cải thiện',
      categories: ['analysis'],
      action: 'deviation'
    },
    {
      id: 8,
      icon: 'bar-chart-4.svg',
      title: 'Thống kê văn bản',
      description: 'Phân tích độ dễ đọc, độ dài câu, từ vựng và cấu trúc',
      categories: ['analysis'],
      action: 'statistics'
    },
    {
      id: 9,
      icon: 'book-open.svg',
      title: 'Phát hiện từ thường dùng',
      description: 'Tìm các từ, cụm từ đặc trưng trong văn phong của bạn',
      categories: ['analysis'],
      action: 'vocabulary'
    },
    // Workspace tab
    {
      id: 10,
      icon: 'message-square.svg',
      title: 'Chat với AI',
      description: 'Trò chuyện và nhận hỗ trợ từ AI về nội dung của bạn',
      categories: ['workspace'],
      action: 'chat'
    },
    {
      id: 11,
      icon: 'clock.svg',
      title: 'Lịch sử phân tích',
      description: 'Xem lại các phân tích và kết quả đã thực hiện',
      categories: ['workspace'],
      action: 'history'
    },
    {
      id: 12,
      icon: 'share-2.svg',
      title: 'Chia sẻ nội dung',
      description: 'Tạo link chia sẻ công khai cho văn bản của bạn',
      categories: ['workspace'],
      action: 'share'
    },
    // Tools tab
    {
      id: 13,
      icon: 'layers.svg',
      title: 'Chọn mô hình AI',
      description: 'Lựa chọn mô hình AI phù hợp cho việc viết lại',
      categories: ['tools'],
      action: 'model'
    },
    {
      id: 14,
      icon: 'settings.svg',
      title: 'Cài đặt hệ thống',
      description: 'Tùy chỉnh giao diện, ngôn ngữ và các thông số khác',
      categories: ['tools'],
      action: 'settings'
    },
    {
      id: 15,
      icon: 'help-circle.svg',
      title: 'Hướng dẫn & Hỗ trợ',
      description: 'Xem hướng dẫn sử dụng và liên hệ hỗ trợ',
      categories: ['tools'],
      action: 'help'
    }
  ]

  const filteredModels = models.filter(model => 
    model.categories.includes(activeTab)
  )

  const handleModelClick = (model) => {
    // Navigate to editor with specific action
    onCreateNote()
    // You can pass model.action to determine which feature to activate
  }

  return (
    <div className="aistudio-default-view">
      <header className="main-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Ẩn/hiện sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
        <span className="aistudio-topbar-title">AI Studio</span>
        <div className="header-actions">
          <button 
            className="new-btn-bordered" 
            onClick={onCreateNote}
            data-tooltip="Tạo note mới"
          >
            <img src="/icon/plus.svg" alt="New Note" />
            <span>New</span>
          </button>
        </div>
      </header>

      <div className="aistudio-welcome-content">
        <div className="aistudio-studio-header">
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
            <div key={model.id} className="studio-model-item" onClick={() => handleModelClick(model)}>
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
                <button className="model-action-btn" onClick={(e) => { e.stopPropagation(); handleModelClick(model); }} data-tooltip="Open">
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

export default AIStudioDefault
