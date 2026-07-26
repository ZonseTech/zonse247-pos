import { useMemo, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import { Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Panel from './Panel';
import ViewAllButton from './ViewAllButton';
import type { DashboardDataPoint } from '../../../services/dashboard.service';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { ROUTES } from '../../../utils/constants';

// Expense category names are tenant-defined free text (unlike the small known
// set of payment methods), so categories are distinguished by color swatch
// alone rather than per-name icon matching - see PaymentMethodsChart.tsx.
const FALLBACK_COLORS = ['#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#14b8a6'];

export interface ExpensesByCategoryChartProps {
    data: DashboardDataPoint[];
    isLoading?: boolean;
}

const ExpensesByCategoryChart: FunctionComponent<ExpensesByCategoryChartProps> = ({ data, isLoading }) => {
    const navigate = useNavigate();
    const totalExpenses = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
    const categories = useMemo(
        () => data.map((item, index) => ({ ...item, color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] })),
        [data]
    );

    return (
        <Panel
            title="Expenses by category"
            icon={<Receipt className="w-4 h-4" />}
            action={<ViewAllButton onClick={() => navigate(ROUTES.EXPENSES)} />}
        >
            {isLoading ? (
                <div className="h-[180px] rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
            ) : categories.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                    No approved expenses yet
                </div>
            ) : (
                <>
                    <div className="relative" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={56}
                                    outerRadius={78}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {categories.map((category) => (
                                        <Cell key={category.label} fill={category.color} />
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
                                {formatCurrencyShort(totalExpenses)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {categories.map((category) => {
                            const percentage = totalExpenses > 0 ? Math.round((category.value / totalExpenses) * 100) : 0;
                            return (
                                <div key={category.label} className="flex items-center gap-2.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate">{category.label}</span>
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

export default ExpensesByCategoryChart;
