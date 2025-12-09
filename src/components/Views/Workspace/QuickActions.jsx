import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

const QuickActions = ({ onActionClick, disabled = false }) => {
  const { t } = useTranslation()

  const actions = [
    {
      id: 'essay',
      icon: '/icon/file-text.svg',
      label: t('workspace.quickActions.writeEssay'),
      prompt: t('workspace.quickActions.writeEssayPrompt')
    },
    {
      id: 'email',
      icon: '/icon/mail.svg',
      label: t('workspace.quickActions.composeEmail'),
      prompt: t('workspace.quickActions.composeEmailPrompt')
    },
    {
      id: 'rewrite',
      icon: '/icon/refresh-cw.svg',
      label: t('workspace.quickActions.rewriteText'),
      prompt: t('workspace.quickActions.rewriteTextPrompt')
    },
    {
      id: 'research',
      icon: '/icon/search.svg',
      label: t('workspace.quickActions.researchTopic'),
      prompt: t('workspace.quickActions.researchTopicPrompt')
    }
  ]

  const handleClick = (action) => {
    if (!disabled) {
      onActionClick?.(action.prompt)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleClick(action)}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 py-2 px-4 rounded-full",
            "bg-bg-secondary border border-border-light",
            "text-sm font-medium text-text-secondary",
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
            className="w-4 h-4 opacity-60 icon-invert" 
          />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}

export default QuickActions
