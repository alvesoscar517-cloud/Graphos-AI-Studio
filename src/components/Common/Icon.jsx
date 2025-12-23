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
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'x-circle': 'XCircle',
  'image-plus': 'ImagePlus',
  'mouse-pointer': 'MousePointer',
}

/**
 * Danh sách icon KHÔNG có trong lucide-react, cần fallback về SVG
 * Các icon này thường là icon màu hoặc brand icons
 */
const CUSTOM_ICONS = [
  'gift-banner',
  'x2-credits',
  'x2-badge',
  'crown-power',
  'crown-basic',
  'crown-pro',
  'crown-pro-plus',
  'crown-ultimate',
  'lightbulb',
  'lightbulb-off',
  'graphos-ai-studio-logo',
  'Gemini',
]

/**
 * Custom icons đã có màu riêng - KHÔNG cần filter cho dark mode
 * Các icon này giữ nguyên màu gốc (vàng, cam, xanh, v.v.)
 */
const COLORED_ICONS = [
  'gift-banner',
  'x2-credits',
  'x2-badge',
  'crown-power',
  'crown-basic',
  'crown-pro',
  'crown-pro-plus',
  'crown-ultimate',
  'lightbulb',
  'lightbulb-off',
]

/**
 * Icons có 2 phiên bản riêng cho dark/light mode
 * Không còn sử dụng - dùng trực tiếp img tags với dark:hidden/dark:block
 */
const THEMED_ICONS = {}

/**
 * Chuyển đổi tên icon từ kebab-case sang PascalCase
 */
const toComponentName = (name) => {
  if (ICON_NAME_MAP[name]) {
    return ICON_NAME_MAP[name]
  }
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * @typedef {Object} IconProps
 * @property {string} name - Icon name (kebab-case, vd: 'arrow-left')
 * @property {string} [alt] - Alt text for accessibility
 * @property {string} [className] - Additional CSS classes
 * @property {'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'} [size] - Size preset
 * @property {'default' | 'primary' | 'muted' | 'success' | 'warning' | 'error'} [color] - Color preset
 * @property {boolean} [themed] - Không còn sử dụng (lucide-react tự động theo theme)
 */

/**
 * Icon component - Sử dụng lucide-react với fallback về SVG cho custom icons
 * Lucide icons tự động điều chỉnh màu theo dark/light mode qua CSS text-color
 * 
 * @param {IconProps} props
 * @returns {JSX.Element|null}
 */
const Icon = ({ 
  name, 
  alt = '', 
  className = '', 
  size = 'md',
  color = 'default',
  themed = true, // kept for backward compatibility but not used
  ...props 
}) => {
  // Size mapping (pixels)
  const sizeMap = {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
  }

  // Color classes cho lucide-react (dùng text color - tự động theo theme)
  const colorClasses = {
    default: 'text-current',
    primary: 'text-primary',
    muted: 'text-text-muted opacity-60',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  }

  // Size classes cho SVG fallback
  const svgSizeClasses = {
    '2xs': 'w-2.5 h-2.5',
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    '2xl': 'w-7 h-7',
  }

  // Fallback về SVG cho custom icons (brand icons, colored icons)
  if (CUSTOM_ICONS.includes(name)) {
    // Check if icon has themed versions (dark/light)
    const themedIcon = THEMED_ICONS[name]
    if (themedIcon) {
      return (
        <>
          <img 
            src={`/icon/${themedIcon.light}.svg`}
            alt={alt}
            className={cn(
              svgSizeClasses[size] || svgSizeClasses.md,
              'block dark:hidden', // Show in light mode, hide in dark mode
              className
            )}
            {...props}
          />
          <img 
            src={`/icon/${themedIcon.dark}.svg`}
            alt={alt}
            className={cn(
              svgSizeClasses[size] || svgSizeClasses.md,
              'hidden dark:block', // Hide in light mode, show in dark mode
              className
            )}
            {...props}
          />
        </>
      )
    }
    
    // Colored icons giữ nguyên màu gốc, không cần filter
    const isColored = COLORED_ICONS.includes(name)
    return (
      <img 
        src={`/icon/${name}.svg`}
        alt={alt}
        className={cn(
          svgSizeClasses[size] || svgSizeClasses.md,
          !isColored && 'icon-auto-theme', // Chỉ apply filter cho icon đen trắng
          className
        )}
        {...props}
      />
    )
  }

  // Sử dụng lucide-react
  const componentName = toComponentName(name)
  const IconComponent = LucideIcons[componentName]

  if (!IconComponent) {
    // Icon không tìm thấy - log warning trong dev
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon: "${name}" (${componentName}) not found in lucide-react`)
    }
    return null
  }

  const pixelSize = sizeMap[size] || sizeMap.md

  return (
    <IconComponent 
      size={pixelSize}
      strokeWidth={2}
      className={cn(
        colorClasses[color] || colorClasses.default,
        className
      )}
      aria-label={alt || undefined}
      {...props}
    />
  )
}

export default Icon
