import type { FunctionComponent } from 'react';
import { DollarSign, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import StatTile from './StatTile';
import type { DashboardSummary } from '../../../services/dashboard.service';
import { formatCurrency } from '../../../utils';

export interface StatsRowProps {
    summary: DashboardSummary | null;
    isSummaryLoading: boolean;
    lowStockCount: number;
    isLowStockLoading: boolean;
}

const StatsRow: FunctionComponent<StatsRowProps> = ({ summary, isSummaryLoading, lowStockCount, isLowStockLoading }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatTile
            label="Today's Revenue"
            value={formatCurrency(summary?.todaysRevenue ?? 0, true)}
            delta={summary?.revenueDelta}
            icon={<DollarSign className="w-5 h-5 text-sky-500" />}
            accent="bg-sky-500"
            isLoading={isSummaryLoading}
        />
        <StatTile
            label="Today's Expenses"
            value={formatCurrency(summary?.todaysExpenses ?? 0, true)}
            delta={summary?.expensesDelta}
            icon={<Receipt className="w-5 h-5 text-orange-500" />}
            accent="bg-orange-500"
            isLoading={isSummaryLoading}
        />
        <StatTile
            label="Net Profit"
            value={formatCurrency(summary?.todaysNetProfit ?? 0, true)}
            delta={summary?.netProfitDelta}
            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            accent="bg-emerald-500"
            isLoading={isSummaryLoading}
        />
        <StatTile
            label="Low Stock Alerts"
            value={`${lowStockCount} items`}
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            accent="bg-amber-500"
            isLoading={isLowStockLoading}
        />
    </div>
);

export default StatsRow;
