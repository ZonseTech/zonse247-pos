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
        <div className={`bg-white dark:bg-gray-800 rounded-sm p-4 shadow-none ${className}`}>
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={72}
                            interval={0}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            tickFormatter={yAxisFormatter}
                            width={60}
                        />
                        <Tooltip
                            formatter={formatTooltip}
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                        />
                        <Bar dataKey="value" name="Value" fill={barColor} radius={0} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default ReportBarChart
