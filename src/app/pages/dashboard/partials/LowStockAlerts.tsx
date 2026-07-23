import type { FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import Panel from './Panel';
import ViewAllButton from './ViewAllButton';
import type { LowStockItem } from '../../../services/dashboard.service';
import { ROUTES } from '../../../utils/constants';

export interface LowStockAlertsProps {
    items: LowStockItem[];
    isLoading?: boolean;
    className?: string;
}

const LowStockAlerts: FunctionComponent<LowStockAlertsProps> = ({ items, isLoading, className }) => {
    const navigate = useNavigate();

    if (!isLoading && items.length === 0) return null;

    return (
        <Panel
            title="Low stock alerts"
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            action={<ViewAllButton onClick={() => navigate(ROUTES.INVENTORY)} />}
            className={className}
        >
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {items.map((item) => {
                        const percentage = item.reorderPoint > 0
                            ? Math.min(100, Math.round((item.remaining / item.reorderPoint) * 100))
                            : 0;
                        return (
                            <div
                                key={item.name}
                                className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10 p-3"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">
                                        {item.name}
                                    </span>
                                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex-shrink-0">
                                        {item.remaining} left
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
                                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${percentage}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
};

export default LowStockAlerts;
