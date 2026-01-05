import { Link } from 'react-router';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import {
    HiOutlineExclamationTriangle,
    HiOutlineArchiveBox,
    HiOutlineArrowPath,
    HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2';
import { Package, AlertTriangle, Clock, CheckCircle, XCircle, TrendingDown, Archive, Boxes } from 'lucide-react';

import StatCard from '../../../components/card/StatCard';
import dashboardService from '../../../services/dashboard.service';
import { ROUTES } from '../../../utils/constants';
import type { RoleDashboardProps, InventoryDashboardCounts, QuickAction } from '../types';

/**
 * Inventory Manager Dashboard
 * Specialized view for inventory-manager role focused on stock management
 */
const InventoryDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const [dashboardCounts, setDashboardCounts] = useState<InventoryDashboardCounts>({} as InventoryDashboardCounts);

    const [cards, setCards] = useState([
        { key: 'stock', title: 'Total Products', value: 0, icon: <Package size={20} />, bgColor: 'bg-blue-500 dark:bg-blue-600' },
        { key: 'expiredProducts', title: 'Expired Items', value: 0, icon: <XCircle size={20} />, bgColor: 'bg-red-500 dark:bg-red-600' },
        { key: 'lowStockItems', title: 'Low Stock Items', value: 0, icon: <TrendingDown size={20} />, bgColor: 'bg-amber-500 dark:bg-amber-600' },
        { key: 'recentlyAdded', title: 'Recently Added', value: 0, icon: <Clock size={20} />, bgColor: 'bg-green-500 dark:bg-green-600' },
    ]);

    // Quick actions for inventory manager
    const quickActions: QuickAction[] = [
        { label: 'Add Product', icon: <Package size={18} />, onClick: () => navigate(ROUTES.INVENTORY_FORM), color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'View All Products', icon: <Boxes size={18} />, onClick: () => navigate(ROUTES.INVENTORY), color: 'bg-green-600 hover:bg-green-700' },
        { label: 'Categories', icon: <Archive size={18} />, onClick: () => navigate(ROUTES.CATEGORIES), color: 'bg-purple-600 hover:bg-purple-700' },
    ];

    useEffect(() => {
        if (dashboardCounts) {
            const updatedCards = cards.map(card => ({
                ...card,
                value: dashboardCounts[card.key] || 0
            }));
            setCards(updatedCards);
        }
    }, [dashboardCounts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const counts = await dashboardService.counts();
                setDashboardCounts(counts as unknown as InventoryDashboardCounts);
            } catch (error) {
                console.error('Error fetching inventory dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const expiredCount = dashboardCounts.expiredProducts || 0;
    const lowStockCount = dashboardCounts.lowStockItems || 0;

    return (
        <div className="space-y-6">
            {/* Critical Alerts */}
            {(expiredCount > 0 || lowStockCount > 0) && (
                <div className="space-y-3">
                    {expiredCount > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                                <div className="flex-1">
                                    <div className="text-red-700 dark:text-red-300 font-medium">
                                        Critical: {expiredCount} item(s) have expired!
                                    </div>
                                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                        These items need to be removed from inventory immediately.
                                    </p>
                                </div>
                                <Link
                                    to={ROUTES.INVENTORY}
                                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                    Review Now
                                </Link>
                            </div>
                        </div>
                    )}
                    {lowStockCount > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" />
                                <div className="flex-1">
                                    <div className="text-amber-700 dark:text-amber-300 font-medium">
                                        Warning: {lowStockCount} item(s) are running low on stock
                                    </div>
                                    <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                                        Consider reordering these items to avoid stockouts.
                                    </p>
                                </div>
                                <Link
                                    to={ROUTES.INVENTORY}
                                    className="ml-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                    Restock
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className={`${action.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-md`}
                        >
                            {action.icon}
                            <span className="font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <StatCard
                        key={index}
                        label={card.title}
                        value={card.value.toString()}
                        icon={card.icon}
                        bgColor={card.bgColor}
                    />
                ))}
            </div>

            {/* Inventory Overview */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Stock Health */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <HiOutlineArchiveBox className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Health Overview</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Good Stock */}
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Healthy Stock</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products with adequate stock levels</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {Math.max(0, (dashboardCounts.stock || 0) - (expiredCount + lowStockCount))}
                            </span>
                        </div>

                        {/* Low Stock */}
                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Low Stock</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products below reorder level</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {lowStockCount}
                            </span>
                        </div>

                        {/* Expired */}
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Expired Items</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products past expiration date</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {expiredCount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Inventory Tasks */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <HiOutlineClipboardDocumentCheck className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Tasks</h3>
                    </div>

                    <div className="space-y-3">
                        {expiredCount > 0 && (
                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-white font-medium">Remove expired items</span>
                                </div>
                                <span className="text-red-600 dark:text-red-400 font-semibold">{expiredCount} items</span>
                            </div>
                        )}

                        {lowStockCount > 0 && (
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-white font-medium">Reorder low stock items</span>
                                </div>
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">{lowStockCount} items</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">Regular stock audit</span>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.INVENTORY)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium text-sm"
                            >
                                Start →
                            </button>
                        </div>

                        {expiredCount === 0 && lowStockCount === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                                <p className="text-gray-900 dark:text-white font-medium">All caught up!</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    No urgent inventory tasks at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stock Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <HiOutlineArrowPath className="text-green-600 dark:text-green-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Summary</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardCounts.stock || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Products</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {Math.round((Math.max(0, (dashboardCounts.stock || 0) - (expiredCount + lowStockCount)) / Math.max(1, dashboardCounts.stock || 1)) * 100)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Health</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboardCounts.recentlyAdded || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Added This Week</p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to={ROUTES.INVENTORY}
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                    >
                        View Full Inventory
                        <span>→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
