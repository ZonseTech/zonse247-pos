import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

export interface ChartDataPoint {
    label: string
    value: number
}

export interface ReportBarChartProps {
    data: ChartDataPoint[]
    height?: number
    barColor?: string
    tooltipFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    className?: string
}

const ReportBarChart: React.FC<ReportBarChartProps> = ({
    data,
    height = 256,
    barColor = '#0ea5e9',
    tooltipFormatter,
    yAxisFormatter = (value) => value.toLocaleString(),
    className = '',
}) => {
    const formatTooltip = tooltipFormatter || ((value: number) => value.toLocaleString())

    return (
        <div className={className} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={56}
                        interval={0}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={yAxisFormatter}
                        width={56}
                    />
                    <Tooltip
                        formatter={formatTooltip}
                        cursor={{ fill: barColor, fillOpacity: 0.08 }}
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
                    <Bar dataKey="value" name="Value" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default ReportBarChart
