import { lazy, Suspense, useMemo } from 'react'
import { cn } from '../../lib/utils'
import * as LucideIcons from 'lucide-react'

/**
 * Mapping từ tên icon kebab-case sang PascalCase của lucide-react
 */
const ICON_NAME_MAP = {
  'panel-left': 'PanelLeft',
  'panel-right': 'PanelRight',
  'message-circle': 'MessageCircle',
  'message-square': 'MessageSquare',
  'wand-sparkles': 'WandSparkles',
  'scan-search': 'ScanSearch',
  'bar-chart': 'BarChart',
  'plus-circle': 'PlusCircle',
  'minus-circle': 'MinusCircle',
  'rotate-ccw': 'RotateCcw',
  'refresh-cw': 'RefreshCw',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'check-circle': 'CheckCircle',
  'file-text': 'FileText',
  'book-open': 'BookOpen',
  'align-left': 'AlignLeft',
  'eye-off': 'EyeOff',
  'trash-2': 'Trash2',
  'edit-2': 'Edit2',
  'edit-3': 'Edit3',
  'user-check': 'UserCheck',
  'shield-check': 'ShieldCheck',
  'credit-card': 'CreditCard',
  'shopping-cart': 'ShoppingCart',
  'dollar-sign': 'DollarSign',
  'trending-up': 'TrendingUp',
  'audio-lines': 'AudioLines',
  'alert-circle': 'AlertCircle',
  'alert-triangle': 'AlertTriangle',
  'arrow-right': 'ArrowRight',
  'arrow-left': 'ArrowLeft',
  'x-circle': 'XCircle',
}

/**
 * Danh sách icon KHÔNG có trong lucide-react
 */
const CUSTOM_ICONS = [
  'coins',
  'gift-banner',
  'x2-credits',
  'lemonsqueezy-with-name',
  'crown-power',
]

/**
 * Chuyển đổi tên icon từ kebab-case sang PascalCase
 */
const toComponentName = (name) => {
  if (!name) return null
  if (ICON_NAME_MAP[name]) {
    return ICON_NAME_MAP[name]
  }
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * DynamicIcon - Component cho dynamic icon names
 * Sử dụng khi icon name được truyền từ biến/props
 * 
 * @param {Object} props
 * @param {string} props.name - Icon name (kebab-case)
 * @param {number} [props.size=16] - Icon size in pixels
 * @param {string} [props.className] - Additional CSS classes
 */
const DynamicIcon = ({ 
  name, 
  size = 16, 
  className = '',
  ...props 
}) => {
  // Fallback về SVG cho custom icons hoặc khi không tìm thấy
  const isCustomIcon = CUSTOM_ICONS.includes(name)
  const componentName = toComponentName(name)
  const IconComponent = componentName ? LucideIcons[componentName] : null

  if (isCustomIcon || !IconComponent) {
    return (
      <img 
        src={`/icon/${name}.svg`}
        alt=""
        style={{ width: size, height: size }}
        className={cn('', className)}
        {...props}
      />
    )
  }

  return (
    <IconComponent 
      size={size}
      strokeWidth={2}
      className={cn('text-current', className)}
      {...props}
    />
  )
}

export default DynamicIcon
