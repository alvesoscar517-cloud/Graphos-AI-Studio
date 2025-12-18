import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EtheralShadow } from '@/components/ui/shadcn-io/ethereal-shadow'

/**
 * UnsupportedScreenOverlay - Hiển thị overlay khi màn hình không được hỗ trợ
 * 
 * Điều kiện hiển thị:
 * - Chiều rộng < 1024px (cần ít nhất tablet landscape hoặc laptop)
 * - HOẶC chiều cao < 600px (màn hình quá thấp)
 * - HOẶC màn hình dọc (portrait) với width < 1024px
 * 
 * Lý do: AI Studio, AI Workspace và New Profile cần không gian đủ rộng
 * để hiển thị sidebar, editor, và các panel phân tích
 */
const UnsupportedScreenOverlay = () => {
  const { t } = useTranslation()
  const [isUnsupported, setIsUnsupported] = useState(false)

  useEffect(() => {
    const checkScreenSupport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Yêu cầu tối thiểu: 1024x600 (tablet landscape hoặc laptop)
      const MIN_WIDTH = 1024
      const MIN_HEIGHT = 600
      
      const isTooNarrow = width < MIN_WIDTH
      const isTooShort = height < MIN_HEIGHT
      const isPortrait = height > width && width < MIN_WIDTH

      setIsUnsupported(isTooNarrow || isTooShort || isPortrait)
    }

    checkScreenSupport()

    window.addEventListener('resize', checkScreenSupport)
    window.addEventListener('orientationchange', checkScreenSupport)

    return () => {
      window.removeEventListener('resize', checkScreenSupport)
      window.removeEventListener('orientationchange', checkScreenSupport)
    }
  }, [])

  if (!isUnsupported) return null

  return (
    <div className="unsupported-overlay">
      <EtheralShadow
        className="w-full h-full"
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      >
        {/* Content */}
        <div className="unsupported-content-wrapper">
          <div className="unsupported-content">
          {/* App Logo/Icon */}
          <div className="unsupported-logo">
            <img src="/icons/content.svg" alt="Graphos AI Studio" />
          </div>

          {/* Title */}
          <h2 className="unsupported-title">{t('unsupportedScreen.title')}</h2>

          {/* Description */}
          <p className="unsupported-description">{t('unsupportedScreen.description')}</p>

          {/* Device icons */}
          <div className="unsupported-devices">
            {/* Desktop icon */}
            <div className="unsupported-device-item">
              <svg
                className="unsupported-device-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 20h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 16v4M17 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="unsupported-device-label">{t('unsupportedScreen.desktop')}</span>
            </div>

            {/* Laptop icon */}
            <div className="unsupported-device-item">
              <svg
                className="unsupported-device-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="4" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 17h20l-2 3H4l-2-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span className="unsupported-device-label">Laptop</span>
            </div>

            {/* Tablet landscape icon */}
            <div className="unsupported-device-item">
              <svg
                className="unsupported-device-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M18 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="unsupported-device-label">Tablet</span>
            </div>
          </div>
          </div>
        </div>
      </EtheralShadow>

      <style>{`
        .unsupported-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--background, #ffffff);
        }

        .unsupported-content-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .unsupported-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          max-width: 340px;
          text-align: center;
        }

        .unsupported-logo {
          width: 72px;
          height: 72px;
          margin-bottom: 28px;
        }

        .unsupported-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .unsupported-title {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 12px 0;
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .unsupported-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .unsupported-devices {
          display: flex;
          gap: 32px;
        }

        .unsupported-device-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .unsupported-device-icon {
          width: 36px;
          height: 36px;
          color: rgba(255, 255, 255, 0.5);
        }

        .unsupported-device-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default UnsupportedScreenOverlay
