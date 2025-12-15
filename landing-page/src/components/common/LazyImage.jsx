/**
 * LazyImage - Optimized image loading with blur placeholder
 * Enhanced: Dec 2025 - Intersection Observer, blur-up effect
 */
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'blur', // 'blur' | 'skeleton' | 'none'
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div className="absolute inset-0 bg-bg-secondary animate-pulse" />
      )}
      {placeholder === 'skeleton' && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-bg-secondary via-bg-hover to-bg-secondary bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Actual Image */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage
