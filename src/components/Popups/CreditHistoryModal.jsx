/**
 * CreditHistoryModal Component
 * Displays user's credit transaction history with filters and summary
 */
import { useState, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useCreditHistory, useCreditHistorySummary, useCredits } from '@/hooks/queries'
import Icon from '../Common/Icon'
import { cn } from '../../lib/utils'

// Feature name mapping for display
const FEATURE_LABELS = {
  ai_detection: 'AI Detection',
  text_analysis: 'Text Analysis',
  text_rewrite: 'Text Rewrite',
  improvement_suggestions: 'Suggestions',
  chat_message: 'Chat',
  chat_humanized: 'Humanized Chat',
  voice_profile_generation: 'Profile Generation',
  profile_sample_add: 'Add Sample',
  profile_samples_batch: 'Batch Samples',
  profile_complete: 'Complete Profile',
  translation: 'Translation',
  check_humanization: 'Check Humanization',
  iterative_humanize: 'Iterative Humanize',
  conversation_summarize: 'Summarize',
  file_upload_image: 'Image Upload',
  file_upload_document: 'Document Upload',
  purchase: 'Purchase',
  bonus: 'Bonus',
  refund: 'Refund',
  welcome_bonus: 'Welcome Bonus',
}

// Feature icons
const FEATURE_ICONS = {
  ai_detection: 'scan',
  text_analysis: 'bar-chart-2',
  text_rewrite: 'edit-3',
  improvement_suggestions: 'lightbulb',
  chat_message: 'message-circle',
  chat_humanized: 'user',
  voice_profile_generation: 'mic',
  profile_sample_add: 'plus-circle',
  profile_samples_batch: 'layers',
  profile_complete: 'check-circle',
  translation: 'globe',
  check_humanization: 'shield-check',
  iterative_humanize: 'repeat',
  conversation_summarize: 'file-text',
  file_upload_image: 'image',
  file_upload_document: 'file',
  purchase: 'credit-card',
  bonus: 'gift',
  refund: 'rotate-ccw',
  welcome_bonus: 'star',
}

