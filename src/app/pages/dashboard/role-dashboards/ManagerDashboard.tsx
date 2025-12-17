import { Link } from 'react-router';
import { Fragment, useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import {
    HiOutlineBanknotes,
    HiOutlineBuildingStorefront,
    HiOutlineUserGroup,
    HiOutlineCurrencyDollar,
    HiOutlineClipboardDocumentList,
    HiOutlineExclamationTriangle,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2';
import { RiMedicineBottleFill } from 'react-icons/ri';
import { Users, ShoppingCart, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

import DataTable from '../partials/DataTable';
import StatCard from '../../../components/card/StatCard';
import MonthlySalesChart from '../partials/MonthlySalesChart';
import RenderTopProductRow from '../partials/RenderTopProductRow';
import RenderTransactionRow from '../partials/RenderTransactionRow';
import dashboardService from '../../../services/dashboard.service';
import TransactionDetailsModal from '../../transactions/partials/TransactionDetailsModal';
import { formatCurrency, isCurrentMonth, isFutureMonth } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import type { RoleDashboardProps, ManagerDashboardCounts, QuickAction } from '../types';

const topProductsHeaders = [
    { name: 'Product', align: 'left' as const },
    { name: 'Category', align: 'left' as const },
    { name: 'Qty.', align: 'right' as const },
    { name: 'Amount', align: 'right' as const },
];

const recentTransactionsHeaders = [
    { name: 'Ref', align: 'left' as const },
    { name: 'Method', align: 'left' as const },
    { name: 'Amount', align: 'right' as const },
    { name: 'Date', align: 'right' as const },
];

/**
 * Manager Dashboard
 * Branch operations view for branch-manager, manager, and shift-supervisor roles
 */
const ManagerDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const [expiredProductsCount, setExpiredProductsCount] = useState(0);
    const [currentMonthYear, setCurrentMonthYear] = useState<Date>(new Date());
    const [topProductsData, setTopProductsData] = useState<Array<TopProduct>>([]);
    const [transactions, setTransactions] = useState<Array<Transaction>>([]);
    const [transaction, setTransaction] = useState<Transaction>({} as Transaction);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [monthlySalesData, setMonthlySalesData] = useState<Array<MonthlySales>>([]);
    const [dashboardCounts, setDashboardCounts] = useState<ManagerDashboardCounts>({} as ManagerDashboardCounts);

    const [pageSize] = useState<number>(5);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const offset = (currentPage - 1) * pageSize;
    const startRecord = offset + 1;
    const endRecord = Math.min(offset + pageSize, totalRecords);

    const [cards, setCards] = useState([
        { key: 'totalSales', title: 'Branch Sales', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500 dark:bg-green-600' },
        { key: 'myTotalTransactions', title: 'Transactions Today', value: 0, icon: <HiOutlineClipboardDocumentList />, bgColor: 'bg-blue-500 dark:bg-blue-600' },
        { key: 'stock', title: 'Products in Stock', value: 0, icon: <HiOutlineBuildingStorefront />, bgColor: 'bg-purple-500 dark:bg-purple-600' },
        { key: 'allCustomers', title: 'Customers Served', value: 0, icon: <HiOutlineUserGroup />, bgColor: 'bg-orange-500 dark:bg-orange-600' },
    ]);

    // Quick actions for managers
    const quickActions: QuickAction[] = [
        { label: 'New Sale', icon: <ShoppingCart size={18} />, onClick: () => navigate(ROUTES.POS), color: 'bg-green-600 hover:bg-green-700' },
        { label: 'View Inventory', icon: <Package size={18} />, onClick: () => navigate(ROUTES.INVENTORY), color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Team Members', icon: <Users size={18} />, onClick: () => navigate(ROUTES.USERS), color: 'bg-purple-600 hover:bg-purple-700' },
    ];

    useEffect(() => {
        if (dashboardCounts) {
            const updatedCards = cards.map(card => ({
                ...card,
                value: dashboardCounts[card.key] || 0
            }));
            setCards(updatedCards);
            setExpiredProductsCount(dashboardCounts.expiredProducts || 0);
        }
    }, [dashboardCounts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = user.userId;
                const monthYear = dayjs(currentMonthYear).format('YYYY-MM');

                const [counts, topProducts, myTransactions, monthlySales] = await Promise.all([
                    dashboardService.counts(userId),
                    dashboardService.topProducts(),
                    dashboardService.transactions(userId, pageSize, offset),
                    dashboardService.monthlySales(userId, monthYear),
                ]);

                setDashboardCounts(counts as ManagerDashboardCounts);
                setTopProductsData(topProducts);
                setTransactions(myTransactions.transactions);
                setTotalRecords(myTransactions.total);
                setMonthlySalesData(monthlySales);
            } catch (error) {
                console.error('Error fetching manager dashboard data:', error);
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

    useEffect(() => {
        if (currentPage && user) {
            (async () => {
                const response = await dashboardService.transactions(user.userId, pageSize, offset);
                setTransactions(response.transactions);
                setTotalRecords(response.total);
            })();
        }
    }, [currentPage, user, pageSize, offset]);

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

    const getNextLimitData = () => {
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const getPrevLimitData = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage >= Math.ceil(totalRecords / pageSize);

    return (
        <div className="space-y-6">
            {/* Alerts */}
            {expiredProductsCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" />
                        <div className="text-amber-700 dark:text-amber-300 font-medium">
                            {expiredProductsCount} item(s) have expired and need attention.
                        </div>
                        <Link
                            to={ROUTES.INVENTORY}
                            className="ml-4 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-medium text-sm transition-colors"
                        >
                            Review Items →
                        </Link>
                    </div>
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
                        value={card.key === 'totalSales' ? formatCurrency(Number(card.value)) : card.value.toString()}
                        icon={card.icon}
                        bgColor={card.bgColor}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Top Products */}
                <div>
                    <DataTable<TopProduct>
                        title="Top Selling Products"
                        headers={topProductsHeaders}
                        data={topProductsData.slice(0, 5)}
                        renderRow={p => <RenderTopProductRow product={p} />}
                        icon={<RiMedicineBottleFill className="mr-2 text-blue-600 dark:text-blue-400" />}
                    />
                </div>

                {/* Recent Transactions */}
                <div>
                    <DataTable<Transaction>
                        title="Recent Transactions"
                        headers={recentTransactionsHeaders}
                        data={transactions}
                        renderRow={(trans) => (
                            <RenderTransactionRow
                                trans={trans}
                                setIsOpenDetails={setIsOpenDetails}
                                setTransaction={setTransaction}
                            />
                        )}
                        icon={<HiOutlineClipboardDocumentList className="mr-2 text-green-600 dark:text-green-400" />}
                    >
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800/50 px-4 py-3 rounded-sm'>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {startRecord}-{endRecord} of {totalRecords}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={getPrevLimitData}
                                    disabled={isFirstPage}
                                    className="p-2 rounded-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <HiChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm">
                                    {currentPage} / {Math.ceil(totalRecords / pageSize) || 1}
                                </span>
                                <button
                                    onClick={getNextLimitData}
                                    disabled={isLastPage}
                                    className="p-2 rounded-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <HiChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                        </div>
                    </DataTable>
                </div>
            </div>

            {/* Sales Chart - Full Width */}
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
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {dayjs(currentMonthYear).format('MMMM YYYY')} Sales
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

            {/* Branch Performance Summary */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                {/* Today's Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Summary</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(Number(dashboardCounts.totalSales) || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Transactions</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.myTotalTransactions || 0}
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
                    </div>
                </div>

                {/* Stock Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Package className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Status</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">In Stock</span>
                            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {dashboardCounts.stock || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Expired</span>
                            <span className={`font-semibold flex items-center gap-1 ${expiredProductsCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                <XCircle className={`w-4 h-4 ${expiredProductsCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                                {expiredProductsCount}
                            </span>
                        </div>
                    </div>
                    <Link
                        to={ROUTES.INVENTORY}
                        className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                    >
                        View Inventory →
                    </Link>
                </div>

                {/* Customers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Users className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customers</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dashboardCounts.allCustomers || 0}
                            </span>
                        </div>
                    </div>
                    <Link
                        to={ROUTES.CUSTOMERS}
                        className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                    >
                        View Customers →
                    </Link>
                </div>
            </div>

            <TransactionDetailsModal
                transaction={transaction}
                isOpenDetails={isOpenDetails}
                setIsOpenDetails={setIsOpenDetails}
            />
        </div>
    );
};

export default ManagerDashboard;
