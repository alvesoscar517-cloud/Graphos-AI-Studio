/**
 * Icon component - Renders SVG icons from /icon/ directory
 * Follows the same pattern as main app for consistency
 * 
 * @param {string} name - Icon name (without .svg extension)
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} size - Icon size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * @param {string} color - Icon color variant: 'default' | 'gray' | 'gray-medium' | 'slate' | 'primary' | 'white'
 */
function Icon({ 
  name, 
  alt = '', 
  className = '', 
  size = 'md',
  color,
  ...props 
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  }

  // Color classes for professional icon styling
  const colorClasses = {
    default: '',
    gray: 'icon-gray',
    'gray-medium': 'icon-gray-medium',
    slate: 'icon-slate',
    primary: 'icon-primary',
    white: 'icon-white',
    invert: 'icon-invert'
  }

  // Check if className already contains a color class
  const hasColorClass = className && (
    className.includes('icon-primary') || 
    className.includes('icon-white') || 
    className.includes('icon-gray') ||
    className.includes('icon-slate') ||
    className.includes('icon-invert') ||
    className.includes('text-') // Tailwind text color classes
  )

  // Use provided color, or default to 'gray' if no color class in className
  const colorClass = color 
    ? colorClasses[color] || '' 
    : (hasColorClass ? '' : colorClasses.gray)

  return (
    <img 
      src={`/icon/${name}.svg`}
      alt={alt}
      className={`${sizeClasses[size] || sizeClasses.md} ${colorClass} ${className}`.trim()}
      {...props}
    />
  )
}

export default Icon