const CreditHistoryModal = ({ onClose }) => {
  const { t } = useTranslation()
  const modalRef = useRef(null)
  const listRef = useRef(null)
  
  // Filters state
  const [filters, setFilters] = useState({
    type: 'all',
    feature: 'all',
    days: 30,
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // Get current credits
  const { data: credits } = useCredits()
  
  // Calculate date range based on days filter
  const dateRange = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - filters.days)
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
  }, [filters.days])
  
  // Fetch history with filters
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useCreditHistory({
    type: filters.type,
    feature: filters.feature,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 20,
  })
  
  // Fetch summary
  const { data: summaryData } = useCreditHistorySummary(filters.days)
  
  // Flatten pages
  const transactions = useMemo(() => {
    return data?.pages?.flatMap(page => page.transactions) || []
  }, [data])
  
  // Get unique features for filter
  const availableFeatures = useMemo(() => {
    const features = new Set()
    transactions.forEach(tx => {
      if (tx.feature) features.add(tx.feature)
      if (tx.source) features.add(tx.source)
    })
    return Array.from(features)
  }, [transactions])
  
  // Handle scroll for infinite loading
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // Format amount
  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0
    const formatted = Math.abs(num).toFixed(2)
    return num >= 0 ? `+${formatted}` : `-${formatted}`
  }
  
  // Get feature label
  const getFeatureLabel = (tx) => {
    const key = tx.feature || tx.source || 'unknown'
    return t(`creditHistory.features.${key}`, FEATURE_LABELS[key] || key)
  }
  
  // Get feature icon
  const getFeatureIcon = (tx) => {
    const key = tx.feature || tx.source || 'unknown'
    return FEATURE_ICONS[key] || 'circle'
  }

  return createPortal(
    <div 
      className={cn(
        "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-toast animate-fade-in",
        "p-4 max-md:p-3 max-md:items-end"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        ref={modalRef} 
        className={cn(
          "bg-bg-primary rounded-2xl w-full max-w-[700px] max-h-[90vh]",
          "flex flex-col overflow-hidden shadow-modal",
          "animate-slide-up",
          "max-md:max-w-full max-md:max-h-[85vh] max-md:rounded-t-2xl max-md:rounded-b-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-5 px-6 shrink-0 border-b border-border max-md:py-4 max-md:px-4">
          <div className="flex items-center gap-3">
            <div className="card-icon !w-10 !h-10">
              <Icon name="history" alt={t('creditHistory.title')} size="lg" color="muted" />
            </div>
            <div>
              <h2 className="m-0 text-xl font-semibold text-text-primary">
                {t('creditHistory.title', 'Credit History')}
              </h2>
              <p className="m-0 mt-0.5 text-sm text-text-secondary">
                {t('creditHistory.subtitle', 'Track your credit usage')}
              </p>
            </div>
          </div>
          <button 
            className="bg-transparent border-none cursor-pointer p-2 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover" 
            onClick={onClose}
            data-tooltip={t('common.close')}
          >
            <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 border-b border-border max-md:px-4">
          <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
            {/* Current Balance */}
            <div className="p-3 bg-bg-secondary rounded-xl text-center">
              <p className="m-0 text-xs text-text-muted mb-1">
                {t('creditHistory.currentBalance', 'Balance')}
              </p>
              <p className="m-0 text-lg font-bold text-primary">
                {credits?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            {/* Total Used */}
            <div className="p-3 bg-bg-secondary rounded-xl text-center">
              <p className="m-0 text-xs text-text-muted mb-1">
                {t('creditHistory.totalUsed', 'Used')}
              </p>
              <p className="m-0 text-lg font-bold text-error">
                -{summaryData?.summary?.totalDeducted?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            {/* Total Added */}
            <div className="p-3 bg-bg-secondary rounded-xl text-center">
              <p className="m-0 text-xs text-text-muted mb-1">
                {t('creditHistory.totalAdded', 'Added')}
              </p>
              <p className="m-0 text-lg font-bold text-success">
                +{summaryData?.summary?.totalAdded?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            {/* Transactions */}
            <div className="p-3 bg-bg-secondary rounded-xl text-center">
              <p className="m-0 text-xs text-text-muted mb-1">
                {t('creditHistory.transactions', 'Transactions')}
              </p>
              <p className="m-0 text-lg font-bold text-text-primary">
                {summaryData?.summary?.totalTransactions || 0}
              </p>
            </div>
          </div>
          
          {/* Top Features Usage */}
          {summaryData?.summary?.byFeature && Object.keys(summaryData.summary.byFeature).length > 0 && (
            <TopFeaturesChart byFeature={summaryData.summary.byFeature} t={t} />
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-3 flex-wrap max-md:px-4">
          {/* Period Filter */}
          <select
            value={filters.days}
            onChange={(e) => setFilters(f => ({ ...f, days: parseInt(e.target.value) }))}
            className={cn(
              "py-2 px-3 bg-bg-secondary border border-border rounded-lg",
              "text-sm text-text-primary cursor-pointer",
              "focus:outline-none focus:border-primary"
            )}
          >
            <option value={7}>{t('creditHistory.last7Days', 'Last 7 days')}</option>
            <option value={30}>{t('creditHistory.last30Days', 'Last 30 days')}</option>
            <option value={90}>{t('creditHistory.last90Days', 'Last 90 days')}</option>
            <option value={365}>{t('creditHistory.lastYear', 'Last year')}</option>
          </select>
          
          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
            className={cn(
              "py-2 px-3 bg-bg-secondary border border-border rounded-lg",
              "text-sm text-text-primary cursor-pointer",
              "focus:outline-none focus:border-primary"
            )}
          >
            <option value="all">{t('creditHistory.allTypes', 'All types')}</option>
            <option value="deduction">{t('creditHistory.deductions', 'Deductions')}</option>
            <option value="addition">{t('creditHistory.additions', 'Additions')}</option>
          </select>
          
          {/* Toggle more filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "py-2 px-3 bg-bg-secondary border border-border rounded-lg",
              "text-sm text-text-primary cursor-pointer flex items-center gap-2",
              "hover:bg-bg-hover transition-colors",
              showFilters && "border-primary bg-primary/10"
            )}
          >
            <Icon name="filter" size="sm" />
            {t('common.filter', 'Filter')}
          </button>
        </div>
        
        {/* Extended Filters */}
        {showFilters && (
          <div className="px-6 py-3 border-b border-border bg-bg-secondary/50 max-md:px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-text-muted">
                {t('creditHistory.filterByFeature', 'Feature:')}
              </span>
              <select
                value={filters.feature}
                onChange={(e) => setFilters(f => ({ ...f, feature: e.target.value }))}
                className={cn(
                  "py-1.5 px-3 bg-bg-primary border border-border rounded-lg",
                  "text-sm text-text-primary cursor-pointer",
                  "focus:outline-none focus:border-primary"
                )}
              >
                <option value="all">{t('creditHistory.allFeatures', 'All features')}</option>
                {availableFeatures.map(feature => (
                  <option key={feature} value={feature}>
                    {FEATURE_LABELS[feature] || feature}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 max-md:px-4"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-text-muted">
              <Icon name="alert-circle" size="xl" className="mx-auto mb-3 opacity-50" />
              <p>{t('errors.generic', 'Something went wrong')}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Icon name="inbox" size="xl" className="mx-auto mb-3 opacity-50" />
              <p>{t('creditHistory.noTransactions', 'No transactions found')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <TransactionItem 
                  key={tx.id} 
                  transaction={tx}
                  formatDate={formatDate}
                  formatAmount={formatAmount}
                  getFeatureLabel={getFeatureLabel}
                  getFeatureIcon={getFeatureIcon}
                />
              ))}
              
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
              
              {!hasNextPage && transactions.length > 0 && (
                <p className="text-center text-sm text-text-muted py-4">
                  {t('creditHistory.endOfList', 'No more transactions')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Transaction Item Component
const TransactionItem = ({ transaction, formatDate, formatAmount, getFeatureLabel, getFeatureIcon }) => {
  const [expanded, setExpanded] = useState(false)
  const isDeduction = transaction.type === 'deduction'
  
  return (
    <div 
      className={cn(
        "p-3 bg-bg-secondary rounded-xl cursor-pointer transition-all",
        "hover:bg-bg-hover border border-transparent",
        expanded && "border-border"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isDeduction ? "bg-error/10" : "bg-success/10"
        )}>
          <Icon 
            name={getFeatureIcon(transaction)} 
            size="md" 
            className={isDeduction ? "text-error" : "text-success"}
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="m-0 text-sm font-medium text-text-primary truncate">
            {getFeatureLabel(transaction)}
          </p>
          <p className="m-0 text-xs text-text-muted">
            {formatDate(transaction.timestamp)}
          </p>
        </div>
        
        {/* Amount */}
        <div className="text-right shrink-0">
          <p className={cn(
            "m-0 text-sm font-semibold",
            isDeduction ? "text-error" : "text-success"
          )}>
            {formatAmount(transaction.amount)}
          </p>
          <p className="m-0 text-xs text-text-muted">
            {transaction.balanceAfter?.toFixed(2) || '—'}
          </p>
        </div>
        
        {/* Expand icon */}
        <Icon 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size="sm" 
          className="text-text-muted shrink-0"
        />
      </div>
      
      {/* Expanded Details */}
      {expanded && transaction.metadata && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(transaction.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="text-text-primary font-medium">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Top Features Chart Component - Simple bar visualization
const TopFeaturesChart = ({ byFeature, t }) => {
  // Sort features by total usage and take top 5
  const topFeatures = useMemo(() => {
    return Object.entries(byFeature)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
  }, [byFeature])
  
  const maxTotal = topFeatures[0]?.[1]?.total || 1
  
  if (topFeatures.length === 0) return null
  
  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="m-0 text-xs text-text-muted mb-3 font-medium">
        {t('creditHistory.topFeatures', 'Top Features')}
      </p>
      <div className="space-y-2">
        {topFeatures.map(([feature, data]) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="w-24 text-xs text-text-secondary truncate shrink-0">
              {t(`creditHistory.features.${feature}`, FEATURE_LABELS[feature] || feature)}
            </div>
            <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(data.total / maxTotal) * 100}%` }}
              />
            </div>
            <div className="w-16 text-xs text-text-muted text-right shrink-0">
              {data.total.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CreditHistoryModal
