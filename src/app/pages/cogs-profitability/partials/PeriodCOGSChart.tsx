import { FC } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../../utils';

interface PeriodCOGSChartProps {
    items: PeriodCOGSProductItem[];
    summary: PeriodCOGSSummary | null;
    salesItems: PeriodCOGSProductItem[];
    salesSummary: PeriodCOGSFromSalesResult['summary'] | null;
    showCrossCheck: boolean;
    isLoading: boolean;
    cogsDiscrepancy: number | null;
    hasDiscrepancy: boolean;
}

const PeriodCOGSChart: FC<PeriodCOGSChartProps> = ({
    items, summary, salesItems, salesSummary, showCrossCheck, isLoading, cogsDiscrepancy, hasDiscrepancy,
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading COGS data...</p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Select a date range and click Refresh to load COGS data.</p>
            </div>
        );
    }

    // Build chart data — top 15 by COGS
    const sorted = [...items].sort((a, b) => b.cogs - a.cogs);
    const top = sorted.slice(0, 15);

    const chartData = top.map((item) => {
        const label = item.variantName && item.variantName !== 'Default'
            ? `${item.productName} – ${item.variantName}`
            : item.productName;
        const entry: Record<string, any> = {
            name: label.length > 20
                ? label.substring(0, 18) + '…'
                : label,
            fullName: label,
            ledgerCOGS: item.cogs,
        };

        if (showCrossCheck && salesItems?.length > 0) {
            const salesItem = salesItems.find(
                (s) => s.productId === item.productId
            );
            entry.salesCOGS = salesItem?.cogs ?? 0;
        }

        return entry;
    });

    return (
        <div className="space-y-4">
            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                    label="Total COGS (Ledger)"
                    value={formatCurrency(summary.totalCOGS, true)}
                    color="text-red-600 dark:text-red-400"
                />
                <MiniStat
                    label="Units Sold"
                    value={summary.totalUnitsSold.toLocaleString()}
                    color="text-sky-600 dark:text-sky-400"
                />
                <MiniStat
                    label="Sale Movements"
                    value={summary.saleMovementCount.toLocaleString()}
                    color="text-indigo-600 dark:text-indigo-400"
                />
                {showCrossCheck && salesSummary && (
                    <MiniStat
                        label="COGS (Sales)"
                        value={formatCurrency(salesSummary.totalCOGS, true)}
                        color="text-amber-600 dark:text-amber-400"
                    />
                )}
            </div>

            {/* Discrepancy Warning */}
            {showCrossCheck && hasDiscrepancy && cogsDiscrepancy !== null && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        <span className="font-semibold">COGS discrepancy detected:</span>{' '}
                        Ledger ({formatCurrency(summary.totalCOGS, true)}) vs Sales
                        ({formatCurrency(salesSummary!.totalCOGS, true)}) differ by{' '}
                        <span className="font-bold">{formatCurrency(cogsDiscrepancy, true)}</span>.
                        This may indicate missing or duplicate cost entries.
                    </p>
                </div>
            )}

            {showCrossCheck && !hasDiscrepancy && salesSummary && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <span className="text-emerald-500 text-sm">✓</span>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Ledger COGS and Sales COGS match — no discrepancy.
                    </p>
                </div>
            )}

            {/* Bar Chart */}
            {chartData.length > 0 ? (
                <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="stroke-gray-200 dark:stroke-gray-700 opacity-50"
                            />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                tickFormatter={(v) => formatCurrency(v)}
                                width={70}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    formatCurrency(value, true),
                                    name === 'ledgerCOGS' ? 'Ledger COGS' : 'Sales COGS',
                                ]}
                                labelFormatter={(label, payload) => {
                                    const item = payload?.[0]?.payload;
                                    return item?.fullName || label;
                                }}
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: '#9ca3af', fontWeight: 600 }}
                            />
                            {showCrossCheck && salesItems?.length > 0 && (
                                <Legend
                                    wrapperStyle={{ fontSize: 11 }}
                                    formatter={(value) =>
                                        value === 'ledgerCOGS' ? 'Ledger COGS' : 'Sales COGS'
                                    }
                                />
                            )}
                            <Bar
                                dataKey="ledgerCOGS"
                                name="ledgerCOGS"
                                fill="#ef4444"
                                radius={[3, 3, 0, 0]}
                                maxBarSize={40}
                            />
                            {showCrossCheck && salesItems?.length > 0 && (
                                <Bar
                                    dataKey="salesCOGS"
                                    name="salesCOGS"
                                    fill="#f59e0b"
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={40}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    No COGS data for the selected period.
                </div>
            )}
        </div>
    );
};

// ─── Mini Stat ─────────────────────────────────────────────────────────────

const MiniStat: FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            {label}
        </p>
        <p className={`text-lg font-bold ${color} mt-0.5`}>{value}</p>
    </div>
);

export default PeriodCOGSChart;
