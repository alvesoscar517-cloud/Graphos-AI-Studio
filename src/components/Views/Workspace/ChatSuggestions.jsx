import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

/**
 * ChatSuggestions Component
 * Displays AI-generated follow-up suggestions after a response
 * - Shows max 3 suggestions vertically
 * - Clicking a suggestion sends it as a new message
 * - Supports i18n
 * 
 * @param {Object} props
 * @param {string[]} props.suggestions - Array of suggestion strings
 * @param {Function} props.onSuggestionClick - Callback when suggestion is clicked
 * @param {boolean} props.disabled - Whether suggestions are disabled
 */
function ChatSuggestionsComponent(props) {
  const { suggestions, onSuggestionClick, disabled = false } = props
  const { t } = useTranslation()

  if (!suggestions || suggestions.length === 0) {
    return null
  }

  // Limit to 3 suggestions
  const displaySuggestions = suggestions.slice(0, 3)

  return (
    <div className="flex flex-col gap-2 mt-4 animate-fade-in">
      <span className="text-xs text-text-muted mb-1">
        {t('workspace.suggestions.title')}
      </span>
      <div className="flex flex-col gap-2">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => !disabled && onSuggestionClick?.(suggestion)}
            disabled={disabled}
            className={cn(
              "group flex items-center gap-2 py-2.5 px-3",
              "bg-bg-secondary/50 border border-border-light/50 rounded-xl",
              "text-left text-sm text-text-primary",
              "transition-all duration-200",
              "hover:bg-bg-hover hover:border-border-light",
              "hover:shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {/* Arrow icon */}
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="shrink-0 text-text-muted group-hover:text-text-primary transition-colors"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="line-clamp-2">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const ChatSuggestions = memo(ChatSuggestionsComponent)

export default ChatSuggestions
