import { cn } from '../../lib/utils'

const TextShimmer = ({ children, className = '', duration = 2 }) => {
  return (
    <div 
      className={cn(
        "inline-block relative",
        "bg-gradient-to-r from-text-primary via-accent to-text-primary",
        "bg-[length:200%_100%] bg-clip-text text-transparent",
        className
      )}
      style={{
        animation: `shimmer ${duration}s ease-in-out infinite`
      }}
    >
      {children}
    </div>
  )
}

export default TextShimmer
