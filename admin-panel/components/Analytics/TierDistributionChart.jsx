/**
 * Tier/Credit Distribution Chart using Recharts
 * Shows user distribution by credit balance
 */

import { useMemo } from 'react'
import { PieChart, BarChart } from '../ui/charts'

const CREDIT_TIERS = [
  { 
    key: 'noCredits',
    name: 'Out of credits', 
    color: '#ef4444',
    icon: 'alert-circle'
  },
  { 
    key: 'low',
    name: 'Thấp (1-50)', 
    color: '#f59e0b',
    icon: 'trending-down'
  },
  { 
    key: 'medium',
    name: 'Medium (51-200)', 
    color: '#3b82f6',
    icon: 'minus'
  },
  { 
    key: 'high',
    name: 'High (200+)', 
    color: '#22c55e',
    icon: 'trending-up'
  }
]

export default function TierDistributionChart({ data }) {
  const { chartData, total, isCreditsData } = useMemo(() => {
    // Support both old tierDistribution and new creditDistribution format
    const isCredits = data.noCredits !== undefined || data.low !== undefined
    
    if (isCredits) {
      const items = CREDIT_TIERS.map(tier => ({
        name: tier.name,
        value: data[tier.key] || 0,
        color: tier.color,
        icon: tier.icon,
      })).filter(item => item.value > 0)
      
      return {
        chartData: items,
        total: items.reduce((sum, item) => sum + item.value, 0),
        isCreditsData: true,
      }
    }
    
    // Fallback for old tier data format
    const items = [
      { name: 'Free', value: data.free || 0, color: '#3b82f6' },
      { name: 'Premium', value: data.premium || 0, color: '#22c55e' },
      { name: 'Enterprise', value: data.enterprise || 0, color: '#8b5cf6' },
    ].filter(item => item.value > 0)
    
    return {
      chartData: items,
      total: items.reduce((sum, item) => sum + item.value, 0),
      isCreditsData: false,
    }
  }, [data])

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <img src="/icon/inbox.svg" alt="Empty" className="w-12 h-12 mb-3 icon-gray" />
        <p className="text-sm">No user data available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Pie Chart */}
      <PieChart
        data={chartData}
        dataKey="value"
        nameKey="name"
        height={240}
        colors={chartData.map(d => d.color)}
        donut
        showLabel={false}
        showLegend={false}
      />

      {/* Legend with details */}
      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-surface-secondary">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-primary">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{item.value.toLocaleString()}</span>
                <span className="text-xs font-medium text-primary w-12 text-right">{percentage}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted">Total users</span>
        <span className="text-lg font-semibold text-primary">{total.toLocaleString()}</span>
      </div>
    </div>
  )
}
