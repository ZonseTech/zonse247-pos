import type { FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import Panel from './Panel';
import ViewAllButton from './ViewAllButton';
import type { RecentSaleItem } from '../../../services/dashboard.service';
import { formatCurrency } from '../../../utils';
import { ROUTES } from '../../../utils/constants';

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

export interface RecentSalesProps {
    sales: RecentSaleItem[];
    isLoading?: boolean;
    className?: string;
}

const RecentSales: FunctionComponent<RecentSalesProps> = ({ sales, isLoading, className }) => {
    const navigate = useNavigate();

    return (
        <Panel
            title="Recent sales"
            icon={<ShoppingCart className="w-4 h-4" />}
            action={<ViewAllButton onClick={() => navigate(ROUTES.SALES)} />}
            className={className}
        >
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="h-9 rounded bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                    ))}
                </div>
            ) : sales.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No sales yet today
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {sales.map((sale) => (
                        <div key={sale.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0">
                                {getInitials(sale.customer)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{sale.customer}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{sale.id} · {sale.time}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(sale.amount, true)}
                                </p>
                                <span
                                    className={`inline-flex mt-0.5 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sale.status === 'completed'
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                        }`}
                                >
                                    {sale.status === 'completed' ? 'Completed' : 'Refunded'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
};

export default RecentSales;
