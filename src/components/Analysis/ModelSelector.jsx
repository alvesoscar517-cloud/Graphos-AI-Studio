import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

import { Zap, Layers, Star, Briefcase, Award } from 'lucide-react'

// Tag icon mapping
const TAG_ICONS = {
  'zap': Zap,
  'layers': Layers,
  'star': Star,
  'briefcase': Briefcase,
  'award': Award,
}

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)

  const MODELS = [
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Graphos Velocity',
      speed: t('model.ultraFast'),
      description: t('model.velocityDesc'),
      tags: [
        { label: t('model.shortText'), icon: 'zap' },
        { label: t('model.lowCost'), icon: 'zap' }
      ],
      iconName: 'audio-lines'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Graphos Hyper',
      speed: t('model.fast'),
      description: t('model.hyperDesc'),
      tags: [
        { label: t('model.versatile'), icon: 'layers' },
        { label: t('model.recommended'), icon: 'star' }
      ],
      iconName: 'audio-lines'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Graphos Zenith',
      speed: t('model.slower'),
      description: t('model.zenithDesc'),
      tags: [
        { label: t('model.importantText'), icon: 'briefcase' },
        { label: t('model.highQuality'), icon: 'award' }
      ],
      iconName: 'audio-lines'
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
        className={cn("bg-bg-secondary border border-border-light rounded-xl","py-3 px-3 pb-2 cursor-pointer transition-all duration-200","flex flex-col items-center text-center gap-1","hover:border-border-hover hover:shadow-md"
        )}
        onClick={() => setShowModal(true)}
      >
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="card-icon !w-12 !h-12">
            <Icon name={currentModel.iconName} alt="Model" size="lg" color="primary" />
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            <h3 className="text-xs font-medium text-text-primary m-0 leading-tight">{currentModel.name}</h3>
            <p className="text-xs text-text-secondary m-0 flex items-center justify-center gap-1">
              <Icon name="gauge" alt={t('common.speed')} size="sm" color="muted" />
              {currentModel.speed}
            </p>
          </div>
        </div>
        <Icon name="chevron-down" alt={t('common.select')} size="sm" color="muted" />
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-modal-nested animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-bg-primary border border-border rounded-3xl w-full max-w-lg flex flex-col shadow-modal animate-slide-up overflow-hidden max-md:max-w-[calc(100%-32px)] max-md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-5 px-6 max-md:py-4 max-md:px-4 shrink-0">
              <h2 className="text-lg font-medium text-text-primary m-0">{t('model.selectAIModel')}</h2>
              <button 
                className="bg-transparent border-none p-2 cursor-pointer rounded-full flex items-center justify-center hover:bg-bg-tertiary"
                onClick={() => setShowModal(false)}
              >
                <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
              </button>
            </div>

            {/* Models List - No scroll, fit all 3 models */}
            <div className="flex flex-col gap-3 px-4 pb-4 max-md:gap-2 max-md:px-3 max-md:pb-3">
              {MODELS.map(model => (
                <div
                  key={model.id}
                  className={cn("bg-bg-primary border border-border-light rounded-xl","p-4 cursor-pointer transition-all duration-200 relative flex flex-col gap-2.5","hover:border-border-hover hover:shadow-sm","max-md:p-3 max-md:gap-2"
                  )}
                  onClick={() => handleSelectModel(model)}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 max-md:gap-2">
                    <div className="card-icon !w-11 !h-11 max-md:!w-10 max-md:!h-10">
                      <Icon name={model.iconName} alt={model.name} size="lg" color="primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-md font-semibold text-text-primary m-0 mb-1 flex items-center gap-2 max-md:text-sm max-md:gap-1.5 max-md:flex-wrap">
                        {model.name}
                        {selectedModel === model.id && (
                          <span className="inline-flex items-center gap-0.5 py-0.5 px-1.5 bg-primary/15 text-primary rounded-md text-[8px] font-medium uppercase tracking-wide">
                            {t('model.inUse')}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Icon name="gauge" alt={t('common.speed')} size="xs" color="muted" />
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
                    {model.tags.map((tag, idx) => {
                      const TagIcon = TAG_ICONS[tag.icon] || Zap
                      return (
                      <span 
                        key={idx} 
                        className="flex items-center gap-1 py-0.5 px-1.5 bg-bg-secondary border border-border-light rounded-md text-[10px] text-text-muted"
                      >
                        <TagIcon size={12} className="opacity-70" />
                        {tag.label}
                      </span>
                    )})}
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
