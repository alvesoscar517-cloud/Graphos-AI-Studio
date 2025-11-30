/**
 * Usage Statistics Chart using Recharts
 * Shows profiles, analyses, and rewrites statistics
 */

import { useMemo } from 'react'
import { BarChart } from '../ui/charts'

const STAT_CONFIG = [
  { 
    key: 'profiles',
    label: 'Profiles', 
    icon: 'folder',
    color: '#3b82f6',
    bgColor: 'bg-info/10',
  },
  { 
    key: 'analyses',
    label: 'Analyses', 
    icon: 'search',
    color: '#8b5cf6',
    bgColor: 'bg-purple-100',
  },
  { 
    key: 'rewrites',
    label: 'Rewrites', 
    icon: 'edit',
    color: '#f59e0b',
    bgColor: 'bg-warning/10',
  }
]

export default function UsageStatsChart({ profiles = 0, analyses = 0, rewrites = 0 }) {
  const { chartData, stats, total } = useMemo(() => {
    const values = { profiles, analyses, rewrites }
    const sum = profiles + analyses + rewrites
    
    const data = STAT_CONFIG.map(config => ({
      name: config.label,
      value: values[config.key],
      color: config.color,
    }))
    
    const statsWithPercentage = STAT_CONFIG.map(config => ({
      ...config,
      value: values[config.key],
      percentage: sum > 0 ? ((values[config.key] / sum) * 100).toFixed(1) : 0,
    }))
    
    return {
      chartData: data,
      stats: statsWithPercentage,
      total: sum,
    }
  }, [profiles, analyses, rewrites])

  return (
    <div className="w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-xl border border-border ${stat.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <img 
                  src={`/icon/${stat.icon}.svg`} 
                  alt={stat.label} 
                  className="w-4 h-4 icon-dark"
                />
              </div>
              <span className="text-sm font-medium text-muted">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted mt-1">
              {stat.percentage}% tổng số
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <BarChart
        data={chartData}
        dataKey="value"
        xAxisKey="name"
        height={200}
        color={chartData.map(d => d.color)}
        showGrid={false}
        formatter={(value) => value.toLocaleString()}
      />

      {/* Total Summary */}
      <div className="flex items-center justify-between mt-6 p-4 rounded-xl bg-surface-secondary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <img src="/icon/activity.svg" alt="Total" className="w-5 h-5 icon-white" />
          </div>
          <div>
            <div className="text-sm text-muted">Tổng thao tác</div>
            <div className="text-xl font-bold text-primary">{total.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          {stats.map((stat, index) => (
            <span key={index} className="flex items-center gap-1">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: stat.color }}
              />
              {stat.value.toLocaleString()}
              {index < stats.length - 1 && <span className="mx-1">+</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
