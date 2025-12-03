/**
 * Empty State Component
 * Display when no data is available
 */

export function EmptyState({
  icon = '📭',
  title = 'No data',
  description = 'Nothing to show here yet.',
  action,
  actionLabel = 'Get started',
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
