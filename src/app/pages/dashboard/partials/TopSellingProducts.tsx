import { useMemo, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import { Package } from 'lucide-react';
import Panel from './Panel';
import ViewAllButton from './ViewAllButton';
import type { TopSellingProduct as TopSellingProductItem } from '../../../services/dashboard.service';
import { ROUTES } from '../../../utils/constants';

export interface TopSellingProductsProps {
    products: TopSellingProductItem[];
    isLoading?: boolean;
}

const TopSellingProducts: FunctionComponent<TopSellingProductsProps> = ({ products, isLoading }) => {
    const navigate = useNavigate();
    const maxUnitsSold = useMemo(
        () => Math.max(1, ...products.map((p) => p.unitsSold)),
        [products]
    );

    return (
        <Panel
            title="Top selling products"
            icon={<Package className="w-4 h-4" />}
            action={<ViewAllButton onClick={() => navigate(ROUTES.REPORTS)} />}
        >
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="h-6 rounded bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No sales yet
                </div>
            ) : (
                <div className="space-y-4">
                    {products.map((product, index) => {
                        const percentage = Math.round((product.unitsSold / maxUnitsSold) * 100);
                        return (
                            <div key={product.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-semibold text-gray-500 dark:text-gray-300 flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {product.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white flex-shrink-0">
                                        {product.unitsSold} sold
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${percentage}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
};

export default TopSellingProducts;
