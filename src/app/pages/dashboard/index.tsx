import { Link } from 'react-router';
import DataTable from './partials/DataTable';
import AppLayout from '../../layouts/AppLayout';
import { ROUTES } from '../../utils/constants';
import PageLoader from '../../components/PageLoader';
import { useAuth } from '../../context/AuthProvider';
import { RiMedicineBottleFill } from 'react-icons/ri';
import StatCard from '../../components/card/StatCard';
import MonthlySalesChart from './partials/MonthlySalesChart';
import dashboardService from '../../services/dashboard.service';
import RenderTopProductRow from './partials/RenderTopProductRow';
import RenderTransactionRow from './partials/RenderTransactionRow';
import { hasAnyPermission, isCurrentMonth, isFutureMonth } from '../../utils';
import { useState, useEffect, Fragment, type FunctionComponent } from 'react';
import TransactionDetailsModal from '../transactions/partials/TransactionDetailsModal';
import { HiChevronLeft, HiChevronRight, HiOutlineBanknotes, HiOutlineBuildingStorefront, HiOutlineCurrencyDollar, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi2';
import dayjs from 'dayjs';

const topProductsHeaders: TableHeader[] = [
    { name: 'Product', align: 'left' },
    { name: 'Category', align: 'left' },
    { name: 'Qty.', align: 'right' },
    { name: 'Amount', align: 'right' },
];

const topTransactionsHeaders: TableHeader[] = [
    { name: 'Ref', align: 'left' },
    { name: 'Method', align: 'left' },
    { name: 'Amount.', align: 'right' },
    { name: 'Date', align: 'right' },
];

const Dashboard: FunctionComponent = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [expiredProductsCount, setExpiredProductsCount] = useState(0);
    const [transactions, setTransactions] = useState<Array<Transaction>>([]);
    const [currentMonthYear, setCurrentMonthYear] = useState<Date>(new Date());
    const [topProductsData, setTopProductsData] = useState<Array<TopProduct>>([]);
    const [transaction, setTransaction] = useState<Transaction>({} as Transaction);
    const [monthlySalesData, setMonthlySalesData] = useState<Array<MonthlySales>>([]);
    const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({} as DashboardCounts)

    const [pageSize] = useState<number>(9);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const offset = (currentPage - 1) * pageSize;
    const startRecord = offset + 1;
    const endRecord = Math.min(offset + pageSize, totalRecords);

    const [cards, setCards] = useState([
        { key: "totalSales", title: 'Total Sales', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500 dark:bg-green-600' },
        { key: "stock", title: 'Stock', value: 0, icon: <HiOutlineBuildingStorefront />, bgColor: 'bg-blue-500 dark:bg-blue-600' },
        { key: "allCustomers", title: 'All Customers', value: 0, icon: <HiOutlineUserGroup />, bgColor: 'bg-purple-500 dark:bg-purple-600' },
        { key: "myTotalTransactions", title: 'My Transaction', value: 0, icon: <HiOutlineShieldCheck />, bgColor: 'bg-orange-500 dark:bg-orange-600' },
    ]);

    useEffect(() => {
        if (dashboardCounts) {
            const updatedCards = cards.map(card => ({
                ...card,
                value: dashboardCounts[card.key] || 0
            }));

            setCards(updatedCards);
            setExpiredProductsCount(dashboardCounts.expiredProducts || 0);
        }
    }, [dashboardCounts])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = user.userId;
                const monthYear = dayjs(currentMonthYear).format("YYYY-MM");

                const [counts, topProducts, myTransactions, monthlySales] = await Promise.all([
                    dashboardService.counts(userId),
                    dashboardService.topProducts(),
                    dashboardService.transactions(userId, pageSize, offset),
                    dashboardService.monthlySales(userId, monthYear),
                ]);

                setDashboardCounts(counts);

                setTransactions(myTransactions.transactions);
                setTotalRecords(myTransactions.total);

                setTopProductsData(topProducts);
                setMonthlySalesData(monthlySales);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user !== null) fetchData();
    }, [user]);

    useEffect(() => {
        if (currentMonthYear && user) {
            (async () => {
                const monthYear = dayjs(currentMonthYear).format("YYYY-MM");
                const monthlySales = await dashboardService.monthlySales(user.userId, monthYear);
                setMonthlySalesData(monthlySales);
            })()
        }
    }, [currentMonthYear, user])

    const goToPreviousDate = () => {
        setCurrentMonthYear(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    }

    const goToNextDate = () => {
        setCurrentMonthYear(prevDate => {
            if (isCurrentMonth(prevDate)) return prevDate;

            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + 1);

            if (isFutureMonth(newDate)) {
                return prevDate;
            }

            return newDate;
        });
    }

    useEffect(() => {
        if (currentPage && user) {
            (async () => {
                const response = await dashboardService.transactions(user.userId, pageSize, offset);
                setTransactions(response.transactions);
                setTotalRecords(response.total);
            })()
        }
    }, [currentPage, user, pageSize, offset])

    const getNextLimitData = () => {
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }

    const getPrevLimitData = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage >= Math.ceil(totalRecords / pageSize);

    if (isLoading) return <PageLoader />

    return (
        <AppLayout>
            <div className="pb-8 pt-0 space-y-4">
                {isLoading ? (
                    <PageLoader />
                ) : (
                    <Fragment>
                        {expiredProductsCount > 0 && (
                            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-sm p-4 shadow-sm">
                                <div className="flex items-center">
                                    <div className="text-amber-700 dark:text-amber-300 font-medium">
                                        {expiredProductsCount} product(s) have expired.
                                    </div>
                                    <Link
                                        to={ROUTES.PRODUCTS}
                                        className="ml-4 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-medium text-sm transition-colors duration-200"
                                    >
                                        Go to Products Page →
                                    </Link>
                                </div>
                            </div>
                        )}

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

                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                {
                                    user && hasAnyPermission(user, ['settings.shop.manage', 'settings.tax.manage', 'settings.payment.manage']) ? <DataTable<TopProduct>
                                        title="Top Products"
                                        headers={topProductsHeaders}
                                        data={topProductsData}
                                        renderRow={p => <RenderTopProductRow product={p} />}
                                        icon={<RiMedicineBottleFill className="mr-2 text-blue-600 dark:text-blue-400" />}
                                    /> : <DataTable<Transaction>
                                        title="My Transactions"
                                        headers={topTransactionsHeaders}
                                        data={transactions}
                                        renderRow={(trans) => <RenderTransactionRow
                                            trans={trans}
                                            setIsOpenDetails={setIsOpenDetails}
                                            setTransaction={setTransaction}
                                        />}
                                        icon={<RiMedicineBottleFill className="mr-2 text-blue-600 dark:text-blue-400" />}
                                    >
                                        <div className='flex items-center justify-between bg-white dark:bg-gray-800/50 px-4 py-3 rounded-sm'>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Showing {startRecord}-{endRecord} of {totalRecords} records
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={getPrevLimitData}
                                                    disabled={isFirstPage}
                                                    className="p-2 rounded-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                    aria-label="Previous page"
                                                >
                                                    <HiChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
                                                </button>
                                                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm">
                                                    Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                                                </span>
                                                <button
                                                    onClick={getNextLimitData}
                                                    disabled={isLastPage}
                                                    className="p-2 rounded-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                    aria-label="Next page"
                                                >
                                                    <HiChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
                                                </button>
                                            </div>
                                        </div>
                                    </DataTable>
                                }
                            </div>

                            <div className="lg:col-span-3">
                                <div className="bg-white dark:bg-gray-800">
                                    <MonthlySalesChart data={monthlySalesData} chartHeader={
                                        <Fragment>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-sm">
                                                        <HiOutlineCurrencyDollar className="text-green-600 dark:text-green-400 w-5 h-5" />
                                                    </div>
                                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                        {dayjs(currentMonthYear).format("MMMM YYYY")} Sales
                                                    </h2>
                                                </div>
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <button
                                                        onClick={goToPreviousDate}
                                                        className="p-2 rounded-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                                        aria-label="Previous month"
                                                    >
                                                        <HiChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                                                    </button>

                                                    <button
                                                        onClick={goToNextDate}
                                                        disabled={isCurrentMonth(currentMonthYear)}
                                                        className="p-2 rounded-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600"
                                                        aria-label="Next month"
                                                    >
                                                        <HiChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Fragment>
                                    } />
                                </div>
                            </div>
                        </div>
                    </Fragment>
                )}
            </div>

            <TransactionDetailsModal
                transaction={transaction}
                isOpenDetails={isOpenDetails}
                setIsOpenDetails={setIsOpenDetails}
            />
        </AppLayout>
    );
};

export default Dashboard;