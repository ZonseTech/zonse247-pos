import { useMemo, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Panel from './Panel';
import ViewAllButton from './ViewAllButton';
import type { DashboardDataPoint } from '../../../services/dashboard.service';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { ROUTES } from '../../../utils/constants';

const RevenueTooltip: FunctionComponent<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg bg-gray-900 dark:bg-gray-950 px-3 py-2 shadow-lg border border-gray-800">
            <p className="text-[11px] text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(payload[0].value, true)}</p>
        </div>
    );
};

export interface RevenueChartProps {
    data: DashboardDataPoint[];
    isLoading?: boolean;
    className?: string;
}

const RevenueChart: FunctionComponent<RevenueChartProps> = ({ data, isLoading, className }) => {
    const navigate = useNavigate();
    const totalRevenue = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    return (
        <Panel
            title="Revenue this week"
            icon={<TrendingUp className="w-4 h-4" />}
            className={className}
            action={
                <div className="flex items-center gap-3">
                    {!isLoading && (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Total {formatCurrency(totalRevenue, true)}
                        </span>
                    )}
                    <ViewAllButton onClick={() => navigate(ROUTES.REPORTS)} />
                </div>
            }
        >
            <div style={{ height: 260 }}>
                {isLoading ? (
                    <div className="h-full rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                ) : data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        No revenue data yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => formatCurrencyShort(value)}
                                width={56}
                            />
                            <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#0ea5e9', fillOpacity: 0.08 }} />
                            <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Panel>
    );
};

export default RevenueChart;
