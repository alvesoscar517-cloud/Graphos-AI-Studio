import './TextShimmer.css'

const TextShimmer = ({ children, className = '', duration = 2 }) => {
  return (
    <div 
      className={`text-shimmer ${className}`}
      style={{
        '--shimmer-duration': `${duration}s`
      }}
    >
      {children}
    </div>
  )
}

export default TextShimmer
