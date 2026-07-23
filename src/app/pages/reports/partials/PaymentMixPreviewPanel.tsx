import { useMemo, type FunctionComponent } from 'react';
import { Wallet, CreditCard, Smartphone, Landmark, type LucideIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Panel from '../../dashboard/partials/Panel';
import ViewAllButton from '../../dashboard/partials/ViewAllButton';
import PanelErrorState from './PanelErrorState';
import { formatCurrencyShort } from '../../../utils';
import { REPORT_DETAIL_CONFIGS, BREAKDOWN_COLORS } from './reportDetailConfigs';
import { normalizeReportPoints } from './reportDataNormalizers';
import { REPORT_ID_ICONS } from './reportVisuals';
import type { ReportDetailRawData } from '../../../hooks/useReportsSummary';

// Provider names vary per tenant (any bank/mobile-money brand), so icon
// selection is pattern-based rather than an exact-name lookup — same
// approach as dashboard/partials/PaymentMethodsChart.tsx.
const getPaymentMethodIcon = (label: string): LucideIcon => {
    const lower = label.toLowerCase();
    if (lower.includes('cash')) return Wallet;
    if (lower.includes('card')) return CreditCard;
    if (lower.includes('mobile') || lower.includes('money') || lower.includes('mpamba') || lower.includes('airtel')) return Smartphone;
    return Landmark;
};

export interface PaymentMixPreviewPanelProps {
    rawData: ReportDetailRawData['payment-modes'] | null;
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
    onViewDetails: () => void;
    className?: string;
}

const config = REPORT_DETAIL_CONFIGS['payment-modes'];

const PaymentMixPreviewPanel: FunctionComponent<PaymentMixPreviewPanelProps> = ({
    rawData,
    isLoading,
    error,
    onRetry,
    onViewDetails,
    className,
}) => {
    const points = useMemo(() => normalizeReportPoints('payment-modes', rawData, 'hourly'), [rawData]);
    const totalVolume = useMemo(() => points.reduce((sum, p) => sum + p.value, 0), [points]);
    const methods = useMemo(
        () => points.map((point, index) => ({
            ...point,
            color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
            icon: getPaymentMethodIcon(point.label),
        })),
        [points],
    );

    return (
        <Panel
            title="Payment Modes"
            icon={REPORT_ID_ICONS['payment-modes']}
            className={className}
            action={<ViewAllButton label="View details" onClick={onViewDetails} />}
        >
            {error ? (
                <PanelErrorState message={error} onRetry={onRetry} />
            ) : isLoading ? (
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
                                    formatter={(value: number) => config.valueFormatter(value)}
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

export default PaymentMixPreviewPanel;
