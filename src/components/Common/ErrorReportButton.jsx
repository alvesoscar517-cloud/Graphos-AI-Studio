/**
 * Error Report Button Component
 * Reusable button to report technical errors
 * Can be used in toasts, error messages, modals, etc.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSendErrorReport } from '@/hooks/queries'
import { cn } from '@/lib/utils'

/**
 * @param {Object} props
 * @param {Error|string} props.error - Error object or error message
 * @param {string} [props.context] - Additional context about where the error occurred
 * @param {'button'|'link'|'icon'|'mini'} [props.variant] - Button style variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onReported] - Callback when error is reported
 */
export function ErrorReportButton({ 
  error, 
  context = '',
  variant = 'mini',
  className,
  onReported
}) {
  const { t } = useTranslation()
  const [status, setStatus] = useState('idle') // idle | sending | sent | already_reported | error
  const sendErrorReport = useSendErrorReport()

  // Convert string error to Error object
  const errorObj = typeof error === 'string' 
    ? new Error(error) 
    : error

  const handleReport = async (e) => {
    e?.stopPropagation?.()
    e?.preventDefault?.()
    
    if (status === 'sending' || status === 'sent' || status === 'already_reported') return
    
    setStatus('sending')
    try {
      const result = await sendErrorReport.mutateAsync({
        error: errorObj,
        url: window.location.href,
        componentStack: context ? `Context: ${context}` : undefined
      })
      
      if (result.alreadyReported) {
        setStatus('already_reported')
      } else {
        setStatus('sent')
        onReported?.()
      }
    } catch (err) {
      console.error('Failed to report error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const getButtonContent = () => {
    switch (status) {
      case 'sending': 
        return variant === 'icon' || variant === 'mini' 
          ? <LoadingSpinner /> 
          : t('errorReport.reporting', 'Reporting...')
      case 'sent': 
        return variant === 'icon' || variant === 'mini'
          ? <CheckIcon />
          : t('errorReport.reported', 'Reported!')
      case 'already_reported': 
        return variant === 'icon' || variant === 'mini'
          ? <CheckIcon />
          : t('errorReport.alreadyReported', 'Already Reported')
      case 'error': 
        return variant === 'icon' || variant === 'mini'
          ? <FlagIcon />
          : t('errorReport.failed', 'Failed')
      default: 
        return variant === 'icon' || variant === 'mini'
          ? <FlagIcon />
          : t('errorReport.report', 'Report')
    }
  }

  const isDisabled = status === 'sending' || status === 'sent' || status === 'already_reported'
  const isSuccess = status === 'sent' || status === 'already_reported'

  // Mini variant - small icon button for toasts
  if (variant === 'mini') {
    return (
      <button
        onClick={handleReport}
        disabled={isDisabled}
        title={isSuccess ? t('errorReport.thankYou', 'Thanks for reporting!') : t('errorReport.reportThis', 'Report this error')}
        className={cn(
          'p-1 rounded transition-all',
          isSuccess 
            ? 'text-green-300 cursor-default' 
            : 'text-white/70 hover:text-white hover:bg-white/20',
          isDisabled && !isSuccess && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {getButtonContent()}
      </button>
    )
  }

  // Icon variant - just icon
  if (variant === 'icon') {
    return (
      <button
        onClick={handleReport}
        disabled={isDisabled}
        title={isSuccess ? t('errorReport.thankYou', 'Thanks for reporting!') : t('errorReport.reportThis', 'Report this error')}
        className={cn(
          'p-2 rounded-lg transition-all',
          isSuccess 
            ? 'text-green-600 bg-green-500/10 cursor-default' 
            : 'text-text-muted hover:text-text-primary hover:bg-bg-hover',
          isDisabled && !isSuccess && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {getButtonContent()}
      </button>
    )
  }

  // Link variant - text link style
  if (variant === 'link') {
    return (
      <button
        onClick={handleReport}
        disabled={isDisabled}
        className={cn(
          'text-xs underline transition-colors',
          isSuccess 
            ? 'text-green-600 no-underline cursor-default' 
            : 'text-text-muted hover:text-accent',
          isDisabled && !isSuccess && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {getButtonContent()}
      </button>
    )
  }

  // Button variant - full button
  return (
    <button
      onClick={handleReport}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
        isSuccess 
          ? 'bg-green-500/10 text-green-600 border border-green-500/30 cursor-default'
          : status === 'error'
          ? 'bg-red-500/10 text-red-600 border border-red-500/30'
          : 'bg-bg-secondary text-text-primary border border-border hover:bg-bg-hover',
        isDisabled && !isSuccess && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {variant === 'button' && (
        isSuccess ? <CheckIcon /> : <FlagIcon />
      )}
      {getButtonContent()}
    </button>
  )
}

// Icons
function FlagIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export default ErrorReportButton
