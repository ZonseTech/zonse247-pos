import { FunctionComponent, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageCheck, PackageX, AlertTriangle, Package } from 'lucide-react';
import { HiArrowRight } from 'react-icons/hi2';
import { ROUTES } from '../../utils/constants';
import { useInventoryStats } from '../../hooks/useInventoryStats';
import { HealthPieChart } from '../charts';

const InventoryStatsCard: FunctionComponent = () => {
    const navigate = useNavigate();
    const { stats, isLoading, fetchCount } = useInventoryStats();

    useEffect(() => {
        fetchCount();
    }, [fetchCount]);

    const count = stats.count;

    const healthScore = useMemo(() => {
        if (!count || count.totalItems === 0) return 100;
        const completeItems = count.totalItems - count.incompleteItems;
        return Math.round((completeItems / count.totalItems) * 100);
    }, [count]);

    return (
        <>
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                    Inventory Health Score
                </h3>
                <button
                    onClick={() => navigate(ROUTES.MOBILE_INVENTORY)}
                    className="flex items-center gap-1 text-sky-500 dark:text-sky-400 text-sm font-medium active:scale-95 transition-transform"
                >
                    <HiArrowRight className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <HealthPieChart percentage={healthScore} />
                            <p className={`text-sm mt-3 text-center ${healthScore >= 75
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : healthScore >= 50
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                {healthScore >= 75
                                    ? 'Strong inventory health'
                                    : healthScore >= 50
                                        ? 'Keep your score above 75% for smooth sales'
                                        : 'Update your inventory data to have accurate reports'
                                }
                            </p>
                        </div>

                        <div className="grid grid-cols-2">
                            <div className="flex flex-col items-center justify-center py-4 px-3 border-r border-b border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-2">
                                    <Package className="w-5 h-5 text-sky-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count?.totalItems || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                            </div>
                            <div className="flex flex-col items-center justify-center py-4 px-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                                    <PackageCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count?.itemsInStock || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">In Stock</p>
                            </div>
                            <div className="flex flex-col items-center justify-center py-4 px-3 border-r border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count?.lowStockItems || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
                            </div>
                            <div className="flex flex-col items-center justify-center py-4 px-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                                    <PackageX className="w-5 h-5 text-red-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count?.expiredItems || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default InventoryStatsCard;
