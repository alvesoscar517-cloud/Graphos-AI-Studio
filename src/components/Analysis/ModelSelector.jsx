import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import Icon from '../Common/Icon'
import { cn } from '../../lib/utils'

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)

  const MODELS = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash',
      speed: t('model.veryFast'),
      description: t('model.geminiFlashExp'),
      tags: [
        { label: t('model.experimental'), icon: 'flask-conical' },
        { label: t('model.newFeatures'), icon: 'sparkles' }
      ],
      icon: '/icon/Gemini.svg'
    },
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      speed: t('model.ultraFast'),
      description: t('model.geminiFlashLite'),
      tags: [
        { label: t('model.shortText'), icon: 'file-text' },
        { label: t('model.lowCost'), icon: 'coins' }
      ],
      icon: '/icon/Gemini.svg'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      speed: t('model.fast'),
      description: t('model.geminiFlash'),
      tags: [
        { label: t('model.versatile'), icon: 'layers' },
        { label: t('model.recommended'), icon: 'star' }
      ],
      icon: '/icon/Gemini.svg'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      speed: t('model.slower'),
      description: t('model.geminiPro'),
      tags: [
        { label: t('model.importantText'), icon: 'file-check' },
        { label: t('model.highQuality'), icon: 'award' }
      ],
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
      {/* Selector Card */}
      <div 
        className={cn(
          "bg-bg-secondary border border-border-light rounded-xl",
          "py-3 px-3 pb-2 cursor-pointer transition-all duration-200",
          "flex flex-col items-center text-center gap-1",
          "hover:border-border-hover hover:shadow-md"
        )}
        onClick={() => setShowModal(true)}
      >
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="card-icon !w-12 !h-12">
            <img src={currentModel.icon} alt="Model" className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            <h3 className="text-xs font-medium text-text-primary m-0 leading-tight">{currentModel.name}</h3>
            <p className="text-xs text-text-secondary m-0 flex items-center justify-center gap-1">
              <Icon name="gauge" alt="Speed" size="sm" color="muted" />
              {currentModel.speed}
            </p>
          </div>
        </div>
        <Icon name="chevron-down" alt={t('common.select')} size="sm" color="muted" />
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal-nested animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-bg-primary rounded-3xl w-full max-w-lg h-[600px] flex flex-col shadow-modal animate-slide-up overflow-hidden max-md:max-w-[calc(100%-32px)] max-md:h-[80vh] max-md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-5 px-6 max-md:py-4 max-md:px-4">
              <h2 className="text-lg font-medium text-text-primary m-0">{t('model.selectAIModel')}</h2>
              <button 
                className="bg-transparent border-none p-2 cursor-pointer rounded-full flex items-center justify-center hover:bg-bg-tertiary"
                onClick={() => setShowModal(false)}
              >
                <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
              </button>
            </div>

            {/* Models List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 pb-4 max-md:gap-2 max-md:px-3 max-md:pb-3">
              {MODELS.map(model => (
                <div
                  key={model.id}
                  className={cn(
                    "bg-bg-primary border border-border-light rounded-xl",
                    "p-4 cursor-pointer transition-all duration-200 relative flex flex-col gap-2.5",
                    "hover:border-border-hover hover:shadow-sm",
                    "max-md:p-3 max-md:gap-2"
                  )}
                  onClick={() => handleSelectModel(model)}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 max-md:gap-2">
                    <div className="card-icon !w-10 !h-10 max-md:!w-9 max-md:!h-9">
                      <img src={model.icon} alt={model.name} className="w-5 h-5 max-md:w-4 max-md:h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-md font-semibold text-text-primary m-0 mb-1 flex items-center gap-2 max-md:text-sm max-md:gap-1.5 max-md:flex-wrap">
                        {model.name}
                        {selectedModel === model.id && (
                          <span className="inline-flex items-center gap-0.5 py-0.5 px-1.5 bg-primary/15 text-primary rounded-md text-[9px] font-medium uppercase">
                            {t('model.inUse')}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Icon name="gauge" alt="speed" size="xs" color="muted" />
                        <span className="leading-none">{model.speed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed py-2.5 px-3 bg-bg-secondary rounded-lg">
                    <Icon name="info" alt="info" size="xs" color="muted" className="flex-shrink-0 mt-[3px]" />
                    <span>{model.description}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {model.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="flex items-center gap-1 py-0.5 px-1.5 bg-bg-secondary border border-border-light rounded-md text-[10px] text-text-muted"
                      >
                        <Icon name={tag.icon} alt={tag.label} size="xs" color="muted" />
                        {tag.label}
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
