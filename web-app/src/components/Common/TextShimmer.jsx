import { cn } from '../../lib/utils'

/**
 * TextShimmer - Hiệu ứng ánh sáng quét qua text (kiểu Facebook/LinkedIn/YouTube)
 * Sử dụng linear-gradient với animation để tạo hiệu ứng "sweep" từ trái sang phải
 */
const TextShimmer = ({ children, className = '', duration = 2, block = false }) => {
  return (
    <span 
      className={cn(
        block ? "block" : "inline",
        "relative whitespace-pre-wrap",
        className
      )}
      style={{
        // Base text color
        color: 'var(--shimmer-base-color)',
        // Gradient overlay tạo hiệu ứng ánh sáng quét
        background: `linear-gradient(
          90deg,
          var(--shimmer-base-color) 0%,
          var(--shimmer-base-color) 40%,
          var(--shimmer-highlight-color) 50%,
          var(--shimmer-base-color) 60%,
          var(--shimmer-base-color) 100%
        )`,
        backgroundSize: '250% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        // Animation sweep từ phải sang trái (ánh sáng đi từ trái sang phải)
        animation: `shimmer-sweep ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
    </span>
  )
}

export default TextShimmer
