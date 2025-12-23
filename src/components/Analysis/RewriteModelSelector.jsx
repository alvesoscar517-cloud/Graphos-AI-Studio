import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

import { Briefcase, DollarSign, Gauge, Info, Layers, Star, TrendingUp, Zap } from 'lucide-react'

// Icon mapping for model details
const MODEL_DETAIL_ICONS = {
  'gauge': Gauge,
  'zap': Zap,
  'dollar-sign': DollarSign,
  'layers': Layers,
  'star': Star,
  'briefcase': Briefcase,
  'trending-up': TrendingUp,
}

const RewriteModelSelector = ({ selectedModel, onModelSelect }) => {
  const { t } = useTranslation()

  const REWRITE_MODELS = [
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Graphos Velocity',
      speed: { icon: 'gauge', text: t('model.ultraFast') },
      description: t('model.velocityDesc'),
      details: [
        { icon: 'zap', text: t('model.shortText') },
        { icon: 'dollar-sign', text: t('model.lowCost') }
      ],
      iconName: 'audio-lines'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Graphos Hyper',
      speed: { icon: 'gauge', text: t('model.fast') },
      description: t('model.hyperDesc'),
      details: [
        { icon: 'layers', text: t('model.versatile') },
        { icon: 'star', text: t('model.recommended') }
      ],
      iconName: 'audio-lines'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Graphos Zenith',
      speed: { icon: 'gauge', text: t('model.slower') },
      description: t('model.zenithDesc'),
      details: [
        { icon: 'briefcase', text: t('model.importantText') },
        { icon: 'trending-up', text: t('model.highQuality') }
      ],
      iconName: 'audio-lines'
    }
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {REWRITE_MODELS.map((model) => (
          <div
            key={model.id}
            className={cn("flex flex-col gap-3 p-4","bg-bg-tertiary border border-border-light rounded-lg","cursor-pointer transition-all duration-200 relative","hover:border-border-hover hover:shadow-sm",
              selectedModel === model.id &&"border-border-hover shadow-sm"
            )}
            onClick={() => onModelSelect(model.id)}
          >
            {/* Selected Indicator */}
            {selectedModel === model.id && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary shadow-ring-2 shadow-bg-primary" />
            )}
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="card-icon !w-10 !h-10">
                <Icon name={model.iconName} alt={model.name} size="md" color="primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary m-0 mb-1">{model.name}</h4>
                <div className="flex items-center gap-1.5 text-2xs text-text-muted">
                  {(() => {
                    const SpeedIcon = MODEL_DETAIL_ICONS[model.speed.icon] || Gauge
                    return <SpeedIcon size={14} className="opacity-50" />
                  })()}
                  <span>{model.speed.text}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-2 text-2xs text-text-muted leading-relaxed py-2 px-3 bg-bg-secondary rounded-md">
              <Info size={14} className="opacity-50 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 flex-1">{model.description}</span>
            </div>

            {/* Details */}
            <div className="flex gap-3">
              {model.details.map((detail, idx) => {
                const DetailIcon = MODEL_DETAIL_ICONS[detail.icon] || Info
                return (
                <div key={idx} className="flex items-center gap-1.5 text-2xs text-text-muted flex-1 whitespace-nowrap overflow-hidden">
                  <DetailIcon size={14} className="opacity-50 flex-shrink-0" />
                  <span className="leading-relaxed overflow-hidden text-ellipsis">{detail.text}</span>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RewriteModelSelector
