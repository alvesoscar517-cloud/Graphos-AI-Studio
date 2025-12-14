import { cn } from '../../lib/utils'

/**
 * @typedef {Object} IconProps
 * @property {string} name - Icon name (without .svg extension)
 * @property {string} [alt] - Alt text for accessibility
 * @property {string} [className] - Additional CSS classes
 * @property {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [size] - Size preset
 * @property {'default' | 'primary' | 'muted' | 'success' | 'warning' | 'error'} [color] - Color preset
 * @property {boolean} [themed] - Auto invert in dark mode (default: true)
 */

/**
 * Icon component - Renders SVG icons with proper theming support
 * Replaces filter hacks with clean CSS approach
 * 
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
const Icon = ({ 
  name, 
  alt = '', 
  className = '', 
  size = 'md',
  color = 'default',
  themed = true,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const colorClasses = {
    default: themed ? 'icon-invert' : '',
    primary: 'filter-icon-primary',
    muted: themed ? 'opacity-60 icon-invert' : 'opacity-60',
    success: 'filter-icon-success',
    warning: 'filter-icon-warning',
    error: 'filter-icon-error'
  }

  return (
    <img 
      src={`/icon/${name}.svg`}
      alt={alt}
      className={cn(
        sizeClasses[size] || sizeClasses.md,
        colorClasses[color] || colorClasses.default,
        className
      )}
      {...props}
    />
  )
}

export default Icon
