import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export interface PieChartDataPoint {
    label: string
    value: number
}

export interface ReportPieChartProps {
    data: PieChartDataPoint[]
    height?: number
    colors?: string[]
    tooltipFormatter?: (value: number) => string
    className?: string
    showLegend?: boolean
}

const DEFAULT_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const ReportPieChart: React.FC<ReportPieChartProps> = ({
    data,
    height = 200,
    colors = DEFAULT_COLORS,
    tooltipFormatter,
    className = '',
    showLegend = false,
}) => {
    const formatTooltip = tooltipFormatter || ((value: number) => value.toLocaleString())

    const chartData = data.map((item) => ({
        name: item.label,
        value: item.value,
    }))

    return (
        <div className={className} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent, x, y }) => (
                            <text x={x} y={y} fill="currentColor" className="text-gray-600 dark:text-gray-300" fontSize={11} textAnchor={x > 200 ? 'start' : 'end'} dominantBaseline="central">
                                {`${name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                        )}
                        labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={formatTooltip}
                        contentStyle={{
                            backgroundColor: '#111827',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                    />
                    {showLegend && (
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => (
                                <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                            )}
                        />
                    )}
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export default ReportPieChart
