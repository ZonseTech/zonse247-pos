import { FunctionComponent, useEffect, useState } from 'react';
import { ShoppingCart, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';

const StatsCards: FunctionComponent = () => {
    const { getStats } = usePurchaseOrders();
    const [stats, setStats] = useState<PurchaseOrderStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        const data = await getStats();
        if (data) setStats(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            label: 'Total Orders',
            value: stats.totalOrders || 0,
            icon: ShoppingCart,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Pending',
            value: stats.pendingOrders || 0,
            icon: Clock,
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            label: 'Received',
            value: stats.receivedOrders || 0,
            icon: CheckCircle,
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Total Value',
            value: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'MWK',
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(stats.totalValue || 0),
            icon: TrendingUp,
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            iconColor: 'text-purple-600 dark:text-purple-400',
            isFormatted: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    {stat.label}
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;
