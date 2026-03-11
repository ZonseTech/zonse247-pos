import { Link } from 'react-router';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import {
    HiOutlineExclamationTriangle,
    HiOutlineArchiveBox,
    HiOutlineArrowPath,
    HiOutlineClipboardDocumentCheck,
    HiOutlineCurrencyDollar,
    HiOutlineChartBar,
} from 'react-icons/hi2';
import { Package, AlertTriangle, Clock, CheckCircle, XCircle, TrendingDown, Archive, Boxes, TrendingUp, DollarSign } from 'lucide-react';

import StatCard from '../../../components/card/StatCard';
import dashboardService from '../../../services/dashboard.service';
import { useInventoryStats } from '../../../hooks/useInventoryStats';
import { ROUTES } from '../../../utils/constants';
import type { RoleDashboardProps, InventoryDashboardCounts, QuickAction } from '../types';

/**
 * Format currency value
 */
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MWK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format percentage value
 */
const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

/**
 * Inventory Manager Dashboard
 * Specialized view for inventory-manager role focused on stock management
 */
const InventoryDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const [dashboardCounts, setDashboardCounts] = useState<InventoryDashboardCounts>({} as InventoryDashboardCounts);

    // Use the new inventory stats hook
    const { stats, isLoading: statsLoading, fetchAllStats } = useInventoryStats();
    const { overview, topValueItems } = stats;

    const [cards, setCards] = useState([
        { key: 'stock', title: 'Total Products', value: 0, icon: <Package size={20} />, bgColor: 'bg-sky-500 dark:bg-sky-500' },
        { key: 'expiredProducts', title: 'Expired Items', value: 0, icon: <XCircle size={20} />, bgColor: 'bg-red-500 dark:bg-red-500' },
        { key: 'lowStockItems', title: 'Low Stock Items', value: 0, icon: <TrendingDown size={20} />, bgColor: 'bg-amber-500 dark:bg-amber-500' },
        { key: 'recentlyAdded', title: 'Recently Added', value: 0, icon: <Clock size={20} />, bgColor: 'bg-green-500 dark:bg-green-500' },
    ]);

    // Quick actions for inventory manager
    const quickActions: QuickAction[] = [
        { label: 'Add Product', icon: <Package size={18} />, onClick: () => navigate(ROUTES.INVENTORY_FORM), color: 'bg-sky-500 hover:bg-sky-700' },
        { label: 'View All Products', icon: <Boxes size={18} />, onClick: () => navigate(ROUTES.INVENTORY), color: 'bg-green-500 hover:bg-green-700' },
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
                const [counts] = await Promise.all([
                    dashboardService.counts(),
                    fetchAllStats({}, 5), // Fetch inventory stats with top 5 items
                ]);
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
                                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" />
                                <div className="flex-1">
                                    <div className="text-red-700 dark:text-red-300 font-medium">
                                        Critical: {expiredCount} item(s) have expired!
                                    </div>
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        These items need to be removed from inventory immediately.
                                    </p>
                                </div>
                                <Link
                                    to={ROUTES.INVENTORY}
                                    className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                    Review Now
                                </Link>
                            </div>
                        </div>
                    )}
                    {lowStockCount > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-3" />
                                <div className="flex-1">
                                    <div className="text-amber-700 dark:text-amber-300 font-medium">
                                        Warning: {lowStockCount} item(s) are running low on stock
                                    </div>
                                    <p className="text-amber-500 dark:text-amber-400 text-sm mt-1">
                                        Consider reordering these items to avoid stockouts.
                                    </p>
                                </div>
                                <Link
                                    to={ROUTES.INVENTORY}
                                    className="ml-4 px-4 py-2 bg-amber-500 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
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
                {/* Stock Value Overview */}
                {overview && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <HiOutlineCurrencyDollar className="text-emerald-500 dark:text-emerald-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Value</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Total Stock Value */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Stock Value (Cost)</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(overview.totalStockValue)}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-gray-400" />
                            </div>

                            {/* Retail Value */}
                            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Retail Value</p>
                                    <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                                        {formatCurrency(overview.totalRetailValue)}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-emerald-400" />
                            </div>

                            {/* Potential Profit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Potential Profit</p>
                                    <p className="text-xl font-bold text-sky-500 dark:text-sky-400">
                                        {formatCurrency(overview.potentialProfit)}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatPercent(overview.profitMargin)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stock Health */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <HiOutlineArchiveBox className="text-sky-500 dark:text-sky-400 w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Health Overview</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Good Stock */}
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Healthy Stock</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products with adequate stock levels</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-green-500 dark:text-green-400">
                                {overview?.stockHealthSummary?.healthy ?? Math.max(0, (dashboardCounts.stock || 0) - (expiredCount + lowStockCount))}
                            </span>
                        </div>

                        {/* Low Stock */}
                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Low Stock</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products below reorder level</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                                {overview?.stockHealthSummary?.lowStock ?? lowStockCount}
                            </span>
                        </div>

                        {/* Out of Stock */}
                        {overview?.stockHealthSummary?.outOfStock > 0 && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Out of Stock</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Products with zero quantity</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                    {overview.stockHealthSummary.outOfStock}
                                </span>
                            </div>
                        )}

                        {/* Expired */}
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Expired Items</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Products past expiration date</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-red-500 dark:text-red-400">
                                {expiredCount}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Value Items & Category Breakdown */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Top Value Items */}
                {topValueItems.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <TrendingUp className="text-amber-500 dark:text-amber-400 w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Value Items</h3>
                        </div>

                        <div className="space-y-3">
                            {topValueItems.slice(0, 5).map((item, index) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-full text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.categoryName || 'Uncategorized'} • {item.availableQuantity} units
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {formatCurrency(item.totalRetailValue)}
                                        </p>
                                        <p className="text-xs text-green-500 dark:text-green-400">
                                            +{formatCurrency(item.potentialProfit)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Breakdown */}
                {overview?.categoryBreakdown && overview.categoryBreakdown.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <HiOutlineChartBar className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Breakdown</h3>
                        </div>

                        <div className="space-y-3">
                            {overview.categoryBreakdown.slice(0, 5).map((category) => {
                                const percentage = overview.totalProducts > 0
                                    ? (category.productCount / overview.totalProducts) * 100
                                    : 0;
                                return (
                                    <div key={category.categoryId || 'uncategorized'} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {category.categoryName}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {category.productCount} products
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{category.totalQuantity} units</span>
                                            <span>{formatCurrency(category.totalRetailValue)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                to={ROUTES.CATEGORIES}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium text-sm"
                            >
                                View All Categories →
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Priority Tasks */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
                                <span className="text-red-500 dark:text-red-400 font-semibold">{expiredCount} items</span>
                            </div>
                        )}

                        {lowStockCount > 0 && (
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-white font-medium">Reorder low stock items</span>
                                </div>
                                <span className="text-amber-500 dark:text-amber-400 font-semibold">{lowStockCount} items</span>
                            </div>
                        )}

                        {(overview?.stockHealthSummary?.outOfStock ?? 0) > 0 && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-white font-medium">Restock out of stock items</span>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 font-semibold">{overview?.stockHealthSummary?.outOfStock} items</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800/40">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">Regular stock audit</span>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.INVENTORY)}
                                className="text-sky-500 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 font-medium text-sm"
                            >
                                Start →
                            </button>
                        </div>

                        {expiredCount === 0 && lowStockCount === 0 && (overview?.stockHealthSummary?.outOfStock ?? 0) === 0 && (
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

                {/* Unit Price Analysis */}
                {overview && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                <HiOutlineChartBar className="text-cyan-600 dark:text-cyan-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Analysis</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Cost/Unit</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(overview.averageCostPerUnit)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Sell/Unit</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(overview.averageSellingPricePerUnit)}
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</p>
                                <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                                    {overview.totalStockQuantity.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                                <p className="text-xl font-bold text-sky-500 dark:text-sky-400">
                                    {overview.totalProducts.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stock Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <HiOutlineArrowPath className="text-green-500 dark:text-green-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Summary</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardCounts.stock || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Products</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-3xl font-bold text-green-500 dark:text-green-400">
                            {Math.round((Math.max(0, (dashboardCounts.stock || 0) - (expiredCount + lowStockCount)) / Math.max(1, dashboardCounts.stock || 1)) * 100)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Health</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-3xl font-bold text-sky-500 dark:text-sky-400">{dashboardCounts.recentlyAdded || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Added This Week</p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to={ROUTES.INVENTORY}
                        className="inline-flex items-center gap-2 text-sky-500 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 font-medium"
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
