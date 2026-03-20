import { FC } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { formatCurrency } from '../../../utils';
import { type BucketKey, BUCKET_COLORS } from '../../../hooks/useInventoryAging';

interface BucketChartData {
    key: BucketKey;
    label: string;
    color: string;
    itemCount: number;
    totalQuantity: number;
    totalValue: number;
}

interface AgingBucketChartProps {
    data: BucketChartData[];
    metric: 'totalValue' | 'itemCount' | 'totalQuantity';
    isDark: boolean;
}

const METRIC_LABELS: Record<string, string> = {
    totalValue: 'Stock Value',
    itemCount: 'Items',
    totalQuantity: 'Quantity',
};

const AgingBucketChart: FC<AgingBucketChartProps> = ({ data, metric, isDark }) => {
    if (!data.length) return null;

    const formatValue = (value: number) =>
        metric === 'totalValue' ? formatCurrency(value, true) : value.toLocaleString();

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#374151' : '#e5e7eb'}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                            metric === 'totalValue'
                                ? v >= 1000000
                                    ? `${(v / 1000000).toFixed(1)}M`
                                    : v >= 1000
                                        ? `${(v / 1000).toFixed(0)}K`
                                        : v.toString()
                                : v.toLocaleString()
                        }
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                        labelStyle={{ color: isDark ? '#f9fafb' : '#111827', fontWeight: 600 }}
                        formatter={(value: number) => [formatValue(value), METRIC_LABELS[metric]]}
                    />
                    <Bar dataKey={metric} radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {data.map((entry) => (
                            <Cell key={entry.key} fill={BUCKET_COLORS[entry.key]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AgingBucketChart;
