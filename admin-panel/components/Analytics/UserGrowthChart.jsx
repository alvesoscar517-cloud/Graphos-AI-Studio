/**
 * User Growth Chart using Recharts
 * Shows user registration trend over time
 */

import { useMemo } from 'react'
import { AreaChart } from '../ui/charts'
import { formatDate } from '@/lib/dateUtils'

// Group data by week to reduce number of data points
function groupByWeek(data) {
  if (!data || data.length === 0) return []
  
  const weeks = {}
  data.forEach(item => {
    const date = new Date(item.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        date: weekKey,
        count: 0,
        label: formatDate(weekStart, 'dd/MM'),
      }
    }
    weeks[weekKey].count += item.count
  })
  
  return Object.values(weeks).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  )
}

export default function UserGrowthChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // Group by week if more than 14 data points
    const processedData = data.length > 14 ? groupByWeek(data) : data
    
    return processedData.map(item => ({
      name: item.label || formatDate(item.date, 'dd/MM'),
      users: item.count,
    }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <img src="/icon/inbox.svg" alt="Empty" className="w-12 h-12 mb-3 icon-gray" />
        <p className="text-sm">Không có dữ liệu tăng trưởng</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <AreaChart
        data={chartData}
        dataKey="users"
        xAxisKey="name"
        height={280}
        color="#3b82f6"
      />
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-info" />
          <span>New users</span>
        </div>
        <span>•</span>
        <span>Total: {chartData.reduce((sum, d) => sum + d.users, 0).toLocaleString()} users</span>
      </div>
    </div>
  )
}
