import { Link } from 'react-router';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import dayjs from 'dayjs';
import {
    HiOutlineBanknotes,
    HiOutlineBuildingStorefront,
    HiOutlineUserGroup,
    HiOutlineCurrencyDollar,
    HiOutlineEye,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2';
import { RiMedicineBottleFill } from 'react-icons/ri';
import { Eye, FileText, BarChart2, Lock } from 'lucide-react';

import DataTable from '../partials/DataTable';
import StatCard from '../../../components/card/StatCard';
import MonthlySalesChart from '../partials/MonthlySalesChart';
import RenderTopProductRow from '../partials/RenderTopProductRow';
import dashboardService from '../../../services/dashboard.service';
import { formatCurrency, isCurrentMonth, isFutureMonth } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import { ROLE_IDS } from '../../../constants/roles';
import type { RoleDashboardProps, ReadOnlyDashboardCounts } from '../types';

const topProductsHeaders = [
    { name: 'Product', align: 'left' as const },
    { name: 'Category', align: 'left' as const },
    { name: 'Qty.', align: 'right' as const },
    { name: 'Amount', align: 'right' as const },
];

/**
 * Read-Only Dashboard
 * View-only access for viewer and auditor roles
 */
const ReadOnlyDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const [currentMonthYear, setCurrentMonthYear] = useState<Date>(new Date());
    const [topProductsData, setTopProductsData] = useState<Array<TopProduct>>([]);
    const [monthlySalesData, setMonthlySalesData] = useState<Array<MonthlySales>>([]);
    const [dashboardCounts, setDashboardCounts] = useState<ReadOnlyDashboardCounts>({} as ReadOnlyDashboardCounts);

    const isAuditor = user?.roleId === ROLE_IDS.AUDITOR || user?.roleName === 'auditor';

    const [cards, setCards] = useState([
        { key: 'totalSales', title: 'Total Sales', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500 dark:bg-green-600' },
        { key: 'stock', title: 'Total Products', value: 0, icon: <HiOutlineBuildingStorefront />, bgColor: 'bg-blue-500 dark:bg-blue-600' },
        { key: 'allCustomers', title: 'Total Customers', value: 0, icon: <HiOutlineUserGroup />, bgColor: 'bg-purple-500 dark:bg-purple-600' },
        { key: 'myTotalTransactions', title: 'Total Transactions', value: 0, icon: <FileText size={20} />, bgColor: 'bg-orange-500 dark:bg-orange-600' },
    ]);

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
                const userId = user.userId;
                const monthYear = dayjs(currentMonthYear).format('YYYY-MM');

                const [counts, topProducts, monthlySales] = await Promise.all([
                    dashboardService.counts(userId),
                    dashboardService.topProducts(),
                    dashboardService.monthlySales(userId, monthYear),
                ]);

                setDashboardCounts(counts as unknown as ReadOnlyDashboardCounts);
                setTopProductsData(topProducts);
                setMonthlySalesData(monthlySales);
            } catch (error) {
                console.error('Error fetching read-only dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (currentMonthYear && user) {
            (async () => {
                const monthYear = dayjs(currentMonthYear).format('YYYY-MM');
                const monthlySales = await dashboardService.monthlySales(user.userId, monthYear);
                setMonthlySalesData(monthlySales);
            })();
        }
    }, [currentMonthYear, user]);

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

    const monthlyTotal = monthlySalesData.reduce((sum, day) => sum + (day.totalAmount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Read-Only Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg mr-3">
                        {isAuditor ? <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                        <h3 className="text-blue-900 dark:text-blue-200 font-semibold">
                            {isAuditor ? 'Auditor View' : 'Viewer Mode'}
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                            {isAuditor
                                ? 'You have read-only access with full visibility for audit purposes.'
                                : 'You have read-only access to view sales, products, and reports.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <StatCard
                        key={index}
                        label={card.title}
                        value={card.key === 'totalSales' ? formatCurrency(Number(card.value)) : card.value.toString()}
                        icon={card.icon}
                        bgColor={card.bgColor}
                    />
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
                        icon={<RiMedicineBottleFill className="mr-2 text-blue-600 dark:text-blue-400" />}
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
                                                <HiOutlineCurrencyDollar className="text-green-600 dark:text-green-400 w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                    {dayjs(currentMonthYear).format('MMMM YYYY')} Sales
                                                </h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Total: {formatCurrency(monthlyTotal)}
                                                </p>
                                            </div>
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

            {/* Summary Statistics */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Sales Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <BarChart2 className="text-green-600 dark:text-green-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Summary</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(Number(dashboardCounts.totalSales) || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(monthlyTotal)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Avg Daily Revenue</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(monthlySalesData.length > 0 ? monthlyTotal / monthlySalesData.length : 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Inventory Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <HiOutlineBuildingStorefront className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Summary</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Products</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.stock || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Top Products Listed</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {topProductsData.length}
                            </span>
                        </div>
                    </div>
                    {isAuditor && (
                        <Link
                            to={ROUTES.INVENTORY}
                            className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                        >
                            View Full Inventory →
                        </Link>
                    )}
                </div>

                {/* Transaction Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Summary</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.myTotalTransactions || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Avg Transaction</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.myTotalTransactions > 0
                                    ? formatCurrency(Number(dashboardCounts.totalSales) / dashboardCounts.myTotalTransactions)
                                    : formatCurrency(0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.allCustomers || 0}
                            </span>
                        </div>
                    </div>
                    {isAuditor && (
                        <Link
                            to={ROUTES.TRANSACTIONS}
                            className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                        >
                            View All Transactions →
                        </Link>
                    )}
                </div>
            </div>

            {/* Access Information */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <HiOutlineEye className="text-gray-600 dark:text-gray-400 w-6 h-6" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">What you can view:</h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Sales statistics and charts
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Product performance data
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Customer count information
                            </li>
                            {isAuditor && (
                                <>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Full transaction history
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Complete inventory records
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Access restrictions:</h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-red-500">✗</span> Cannot create or edit records
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-red-500">✗</span> Cannot process transactions
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-red-500">✗</span> Cannot manage users or settings
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadOnlyDashboard;
