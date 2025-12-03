import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

/**
 * Avatar component
 * Built on Radix UI Avatar primitive with fallback support
 */
const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      'ring-2 ring-surface ring-offset-0',
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full',
      'bg-surface-secondary/80 text-secondary font-semibold',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/**
 * Get initials from name
 */
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Simple Avatar with automatic fallback
 */
const SimpleAvatar = React.forwardRef(({ 
  src, 
  alt, 
  name, 
  size = 'md',
  className,
  ...props 
}, ref) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  return (
    <Avatar ref={ref} className={cn(sizeClasses[size], className)} {...props}>
      <AvatarImage src={src} alt={alt || name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
})
SimpleAvatar.displayName = 'SimpleAvatar'

/**
 * Avatar Group - display multiple avatars stacked
 */
function AvatarGroup({ avatars, max = 4, size = 'md', className }) {
  const displayed = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayed.map((avatar, index) => (
        <SimpleAvatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div className={cn(
          'flex items-center justify-center rounded-full ring-2 ring-white',
          'bg-surface-secondary text-muted-foreground font-medium',
          size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
        )}>
          +{remaining}
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback, SimpleAvatar, AvatarGroup, getInitials }
