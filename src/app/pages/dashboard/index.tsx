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
import { hasPermission, isCurrentMonth, isFutureMonth } from '../../utils';
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
        { key: "total_sales", title: 'Total Sales', value: 0, icon: <HiOutlineBanknotes />, bgColor: 'bg-green-500' },
        { key: "stock", title: 'Stock', value: 0, icon: <HiOutlineBuildingStorefront />, bgColor: 'bg-sky-500' },
        { key: "all_customers", title: 'All Customers', value: 0, icon: <HiOutlineUserGroup />, bgColor: 'bg-yellow-500' },
        { key: "my_total_transactions", title: 'My Transaction', value: 0, icon: <HiOutlineShieldCheck />, bgColor: 'bg-teal-500' },
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
                const userId = user.uuid;
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
                const monthlySales = await dashboardService.monthlySales(user.uuid, monthYear);
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
                const response = await dashboardService.transactions(user.uuid, pageSize, offset);
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
            <div className='min-h-screen'>
                <div className="pb-8 pt-0 space-y-4 max-h-[50rem] overflow-y-auto">
                    {isLoading ? (
                        <PageLoader />
                    ) : (
                        <Fragment>
                            {expiredProductsCount > 0 && (
                                <div className="mb-4 bg-yellow-50 border border-yellow-200/40 rounded-sm p-3">
                                    <div className="flex items-center">
                                        <div className="text-yellow-600 font-medium">
                                            {expiredProductsCount} product(s) have expired.
                                        </div>
                                        <Link
                                            to={ROUTES.PRODUCTS}
                                            className="ml-4 text-sky-600 hover:text-sky-800 font-medium text-sm"
                                        >
                                            Go to Products Page →
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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

                            <div className="grid space-x-4 grid-cols-5">
                                <div className="col-span-2">
                                    {
                                        user && hasPermission(user, 'permTransactions') ? <DataTable<TopProduct>
                                            title="Top Products"
                                            headers={topProductsHeaders}
                                            data={topProductsData}
                                            renderRow={p => <RenderTopProductRow product={p} />}
                                            icon={<RiMedicineBottleFill className="mr-2 text-blue-600" />}
                                        /> : <DataTable<Transaction>
                                            title="My Transactions"
                                            headers={topTransactionsHeaders}
                                            data={transactions}
                                            renderRow={(trans) => <RenderTransactionRow
                                                trans={trans}
                                                setIsOpenDetails={setIsOpenDetails}
                                                setTransaction={setTransaction}
                                            />}
                                            icon={<RiMedicineBottleFill className="mr-2 text-blue-600" />}
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div className="text-sm text-gray-600">
                                                    Showing {startRecord}-{endRecord} of {totalRecords} records
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={getPrevLimitData}
                                                        disabled={isFirstPage}
                                                        className="p-1 rounded-full bg-gray-50 hover:bg-sky-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Previous page"
                                                    >
                                                        <HiChevronLeft size={20} className="text-gray-600" />
                                                    </button>
                                                    <span className="px-2 text-sm text-gray-600">
                                                        Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                                                    </span>
                                                    <button
                                                        onClick={getNextLimitData}
                                                        disabled={isLastPage}
                                                        className="p-1 rounded-full bg-gray-50 hover:bg-sky-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Next page"
                                                    >
                                                        <HiChevronRight size={20} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </DataTable>
                                    }
                                </div>

                                <div className="col-span-3">
                                    <div className="bg-white rounded-sm px-4 pb-7 shadow h-[39rem]">
                                        <MonthlySalesChart data={monthlySalesData} chartHeader={
                                            <Fragment>
                                                <div className="flex items-center gap-2 ">
                                                    <HiOutlineCurrencyDollar className="text-sky-600" />
                                                    <h2 className="text-md font-semibold">{dayjs(currentMonthYear).format("MMMM-YYYY")} Sales</h2>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={goToPreviousDate}
                                                        className="p-1 rounded-full bg-gray-50 hover:bg-sky-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Previous month"
                                                    >
                                                        <HiChevronLeft size={20} className="text-gray-600" />
                                                    </button>

                                                    <button
                                                        onClick={goToNextDate}
                                                        disabled={isCurrentMonth(currentMonthYear)}
                                                        className="p-1 rounded-full bg-gray-50 hover:bg-sky-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Next month"
                                                    >
                                                        <HiChevronRight size={20} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </Fragment>
                                        } />
                                    </div>
                                </div>
                            </div>
                        </Fragment>
                    )}
                </div>
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