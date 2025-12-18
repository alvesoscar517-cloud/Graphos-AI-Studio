'use client'

import { cn } from '@/lib/utils'

export function EtheralShadow({
  children,
  className,
  color = 'rgba(128, 128, 128, 1)',
  animation = { scale: 100, speed: 90 },
  noise = { opacity: 1, scale: 1.2 },
  sizing = 'fill',
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        sizing === 'fill' && 'w-full h-full',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 30%, #0f172a 60%, #0a0a1a 100%)',
      }}
    >
      {/* Animated glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 70% 40%, rgba(139, 92, 246, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 60%, rgba(245, 158, 11, 0.08) 0%, transparent 35%)
          `,
          animation: `etherealPulse ${20 - animation.speed / 10}s ease-in-out infinite`,
        }}
      />

      {/* Decoration circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ border: '2px solid rgba(255,255,255,0.05)' }}
        />
        <div
          className="absolute -bottom-36 -left-36 w-[500px] h-[500px] rounded-full"
          style={{ border: '2px solid rgba(255,255,255,0.03)' }}
        />
      </div>

      {/* Noise overlay */}
      {noise.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: noise.opacity * 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>

      <style>{`
        @keyframes etherealPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  )
}

export default EtheralShadow
