import { useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router';
import {
    HiOutlineBanknotes,
    HiOutlineClipboardDocumentList,
    HiOutlineClock,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2';
import { ShoppingCart, Receipt, TrendingUp, Target, Award, Clock } from 'lucide-react';

import DataTable from '../partials/DataTable';
import StatCard from '../../../components/card/StatCard';
import RenderTransactionRow from '../partials/RenderTransactionRow';
import dashboardService from '../../../services/dashboard.service';
import TransactionDetailsModal from '../../transactions/partials/TransactionDetailsModal';
import { formatCurrency } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import type { RoleDashboardProps, CashierDashboardCounts, QuickAction } from '../types';

const transactionsHeaders = [
    { name: 'Ref', align: 'left' as const },
    { name: 'Method', align: 'left' as const },
    { name: 'Amount', align: 'right' as const },
    { name: 'Date', align: 'right' as const },
];

/**
 * Cashier Dashboard
 * Sales-focused view for cashier, senior-cashier, and stock-clerk roles
 */
const CashierDashboard: FunctionComponent<RoleDashboardProps> = ({ user, isLoading, setIsLoading }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Array<Transaction>>([]);
    const [transaction, setTransaction] = useState<Transaction>({} as Transaction);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [dashboardCounts, setDashboardCounts] = useState<CashierDashboardCounts>({} as CashierDashboardCounts);

    const [pageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const offset = (currentPage - 1) * pageSize;
    const startRecord = offset + 1;
    const endRecord = Math.min(offset + pageSize, totalRecords);

    const [cards, setCards] = useState([
        { key: 'totalSales', title: 'My Total Sales', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500 dark:bg-green-600' },
        { key: 'myTotalTransactions', title: 'My Transactions', value: 0, icon: <Receipt size={20} />, bgColor: 'bg-blue-500 dark:bg-blue-600' },
        { key: 'avgTransaction', title: 'Avg Transaction', value: 0, icon: <TrendingUp size={20} />, bgColor: 'bg-purple-500 dark:bg-purple-600' },
        { key: 'todayTransactions', title: 'Today\'s Count', value: 0, icon: <Clock size={20} />, bgColor: 'bg-orange-500 dark:bg-orange-600' },
    ]);

    useEffect(() => {
        if (dashboardCounts) {
            const avgValue = dashboardCounts.myTotalTransactions > 0
                ? Number(dashboardCounts.myTotalSales || dashboardCounts.totalSales) / dashboardCounts.myTotalTransactions
                : 0;

            const updatedCards = cards.map(card => {
                if (card.key === 'avgTransaction') {
                    return { ...card, value: avgValue };
                }
                if (card.key === 'totalSales') {
                    return { ...card, value: dashboardCounts.myTotalSales || dashboardCounts.totalSales || 0 };
                }
                return { ...card, value: dashboardCounts[card.key] || 0 };
            });
            setCards(updatedCards);
        }
    }, [dashboardCounts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = user.userId;
                const [counts, myTransactions] = await Promise.all([
                    dashboardService.counts(userId),
                    dashboardService.transactions(userId, pageSize, offset),
                ]);

                setDashboardCounts(counts as unknown as CashierDashboardCounts);
                setTransactions(myTransactions.transactions);
                setTotalRecords(myTransactions.total);
            } catch (error) {
                console.error('Error fetching cashier dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (currentPage && user) {
            (async () => {
                const response = await dashboardService.transactions(user.userId, pageSize, offset);
                setTransactions(response.transactions);
                setTotalRecords(response.total);
            })();
        }
    }, [currentPage, user, pageSize, offset]);

    const getNextLimitData = () => {
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const getPrevLimitData = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage >= Math.ceil(totalRecords / pageSize);
    const avgTransaction = dashboardCounts.myTotalTransactions > 0
        ? Number(dashboardCounts.myTotalSales || dashboardCounts.totalSales) / dashboardCounts.myTotalTransactions
        : 0;

    return (
        <div className="space-y-6">
            {/* Welcome & Quick Start */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Welcome back, {user?.fullname || user?.username}!</h2>
                        <p className="text-green-100 mt-1">Ready to make some sales today?</p>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.POS)}
                        className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <ShoppingCart size={20} />
                        Start Selling
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <StatCard
                        key={index}
                        label={card.title}
                        value={
                            card.key === 'totalSales' || card.key === 'avgTransaction'
                                ? formatCurrency(Number(card.value))
                                : card.value.toString()
                        }
                        icon={card.icon}
                        bgColor={card.bgColor}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* My Transactions - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <DataTable<Transaction>
                        title="My Recent Transactions"
                        headers={transactionsHeaders}
                        data={transactions}
                        renderRow={(trans) => (
                            <RenderTransactionRow
                                trans={trans}
                                setIsOpenDetails={setIsOpenDetails}
                                setTransaction={setTransaction}
                            />
                        )}
                        icon={<HiOutlineClipboardDocumentList className="mr-2 text-blue-600 dark:text-blue-400" />}
                    >
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800/50 px-4 py-3 rounded-sm'>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {startRecord}-{endRecord} of {totalRecords} transactions
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
                                    Page {currentPage} of {Math.ceil(totalRecords / pageSize) || 1}
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

                {/* Performance Summary */}
                <div className="space-y-6">
                    {/* Today's Performance */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Target className="text-green-600 dark:text-green-400 w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Performance</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {formatCurrency(Number(dashboardCounts.myTotalSales || dashboardCounts.totalSales) || 0)}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Transactions</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {dashboardCounts.myTotalTransactions || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Avg Sale</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(avgTransaction)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Award className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tips</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>Use barcode scanner for faster checkout</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>Double-check payment method before completing sale</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>Always print receipt for customer</span>
                            </li>
                        </ul>
                    </div>
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

export default CashierDashboard;
