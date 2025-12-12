import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

const QuickActions = ({ onSendMessage, disabled = false }) => {
  const { t } = useTranslation()

  // Help prefix for app context detection
  const HELP_PREFIX = '[APP_HELP] '

  const actions = [
    {
      id: 'howToUse',
      icon: '/icon/book-open.svg',
      label: t('workspace.helpActions.howToUse'),
      prompt: HELP_PREFIX + t('workspace.helpActions.howToUsePrompt')
    },
    {
      id: 'voiceProfile',
      icon: '/icon/user.svg',
      label: t('workspace.helpActions.voiceProfile'),
      prompt: HELP_PREFIX + t('workspace.helpActions.voiceProfilePrompt')
    },
    {
      id: 'credits',
      icon: '/icon/credit-card.svg',
      label: t('workspace.helpActions.credits'),
      prompt: HELP_PREFIX + t('workspace.helpActions.creditsPrompt')
    },
    {
      id: 'support',
      icon: '/icon/headphones.svg',
      label: t('workspace.helpActions.support'),
      prompt: HELP_PREFIX + t('workspace.helpActions.supportPrompt')
    }
  ]

  const handleClick = (action) => {
    if (!disabled && onSendMessage) {
      onSendMessage(action.prompt)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleClick(action)}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full",
            "bg-bg-secondary border border-border-light",
            "text-xs font-medium text-text-secondary",
            "transition-all duration-200",
            "hover:bg-bg-hover hover:border-border-hover hover:text-text-primary",
            "hover:shadow-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg-secondary",
            "cursor-pointer"
          )}
        >
          <img 
            src={action.icon} 
            alt="" 
            className="w-3.5 h-3.5 opacity-60 icon-invert" 
          />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}

export default QuickActions
