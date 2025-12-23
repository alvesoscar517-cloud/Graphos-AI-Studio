/**
 * CreditHistoryView - Standalone Credit History Page
 * Layout similar to HistoryView - minimalist, modern design
 */
import { logger } from '@/utils/logger'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreditHistory, useCreditHistorySummary } from '@/hooks/queries/useCreditHistory'
import { useCredits } from '@/hooks/queries'
import { SkeletonCreditRow, Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { BarChart, Calendar, ChevronDown, Clock, CreditCard, Gift, MessageCircle, PanelLeft, Pencil, RefreshCw, RotateCcw, ScanSearch, Sparkles, WandSparkles, PlusCircle, MinusCircle, Circle } from 'lucide-react'

// Icon component mapping
const ICON_COMPONENTS = {
  'message-circle': MessageCircle,
  'wand-sparkles': WandSparkles,
  'scan-search': ScanSearch,
  'pencil': Pencil,
  'bar-chart': BarChart,
  'credit-card': CreditCard,
  'gift': Gift,
  'sparkles': Sparkles,
  'rotate-ccw': RotateCcw,
  'refresh-cw': RefreshCw,
  'plus-circle': PlusCircle,
  'minus-circle': MinusCircle,
  'circle': Circle,
}

// Feature name to display text and icon mapping
const FEATURE_CONFIG = {
  // Usage features (deduction)
  chat_message: { icon: 'message-circle', labelKey: 'credits.feature.chatMessage' },
  chat_message_output: { icon: 'message-circle', labelKey: 'credits.feature.chatMessage', mergeWith: 'chat_message' },
  chat_humanized: { icon: 'message-circle', labelKey: 'credits.feature.chatHumanized' },
  chat_humanized_output: { icon: 'message-circle', labelKey: 'credits.feature.chatHumanized', mergeWith: 'chat_humanized' },
  humanize: { icon: 'wand-sparkles', labelKey: 'credits.feature.humanize' },
  iterative_humanize: { icon: 'wand-sparkles', labelKey: 'credits.feature.humanize' },
  detect: { icon: 'scan-search', labelKey: 'credits.feature.detect' },
  rewrite: { icon: 'pencil', labelKey: 'credits.feature.rewrite' },
  text_rewrite: { icon: 'pencil', labelKey: 'credits.feature.rewrite' },
  analyze: { icon: 'bar-chart', labelKey: 'credits.feature.analyze' },
  text_analysis: { icon: 'bar-chart', labelKey: 'credits.feature.analyze' },
  ai_detection: { icon: 'scan-search', labelKey: 'credits.feature.detect' },
  // Addition features
  purchase: { icon: 'credit-card', labelKey: 'credits.feature.purchase' },
  first_purchase: { icon: 'gift', labelKey: 'credits.feature.firstPurchase' },
  bonus: { icon: 'gift', labelKey: 'credits.feature.bonus' },
  welcome_bonus: { icon: 'sparkles', labelKey: 'credits.feature.welcomeBonus' },
  refund: { icon: 'rotate-ccw', labelKey: 'credits.feature.refund' },
  subscription_renewal: { icon: 'refresh-cw', labelKey: 'credits.feature.subscriptionRenewal' },
}

// Features that should be merged (output transactions merged into input)
const MERGE_FEATURES = {
  chat_message_output: 'chat_message',
  chat_humanized_output: 'chat_humanized',
}

// Get base feature name (without _output suffix)
const getBaseFeature = (feature) => {
  if (!feature) return null
  return MERGE_FEATURES[feature] || feature
}

// Get icon for transaction based on feature or type
const getTransactionIcon = (tx) => {
  const { feature, type } = tx
  const baseFeature = getBaseFeature(feature)
  // Check feature first
  if (baseFeature && FEATURE_CONFIG[baseFeature]) {
    return FEATURE_CONFIG[baseFeature].icon
  }
  // Fallback to type
  if (type === 'addition') return 'plus-circle'
  if (type === 'deduction') return 'minus-circle'
  return 'circle'
}

// Transaction icon component
const TransactionIcon = ({ tx }) => {
  const iconName = getTransactionIcon(tx)
  const IconComponent = ICON_COMPONENTS[iconName] || Circle
  return <IconComponent size={20} className="opacity-55 shrink-0" />
}

const CreditHistoryView = ({ onToggleLeftSidebar }) => {
  const { t } = useTranslation()
  const [filterType, setFilterType] = useState('all')
  const [filterDays, setFilterDays] = useState(30)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const filterRef = useRef(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch data
  const { data: credits, isLoading: creditsLoading } = useCredits()
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useCreditHistorySummary(filterDays)
  

  
  const {
    data: historyData,
    isLoading: historyLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCreditHistory({ type: filterType === 'all' ? 'all' : filterType, limit: 20 })

  // Flatten paginated data and merge input/output transactions
  const transactions = useMemo(() => {
    if (!historyData?.pages) return []
    const rawTransactions = historyData.pages.flatMap((page) => page.transactions || [])
    
    // Group and merge input/output transactions
    const mergedMap = new Map()
    const result = []
    
    for (const tx of rawTransactions) {
      const feature = tx.feature
      const mergeTarget = MERGE_FEATURES[feature]
      
      if (mergeTarget) {
        // This is an output transaction, try to find and merge with input
        // Look for a recent input transaction (within 2 minutes)
        const txTime = new Date(tx.timestamp).getTime()
        let merged = false
        
        for (const [key, existingTx] of mergedMap) {
          if (existingTx.feature === mergeTarget) {
            const existingTime = new Date(existingTx.timestamp).getTime()
            // Merge if within 2 minutes
            if (Math.abs(txTime - existingTime) < 2 * 60 * 1000) {
              existingTx.amount += tx.amount
              existingTx.balanceAfter = tx.balanceAfter // Use the later balance
              existingTx._merged = true
              merged = true
              break
            }
          }
        }
        
        // If not merged, add as standalone (shouldn't happen often)
        if (!merged) {
          // Convert to parent feature for display
          const displayTx = { ...tx, feature: mergeTarget, _outputOnly: true }
          const key = `${tx.id || tx.timestamp}`
          mergedMap.set(key, displayTx)
          result.push(displayTx)
        }
      } else {
        // Regular transaction or input transaction
        const key = `${tx.id || tx.timestamp}`
        mergedMap.set(key, { ...tx })
        result.push(mergedMap.get(key))
      }
    }
    
    return result
  }, [historyData])

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTimeAgo = useCallback(
    (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      if (diffHours < 1) return t('common.justNow', 'Just now')
      if (diffHours < 24) return t('common.hoursAgo', '{{count}}h ago', { count: diffHours })
      if (diffDays < 7) return t('common.daysAgo', '{{count}}d ago', { count: diffDays })
      return date.toLocaleDateString()
    },
    [t]
  )

  const formatAmount = (amount) => {
    // Amount from backend is already signed (negative for deduction)
    const isPositive = amount > 0
    const prefix = isPositive ? '+' : ''
    return `${prefix}${amount.toFixed(2)}`
  }

  // Map backend response fields to our expected format
  const summary = summaryData?.summary
    ? {
        used: summaryData.summary.totalDeducted || 0,
        added: summaryData.summary.totalAdded || 0,
        transactions: summaryData.summary.totalTransactions || 0,
      }
    : { used: 0, added: 0, transactions: 0 }
  const balance = credits?.balance ?? 0

  // Filter types matching backend: all, deduction, addition
  const filterTypes = [
    { value: 'all', labelKey: 'history.all' },
    { value: 'deduction', labelKey: 'credits.deduction' },
    { value: 'addition', labelKey: 'credits.addition' },
  ]

  // Get display text for transaction
  const getTransactionDisplay = (tx) => {
    const { description, feature, metadata } = tx
    const baseFeature = getBaseFeature(feature)

    // If has description and not an output-only transaction, use it
    // Skip description for merged transactions to show clean feature name
    if (description && !tx._merged && !tx._outputOnly && !feature?.endsWith('_output')) {
      return description
    }

    // Check feature config for translation (use base feature)
    if (baseFeature && FEATURE_CONFIG[baseFeature]) {
      return t(FEATURE_CONFIG[baseFeature].labelKey, baseFeature)
    }

    // Check metadata for more info
    if (metadata?.package) {
      return t('credits.feature.purchase', 'Credit Purchase')
    }

    // Fallback to feature name formatted
    if (baseFeature) {
      // Convert snake_case to Title Case
      return baseFeature
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return t('credits.transaction', 'Transaction')
  }

  // Get type display text
  const getTypeDisplay = (type) => {
    if (type === 'deduction') return t('credits.deduction', 'Deduction')
    if (type === 'addition') return t('credits.addition', 'Addition')
    return type
  }

  // Render table row
  const renderTableRow = (tx, index) => {
    const { type, amount, balanceAfter, timestamp } = tx
    const isPositive = amount > 0
    const displayText = getTransactionDisplay(tx)

    return (
      <tr
        key={tx.id || index}
        className={cn(
          'transition-all duration-200',
          'hover:bg-transparent [&:hover_td]:bg-bg-hover',
          '[&:hover_td]:border-b-bg-hover',
          '[&:hover_td:first-child]:rounded-l-lg [&:hover_td:last-child]:rounded-r-lg'
        )}
      >
        <td className="py-2.5 pr-3 border-b border-border-light text-text-primary align-middle text-sm h-11 pl-4 min-w-40">
          <div className="flex items-center gap-3 font-normal text-text-primary overflow-hidden">
            <TransactionIcon tx={tx} />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {displayText}
            </span>
          </div>
        </td>
        <td className="w-28 whitespace-nowrap text-left pl-4 pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11 max-lg:hidden">
          <span className="text-text-secondary text-sm">{getTypeDisplay(type)}</span>
        </td>
        <td className="w-32 whitespace-nowrap text-left pl-4 pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11">
          <span className="text-text-secondary text-sm">{formatTimeAgo(timestamp)}</span>
        </td>
        <td className="w-28 whitespace-nowrap text-right pl-4 pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11">
          <span className={cn('text-sm font-medium tabular-nums', isPositive ? 'text-text-primary' : 'text-text-secondary')}>
            {formatAmount(amount)}
          </span>
        </td>
        <td className="w-24 whitespace-nowrap text-right pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11 max-xl:hidden">
          <span className="text-text-muted text-sm tabular-nums">{balanceAfter?.toFixed(2) ?? '-'}</span>
        </td>
      </tr>
    )
  }

  // Render mobile card
  const renderMobileCard = (tx, index) => {
    const { type, amount, balanceAfter, timestamp } = tx
    const isPositive = amount > 0
    const displayText = getTransactionDisplay(tx)

    return (
      <div
        key={tx.id || index}
        className={cn(
          'bg-bg-secondary border border-border rounded-lg p-4',
          'transition-all duration-200',
          'hover:bg-bg-tertiary hover:border-border-hover'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TransactionIcon tx={tx} />
            <span className="text-sm font-medium text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{displayText}</span>
          </div>
          <span className={cn('text-sm font-medium tabular-nums shrink-0', isPositive ? 'text-text-primary' : 'text-text-secondary')}>
            {formatAmount(amount)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
          <span>{getTypeDisplay(type)}</span>
          <span className="text-border">•</span>
          <span>{formatTimeAgo(timestamp)}</span>
          <span className="text-border">•</span>
          <span className="tabular-nums">{balanceAfter?.toFixed(2) ?? '-'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-bg-tertiary h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center py-2 px-4 bg-bg-tertiary h-14 shrink-0">
        <button
          className="p-1.5 bg-transparent border-none cursor-pointer rounded-full w-8 h-8 shrink-0 flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover"
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')}
          data-tooltip-position="right"
        >
          <PanelLeft size={20} className="opacity-60" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-0 w-full overflow-hidden bg-bg-tertiary">
        {/* Header - similar to HistoryView */}
        <div className="flex items-center justify-between py-2 pr-0 bg-bg-tertiary w-[80%] mx-auto max-lg:w-[90%] max-md:w-[95%] max-lg:flex-wrap max-lg:gap-3 max-md:flex-col max-md:items-start max-md:p-3 max-md:pr-4 max-md:gap-3">
          <div className="flex items-center gap-4 shrink-0 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-3">
            <h2 className="text-xl font-normal text-text-primary m-0 whitespace-nowrap">{t('credits.history', 'Credit History')}</h2>
            {/* Type Filter Pills - similar to HistoryView */}
            <div className="relative grid grid-cols-3 p-1 rounded-full bg-bg-secondary border border-border-light max-md:w-full">
              {/* Sliding Pill Indicator */}
              <motion.div
                className={cn('absolute top-1 bottom-1 rounded-full', 'bg-bg-primary border border-border-light', 'shadow-sm', 'col-span-1')}
                initial={false}
                animate={{
                  left: filterType === 'all' ? '4px' : filterType === 'deduction' ? 'calc(33.33% + 1px)' : 'calc(66.66% - 2px)',
                }}
                style={{ width: 'calc(33.33% - 3px)' }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
              {filterTypes.map((ft) => (
                <button
                  key={ft.value}
                  className={cn(
                    'bg-transparent border-none py-1.5 px-5 rounded-full z-10 text-sm font-medium cursor-pointer transition-colors duration-200 text-center whitespace-nowrap',
                    'max-lg:px-3 max-lg:text-xs',
                    filterType === ft.value ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  )}
                  onClick={() => setFilterType(ft.value)}
                >
                  {t(ft.labelKey, ft.value)}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Period filter */}
          <div className="flex items-center gap-3 ml-auto flex-1 justify-end flex-wrap max-md:w-full max-md:flex-col max-md:gap-3">
            <div className="relative" ref={filterRef}>
              <button
                className={cn(
                  'flex items-center gap-2 py-2 px-3 bg-transparent border border-border-hover rounded-lg',
                  'cursor-pointer text-sm text-text-secondary font-normal transition-all duration-200',
                  'hover:text-text-primary hover:border-text-primary hover:bg-bg-tertiary whitespace-nowrap shrink-0'
                )}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Calendar size={20} className="opacity-60" />
                <span>
                  {filterDays === 7 && t('credits.last7Days', 'Last 7 days')}
                  {filterDays === 30 && t('credits.last30Days', 'Last 30 days')}
                  {filterDays === 90 && t('credits.last90Days', 'Last 90 days')}
                  {filterDays === 365 && t('credits.lastYear', 'Last year')}
                </span>
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute top-full right-0 mt-1 z-dropdown',
                      'bg-bg-primary border border-border rounded-lg shadow-lg',
                      'p-1.5 min-w-[140px]'
                    )}
                  >
                    {[7, 30, 90, 365].map((days) => (
                      <button
                        key={days}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm rounded-lg',
                          'hover:bg-fill-tertiary transition-colors',
                          filterDays === days ? 'text-text-primary font-medium' : 'text-text-secondary'
                        )}
                        onClick={() => {
                          setFilterDays(days)
                          setIsFilterOpen(false)
                        }}
                      >
                        {days === 7 && t('credits.last7Days', 'Last 7 days')}
                        {days === 30 && t('credits.last30Days', 'Last 30 days')}
                        {days === 90 && t('credits.last90Days', 'Last 90 days')}
                        {days === 365 && t('credits.lastYear', 'Last year')}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Summary Stats Bar */}
        <div className="flex items-center gap-6 py-3 px-4 bg-bg-tertiary w-[80%] mx-auto max-lg:w-[90%] max-md:w-[95%] max-md:gap-4 max-md:flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wide">{t('credits.currentBalance', 'Balance')}</span>
            {creditsLoading ? (
              <Skeleton className="h-4 w-14 rounded" />
            ) : (
              <span className="text-sm font-medium text-text-primary tabular-nums">{balance.toFixed(2)}</span>
            )}
          </div>
          <div className="w-px h-4 bg-border-light max-md:hidden" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wide">{t('credits.totalUsed', 'Used')}</span>
            {summaryLoading ? (
              <Skeleton className="h-4 w-14 rounded" />
            ) : (
              <span className="text-sm text-text-secondary tabular-nums">-{summary.used?.toFixed(2) || '0.00'}</span>
            )}
          </div>
          <div className="w-px h-4 bg-border-light max-md:hidden" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wide">{t('credits.totalAdded', 'Added')}</span>
            {summaryLoading ? (
              <Skeleton className="h-4 w-14 rounded" />
            ) : (
              <span className="text-sm text-text-primary tabular-nums">+{summary.added?.toFixed(2) || '0.00'}</span>
            )}
          </div>
          <div className="w-px h-4 bg-border-light max-md:hidden" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wide">{t('credits.totalTransactions', 'Transactions')}</span>
            {summaryLoading ? (
              <Skeleton className="h-4 w-10 rounded" />
            ) : (
              <span className="text-sm text-text-secondary tabular-nums">{summary.transactions || 0}</span>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-[80%] mx-auto max-lg:w-[90%] max-md:w-[95%] pb-4 pr-0 scrollbar-thin-hover">
          {historyLoading ? (
            // Loading skeleton - full height based on viewport
            // Each row is h-11 (44px), calculate rows to fill available space
            <div className="pt-2">
              {Array.from({ length: Math.max(12, Math.floor((window.innerHeight - 250) / 44)) }).map((_, i) => (
                <SkeletonCreditRow key={i} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock size={64} className="opacity-20 mb-4" />
              <p className="text-text-secondary text-sm">{t('credits.noTransactions', 'No transactions yet')}</p>
            </div>
          ) : isMobile ? (
            // Mobile cards
            <div className="flex flex-col gap-3 p-4">{transactions.map((tx, index) => renderMobileCard(tx, index))}</div>
          ) : (
            // Desktop table
            <table className="w-full border-collapse text-sm table-auto bg-transparent">
              <thead className="sticky top-0 bg-bg-tertiary/80 backdrop-blur-md z-base border-b border-border-light">
                <tr>
                  <th className="text-left py-2.5 pr-3 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10 pl-4 min-w-40">
                    {t('credits.description', 'Description')}
                  </th>
                  <th className="w-28 text-left py-2.5 pl-4 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10 max-lg:hidden">
                    {t('credits.type', 'Type')}
                  </th>
                  <th className="w-32 text-left py-2.5 pl-4 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10">
                    {t('credits.time', 'Time')}
                  </th>
                  <th className="w-28 text-right py-2.5 pl-4 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10">
                    {t('credits.amount', 'Amount')}
                  </th>
                  <th className="w-24 text-right py-2.5 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10 max-xl:hidden">
                    {t('credits.balanceAfter', 'Balance')}
                  </th>
                </tr>
              </thead>
              <tbody>{transactions.map((tx, index) => renderTableRow(tx, index))}</tbody>
            </table>
          )}

          {/* Load more */}
          {hasNextPage && !historyLoading && (
            <div className="flex justify-center pt-4">
              <button
                className={cn(
                  'px-4 py-2 text-sm text-text-secondary',
                  'hover:text-text-primary transition-colors',
                  isFetchingNextPage && 'opacity-50 cursor-wait'
                )}
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load more')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreditHistoryView
