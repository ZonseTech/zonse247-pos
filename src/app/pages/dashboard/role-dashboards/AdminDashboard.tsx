import { Link } from 'react-router';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import {
    HiOutlineBanknotes,
    HiOutlineBuildingStorefront,
    HiOutlineUserGroup,
    HiOutlineChartBar,
    HiOutlineCurrencyDollar,
    HiOutlineArrowTrendingUp,
    HiOutlineExclamationTriangle,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2';
import { RiMedicineBottleFill } from 'react-icons/ri';
import { Building2, Users, ShoppingCart, TrendingUp, AlertTriangle, Package } from 'lucide-react';

import DataTable from '../partials/DataTable';
import StatCard from '../../../components/card/StatCard';
import MonthlySalesChart from '../partials/MonthlySalesChart';
import RenderTopProductRow from '../partials/RenderTopProductRow';
import dashboardService from '../../../services/dashboard.service';
import { formatCurrency, isCurrentMonth, isFutureMonth } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import type { RoleDashboardProps, AdminDashboardCounts, QuickAction } from '../types';

const topProductsHeaders = [
    { name: 'Product', align: 'left' as const },
    { name: 'Category', align: 'left' as const },
    { name: 'Qty.', align: 'right' as const },
    { name: 'Amount', align: 'right' as const },
];

/**
 * Admin Dashboard
 * Full system overview for super-admin, tenant-owner, and admin roles
 */
const AdminDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const [expiredProductsCount, setExpiredProductsCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [currentMonthYear, setCurrentMonthYear] = useState<Date>(new Date());
    const [topProductsData, setTopProductsData] = useState<Array<TopProduct>>([]);
    const [monthlySalesData, setMonthlySalesData] = useState<Array<MonthlySales>>([]);
    const [dashboardCounts, setDashboardCounts] = useState<AdminDashboardCounts>({} as AdminDashboardCounts);

    const [cards, setCards] = useState([
        { key: 'totalSales', title: 'Total Revenue', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500 dark:bg-green-500', link: ROUTES.SALES },
        { key: 'stock', title: 'Total Products', value: 0, icon: <HiOutlineBuildingStorefront />, bgColor: 'bg-sky-500 dark:bg-sky-500', link: ROUTES.INVENTORY },
        { key: 'allCustomers', title: 'Total Customers', value: 0, icon: <HiOutlineUserGroup />, bgColor: 'bg-purple-500 dark:bg-purple-600', link: ROUTES.CUSTOMERS },
        { key: 'totalUsers', title: 'Total Users', value: 0, icon: <Users size={20} />, bgColor: 'bg-orange-500 dark:bg-orange-600', link: ROUTES.USERS },
    ]);

    // Quick actions for admin
    const quickActions: QuickAction[] = [
        { label: 'New Sale', icon: <ShoppingCart size={18} />, onClick: () => navigate(ROUTES.POS), color: 'bg-green-500 hover:bg-green-700' },
        { label: 'Add Product', icon: <Package size={18} />, onClick: () => navigate(ROUTES.INVENTORY_FORM), color: 'bg-sky-500 hover:bg-sky-700' },
        { label: 'Add User', icon: <Users size={18} />, onClick: () => navigate(ROUTES.USER_FORM), color: 'bg-purple-600 hover:bg-purple-700' },
        { label: 'View Reports', icon: <HiOutlineChartBar size={18} />, onClick: () => navigate(ROUTES.SALES), color: 'bg-orange-600 hover:bg-orange-700' },
    ];

    useEffect(() => {
        if (dashboardCounts) {
            const updatedCards = cards.map(card => ({
                ...card,
                value: dashboardCounts[card.key] || 0
            }));
            setCards(updatedCards);
            setExpiredProductsCount(dashboardCounts.expiredProducts || 0);
            setLowStockCount(dashboardCounts.lowStockItems || 0);
        }
    }, [dashboardCounts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const monthYear = dayjs(currentMonthYear).format('YYYY-MM');

                const [counts, topProducts, monthlySales] = await Promise.all([
                    dashboardService.counts(),
                    dashboardService.topProducts(),
                    dashboardService.monthlySales(monthYear),
                ]);

                setDashboardCounts(counts as AdminDashboardCounts);
                setTopProductsData(topProducts);
                setMonthlySalesData(monthlySales);
            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (currentMonthYear) {
            (async () => {
                const monthYear = dayjs(currentMonthYear).format('YYYY-MM');
                const monthlySales = await dashboardService.monthlySales(monthYear);
                setMonthlySalesData(monthlySales);
            })();
        }
    }, [currentMonthYear]);

    const goToPreviousDate = () => {
        setCurrentMonthYear(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const goToNextDate = () => {
        setCurrentMonthYear(prevDate => {
            if (isCurrentMonth(prevDate)) return prevDate;
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + 1);
            if (isFutureMonth(newDate)) return prevDate;
            return newDate;
        });
    };

    return (
        <div className="space-y-6">
            {/* Alerts Section */}
            {(expiredProductsCount > 0 || lowStockCount > 0) && (
                <div className="space-y-2">
                    {expiredProductsCount > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" />
                                <div className="text-red-700 dark:text-red-300 font-medium">
                                    {expiredProductsCount} item(s) have expired.
                                </div>
                                <Link
                                    to={ROUTES.INVENTORY}
                                    className="ml-4 text-red-500 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium text-sm transition-colors"
                                >
                                    View Inventory →
                                </Link>
                            </div>
                        </div>
                    )}
                    {lowStockCount > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-3" />
                                <div className="text-amber-700 dark:text-amber-300 font-medium">
                                    {lowStockCount} item(s) are running low on stock.
                                </div>
                                <Link
                                    to={ROUTES.INVENTORY}
                                    className="ml-4 text-amber-500 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-medium text-sm transition-colors"
                                >
                                    Restock Now →
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
                    <div key={index} onClick={() => card.link && navigate(card.link)} className="cursor-pointer">
                        <StatCard
                            label={card.title}
                            value={card.key === 'totalSales' ? formatCurrency(Number(card.value)) : card.value.toString()}
                            icon={card.icon}
                            bgColor={card.bgColor}
                        />
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
                {/* Top Products */}
                <div className="lg:col-span-2">
                    <DataTable<TopProduct>
                        title="Top Selling Products"
                        headers={topProductsHeaders}
                        data={topProductsData}
                        renderRow={p => <RenderTopProductRow product={p} />}
                        icon={<RiMedicineBottleFill className="mr-2 text-sky-500 dark:text-sky-400" />}
                    />
                </div>

                {/* Sales Chart */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <MonthlySalesChart
                            data={monthlySalesData}
                            chartHeader={
                                <Fragment>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-sm">
                                                <HiOutlineCurrencyDollar className="text-green-500 dark:text-green-400 w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {dayjs(currentMonthYear).format('MMMM YYYY')} Revenue
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={goToPreviousDate}
                                                className="p-2 rounded-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                                            >
                                                <HiChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <button
                                                onClick={goToNextDate}
                                                disabled={isCurrentMonth(currentMonthYear)}
                                                className="p-2 rounded-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600"
                                            >
                                                <HiChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>
                                    </div>
                                </Fragment>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Additional Admin Insights */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* System Health */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <HiOutlineChartBar className="text-sky-500 dark:text-sky-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Overview</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{dashboardCounts.totalUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Products</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{dashboardCounts.stock || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{dashboardCounts.allCustomers || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <HiOutlineArrowTrendingUp className="text-green-500 dark:text-green-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Today's Sales</span>
                            <span className="font-semibold text-green-500 dark:text-green-400">
                                {formatCurrency(Number(dashboardCounts.totalSales) || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Avg. Transaction</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.myTotalTransactions > 0
                                    ? formatCurrency(Number(dashboardCounts.totalSales) / dashboardCounts.myTotalTransactions)
                                    : formatCurrency(0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{dashboardCounts.myTotalTransactions || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Package className="text-amber-500 dark:text-amber-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Alerts</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Expired Items</span>
                            <span className={`font-semibold ${expiredProductsCount > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                {expiredProductsCount}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Low Stock Items</span>
                            <span className={`font-semibold ${lowStockCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                                {lowStockCount}
                            </span>
                        </div>
                        <Link
                            to={ROUTES.INVENTORY}
                            className="block mt-4 text-center text-sky-500 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 text-sm font-medium"
                        >
                            Manage Inventory →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
