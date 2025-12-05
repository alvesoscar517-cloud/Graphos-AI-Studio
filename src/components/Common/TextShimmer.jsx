import { cn } from '../../lib/utils'

const TextShimmer = ({ children, className = '', duration = 2, block = false }) => {
  return (
    <div 
      className={cn(
        block ? "block" : "inline-block",
        "relative",
        "bg-gradient-to-r from-text-primary via-accent to-text-primary",
        "bg-[length:200%_100%] bg-clip-text text-transparent",
        "whitespace-pre-wrap",
        className
      )}
      style={{
        animation: `shimmer ${duration}s ease-in-out infinite`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {children}
    </div>
  )
}

export default TextShimmer
