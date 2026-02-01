import { Link } from 'react-router';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import {
    HiOutlineBanknotes,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineCalculator,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2';
import { DollarSign, TrendingUp, Receipt, CreditCard, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

import StatCard from '../../../components/card/StatCard';
import MonthlySalesChart from '../partials/MonthlySalesChart';
import dashboardService from '../../../services/dashboard.service';
import { formatCurrency, isCurrentMonth, isFutureMonth } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import type { RoleDashboardProps, AccountantDashboardCounts, QuickAction } from '../types';

/**
 * Accountant Dashboard
 * Financial focused view for accountant role
 */
const AccountantDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const [currentMonthYear, setCurrentMonthYear] = useState<Date>(new Date());
    const [monthlySalesData, setMonthlySalesData] = useState<Array<MonthlySales>>([]);
    const [dashboardCounts, setDashboardCounts] = useState<AccountantDashboardCounts>({} as AccountantDashboardCounts);

    const [cards, setCards] = useState([
        { key: 'totalSales', title: 'Total Revenue', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500 dark:bg-green-500' },
        { key: 'myTotalTransactions', title: 'Total Transactions', value: 0, icon: <Receipt size={20} />, bgColor: 'bg-sky-500 dark:bg-sky-500' },
        { key: 'allCustomers', title: 'Total Customers', value: 0, icon: <CreditCard size={20} />, bgColor: 'bg-purple-500 dark:bg-purple-600' },
        { key: 'stock', title: 'Products', value: 0, icon: <Wallet size={20} />, bgColor: 'bg-orange-500 dark:bg-orange-600' },
    ]);

    // Quick actions for accountant
    const quickActions: QuickAction[] = [
        { label: 'View Sales', icon: <Receipt size={18} />, onClick: () => navigate(ROUTES.SALES), color: 'bg-sky-500 hover:bg-sky-700' },
        { label: 'Sales Reports', icon: <HiOutlineDocumentText size={18} />, onClick: () => navigate(ROUTES.SALES), color: 'bg-green-500 hover:bg-green-700' },
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
                const monthYear = dayjs(currentMonthYear).format('YYYY-MM');

                const [counts, monthlySales] = await Promise.all([
                    dashboardService.counts(),
                    dashboardService.monthlySales(monthYear),
                ]);

                setDashboardCounts(counts as unknown as AccountantDashboardCounts);
                setMonthlySalesData(monthlySales);
            } catch (error) {
                console.error('Error fetching accountant dashboard data:', error);
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

    // Calculate totals from monthly data
    const monthlyTotal = monthlySalesData.reduce((sum, day) => sum + (day.totalAmount || 0), 0);
    const avgDailyRevenue = monthlySalesData.length > 0 ? monthlyTotal / monthlySalesData.length : 0;
    const avgTransactionValue = dashboardCounts.myTotalTransactions > 0
        ? Number(dashboardCounts.totalSales) / dashboardCounts.myTotalTransactions
        : 0;

    return (
        <div className="space-y-6">
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
                        value={card.key === 'totalSales' ? formatCurrency(Number(card.value)) : card.value.toString()}
                        icon={card.icon}
                        bgColor={card.bgColor}
                    />
                ))}
            </div>

            {/* Financial Summary */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Revenue Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="text-green-500 dark:text-green-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Summary</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                            <span className="text-xl font-bold text-green-500 dark:text-green-400">
                                {formatCurrency(Number(dashboardCounts.totalSales) || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Total</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(monthlyTotal)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Avg Daily Revenue</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(avgDailyRevenue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Transaction Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <HiOutlineCalculator className="text-sky-500 dark:text-sky-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Metrics</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
                            <span className="text-xl font-bold text-sky-500 dark:text-sky-400">
                                {dashboardCounts.myTotalTransactions || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Avg Transaction</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(avgTransactionValue)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.allCustomers || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <TrendingUp className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Products Sold</span>
                            <div className="flex items-center gap-1 text-green-500 dark:text-green-400">
                                <ArrowUpRight className="w-4 h-4" />
                                <span className="font-semibold">{dashboardCounts.stock || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Revenue per Customer</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.allCustomers > 0
                                    ? formatCurrency(Number(dashboardCounts.totalSales) / dashboardCounts.allCustomers)
                                    : formatCurrency(0)}
                            </span>
                        </div>
                    </div>
                    <Link
                        to={ROUTES.SALES}
                        className="block mt-4 text-center text-sky-500 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 text-sm font-medium"
                    >
                        View All Sales →
                    </Link>
                </div>
            </div>

            {/* Sales Chart */}
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
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {dayjs(currentMonthYear).format('MMMM YYYY')} Revenue
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

            {/* Financial Reports Link */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-500 dark:from-sky-500 dark:to-sky-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Need Detailed Reports?</h3>
                        <p className="text-sky-100 mt-1">Access comprehensive financial reports and transaction history.</p>
                    </div>
                    <Link
                        to={ROUTES.SALES}
                        className="px-6 py-3 bg-white text-sky-500 rounded-lg font-medium hover:bg-sky-50 transition-colors"
                    >
                        View Reports
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
