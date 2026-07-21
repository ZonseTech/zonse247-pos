import { useMemo, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, CreditCard, Smartphone, Landmark, type LucideIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Panel from './Panel';
import ViewAllButton from './ViewAllButton';
import type { DashboardDataPoint } from '../../../services/dashboard.service';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { ROUTES } from '../../../utils/constants';

// Presentation-only styling for well-known payment method names; anything
// else falls back to a color from the palette below, cycled by position.
const KNOWN_PAYMENT_STYLES: Record<string, { color: string; icon: LucideIcon }> = {
    Cash: { color: '#0ea5e9', icon: Wallet },
    Card: { color: '#10b981', icon: CreditCard },
    'Mobile Money': { color: '#f59e0b', icon: Smartphone },
    'Bank Transfer': { color: '#8b5cf6', icon: Landmark },
};

const FALLBACK_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const getPaymentMethodStyle = (label: string, index: number) =>
    KNOWN_PAYMENT_STYLES[label] ?? { color: FALLBACK_COLORS[index % FALLBACK_COLORS.length], icon: Wallet };

export interface PaymentMethodsChartProps {
    data: DashboardDataPoint[];
    isLoading?: boolean;
}

const PaymentMethodsChart: FunctionComponent<PaymentMethodsChartProps> = ({ data, isLoading }) => {
    const navigate = useNavigate();
    const totalVolume = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
    const methods = useMemo(
        () => data.map((item, index) => ({ ...item, ...getPaymentMethodStyle(item.label, index) })),
        [data]
    );

    return (
        <Panel
            title="Payment methods"
            icon={<Wallet className="w-4 h-4" />}
            action={<ViewAllButton onClick={() => navigate(ROUTES.REPORTS)} />}
        >
            {isLoading ? (
                <div className="h-[180px] rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
            ) : methods.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                    No payment data yet
                </div>
            ) : (
                <>
                    <div className="relative" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={methods}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={56}
                                    outerRadius={78}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {methods.map((method) => (
                                        <Cell key={method.label} fill={method.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value, true)}
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">Total</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatCurrencyShort(totalVolume)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {methods.map((method) => {
                            const Icon = method.icon;
                            const percentage = totalVolume > 0 ? Math.round((method.value / totalVolume) * 100) : 0;
                            return (
                                <div key={method.label} className="flex items-center gap-2.5">
                                    <span
                                        className="flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0"
                                        style={{ backgroundColor: `${method.color}1f`, color: method.color }}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate">{method.label}</span>
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </Panel>
    );
};

export default PaymentMethodsChart;
