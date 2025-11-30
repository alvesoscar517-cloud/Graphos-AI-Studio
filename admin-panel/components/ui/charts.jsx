/**
 * Chart components using Recharts
 * Lightweight, responsive charts for analytics
 */

import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

// Default color palette
const COLORS = {
  primary: '#000000',
  secondary: '#666666',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

const CHART_COLORS = [
  '#000000',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
]

// Custom tooltip component
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-primary mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

/**
 * Line Chart component
 */
export function LineChart({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  color = COLORS.primary,
  showGrid = true,
  showLegend = false,
  formatter,
  className,
}) {
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey]

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatter}
          />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {showLegend && <Legend />}
          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={Array.isArray(color) ? color[index] : CHART_COLORS[index]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Area Chart component
 */
export function AreaChart({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  color = COLORS.primary,
  showGrid = true,
  formatter,
  className,
}) {
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey]

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatter}
          />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {keys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={Array.isArray(color) ? color[index] : CHART_COLORS[index]}
              fill={Array.isArray(color) ? color[index] : CHART_COLORS[index]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Bar Chart component
 */
export function BarChart({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  color = COLORS.primary,
  showGrid = true,
  horizontal = false,
  formatter,
  className,
}) {
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey]
  const ChartComponent = RechartsBarChart

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12, fill: '#666' }} tickFormatter={formatter} />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tick={{ fontSize: 12, fill: '#666' }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 12, fill: '#666' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#666' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatter}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={Array.isArray(color) ? color[index] : CHART_COLORS[index]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Pie/Donut Chart component
 */
export function PieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  colors = CHART_COLORS,
  donut = false,
  showLabel = true,
  showLegend = true,
  className,
}) {
  const innerRadius = donut ? '60%' : 0

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={2}
            label={showLabel ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
            labelLine={showLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Stats mini chart (sparkline)
 */
export function SparkLine({ data, dataKey = 'value', color = COLORS.primary, height = 40 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { COLORS, CHART_COLORS }
export default {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  SparkLine,
}
