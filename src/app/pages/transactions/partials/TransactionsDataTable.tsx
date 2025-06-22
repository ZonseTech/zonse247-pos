import dayjs from "dayjs";
import { Notify } from "notiflix";
import DatePicker from "react-datepicker";
import Loader from "../../../components/Loader";
import { formatCurrency } from "../../../utils";
import relativeTime from 'dayjs/plugin/relativeTime'
import IconButton from "../../../components/IconButton";
import { Input, ZonseThemeContext } from "../../../components";
import TransactionDetailsModal from "./TransactionDetailsModal";
import DataTable, { type TableColumn } from "react-data-table-component";
import { HiOutlineSearch, HiOutlineMenuAlt4, HiOutlineDownload, HiOutlineFilter } from "react-icons/hi";
import transactionService from "../../../services/transactions.service";
import { HiOutlineCalendarDateRange, HiOutlineEye, HiOutlineClock, HiOutlineCurrencyDollar } from "react-icons/hi2";
import { type ChangeEvent, type Dispatch, forwardRef, type FunctionComponent, type SetStateAction, useContext, useEffect, useState } from "react";

dayjs.extend(relativeTime);

type SummaryDataProps = {
    title: string;
    value: number | string;
    bgColor: string;
    onClick?: () => void;
}

interface Props {
    showProducts: boolean;
    setShowProducts: Dispatch<SetStateAction<boolean>>
    setSoldProducts?: Dispatch<SetStateAction<Array<CartItem>>>;
    setSummaryData: Dispatch<SetStateAction<Array<SummaryDataProps>>>;
}

const TransactionsDataTable: FunctionComponent<Props> = ({
    showProducts,
    setShowProducts,
    setSoldProducts,
    setSummaryData
}) => {
    const columns: TableColumn<Transaction>[] = [
        {
            name: "Invoice",
            selector: (row) => row.refNumber || row.transactionId || '-',
            cell: (row) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {row.refNumber || row.transactionId || '-'}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Date",
            selector: (row) => row.date ? dayjs(row.date).format('DD-MM-YYYY') : '-',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.date ? dayjs(row.date).format('DD-MM-YYYY') : '-'}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Total",
            selector: (row) => row.total || 0,
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(row.total || 0)}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Paid",
            selector: (row) => row.paid || 0,
            cell: (row) => (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {formatCurrency(row.paid || 0)}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Change",
            selector: (row) => row.changeAmount || 0,
            cell: (row) => (
                <span className="text-orange-600 dark:text-orange-400">
                    {formatCurrency(row.changeAmount || 0)}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Method",
            selector: (row) => row.paymentMethod?.name || '-',
            cell: (row) => (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {row.paymentMethod?.name || '-'}
                </span>
            ),
        },
        {
            name: "Till",
            selector: (row) => row.workstation?.tillName || '-',
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {row.workstation?.tillName || '-'}
                </span>
            ),
        },
        {
            name: "Cashier",
            selector: (row) => row.user?.fullname || row.user?.email || '-',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                            {(row.user?.fullname || row.user?.email || '-').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {row.user?.fullname || row.user?.email || '-'}
                    </span>
                </div>
            ),
        },
        {
            width: "70px",
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-1">
                    <button
                        onClick={() => handleOnClickTransactionDetails(row)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md transition-colors duration-200"
                        title="View Details"
                    >
                        <HiOutlineEye className='w-4 h-4' />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transaction, setTransaction] = useState<Transaction>({} as Transaction);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    const extractSoldProducts = (transactions: Transaction[]) => {
        if (!setSoldProducts) return;

        const productMap = new Map();

        transactions.forEach(transaction => {
            if (transaction?.items && Array.isArray(transaction.items)) {
                transaction.items.forEach(item => {
                    if (item && item.productUuid) {
                        const { categoryDetails, quantity, productUuid, barcode, sellPrice, purchasePrice, name } = item;

                        const product = {
                            barcode: barcode || '',
                            sellPrice: Number(sellPrice) || 0,
                            purchasePrice: Number(purchasePrice) || 0,
                            name: name || '',
                            category: categoryDetails?.name || '',
                            quantity: Number(quantity) || 0,
                        };

                        if (productMap.has(productUuid)) {
                            const existingProduct = productMap.get(productUuid);
                            existingProduct.quantity += product.quantity;
                            productMap.set(productUuid, existingProduct);
                        } else {
                            productMap.set(productUuid, product);
                        }
                    }
                });
            }
        });

        setSoldProducts(Array.from(productMap.values()));
    };

    const calculateSummaryStats = (data: Transaction[]) => {
        const totalTransactions = data.length;
        const totalSales = data.reduce((sum, transaction) => {
            const total = Number(transaction.total) || 0;
            return sum + total;
        }, 0);

        const totalItemsSold = data.reduce((sum, transaction) => {
            if (!transaction?.items || !Array.isArray(transaction.items)) return sum;
            const itemCount = transaction.items.reduce((count, item) => {
                return count + (Number(item?.quantity) || 0);
            }, 0);
            return sum + itemCount;
        }, 0);

        const uniqueProductIds = new Set<string | number>();
        data.forEach(transaction => {
            if (transaction?.items && Array.isArray(transaction.items)) {
                transaction.items.forEach(item => {
                    if (item?.productUuid) {
                        uniqueProductIds.add(item.productUuid);
                    }
                });
            }
        });
        const totalProducts = uniqueProductIds.size;

        return {
            totalSales,
            totalTransactions,
            totalItemsSold,
            totalProducts
        };
    };

    const loadTransactions = async () => {
        try {
            setIsLoading(true);

            const data = await transactionService.list({
                includeItems: true,
            });

            const transactionData = Array.isArray(data) ? data : [];
            setTransactions(transactionData);

            applyFilters(transactionData);

        } catch (error) {
            console.error("Error loading transactions:", error);
            Notify.failure("Error loading transactions: " + (error instanceof Error ? error.message : String(error)));
            setTransactions([]);
            setFilteredTransactions([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = (data: Transaction[]) => {
        let filtered = [...data];

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                (tx.refNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.paymentMethod?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.workstation.tillName?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (startDate) {
            filtered = filtered.filter(tx => {
                if (!tx.date) return false;
                const txDate = dayjs(tx.date);
                const start = dayjs(startDate).startOf('day');
                const end = endDate ? dayjs(endDate).endOf('day') : dayjs(startDate).endOf('day');
                return txDate.isAfter(start) && txDate.isBefore(end);
            });
        }

        setFilteredTransactions(filtered);
        setTotalRows(filtered.length);

        extractSoldProducts(filtered);

        const stats = calculateSummaryStats(filtered);

        setSummaryData([
            {
                title: 'Total Sales',
                value: formatCurrency(stats.totalSales),
                bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
            },
            {
                title: 'Transactions',
                value: stats.totalTransactions.toLocaleString(),
                bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
            },
            {
                title: 'Items Sold',
                value: stats.totalItemsSold.toLocaleString(),
                bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500'
            },
            {
                title: 'Products',
                value: stats.totalProducts.toLocaleString(),
                bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
                onClick: () => setShowProducts(!showProducts)
            },
        ]);
    };

    const handleOnClickTransactionDetails = (trans: Transaction) => {
        setTransaction(trans);
        setIsOpenDetails(true);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredTransactions.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStartDate(null);
        setEndDate(null);
        setPage(1);
    };

    const exportData = () => {
        Notify.info("Export functionality to be implemented");
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length >= 0) {
            applyFilters(transactions);
        }
    }, [searchTerm, startDate, endDate, transactions, showProducts]);

    const DateFilterInput = forwardRef<HTMLButtonElement, any>(
        ({ value, onClick, className }, ref) => (
            <button
                className={`${className} flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200`}
                onClick={onClick}
                ref={ref}
            >
                <HiOutlineCalendarDateRange className="w-4 h-4" />
                <span>{value ? `${value}${endDate ? ` - ${dayjs(endDate).format('DD/MM/YYYY')}` : ''}` : 'Select Date Range'}</span>
            </button>
        ),
    );

    const customTableStyles = {
        header: {
            style: {
                backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                borderBottom: mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '14px',
                color: mode === 'dark' ? '#f3f4f6' : '#374151',
            },
        },
        headRow: {
            style: {
                backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
            },
        },
        headCells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                fontWeight: '600',
                fontSize: '13px',
                color: mode === 'dark' ? '#d1d5db' : '#6b7280',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
            },
        },
        rows: {
            style: {
                backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
                borderBottom: mode === 'dark' ? '1px solid #374151' : '1px solid #f3f4f6',
                '&:hover': {
                    backgroundColor: mode === 'dark' ? '#374151' : '#f8fafc',
                },
                minHeight: '60px',
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        pagination: {
            style: {
                backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                borderTop: mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <HiOutlineMenuAlt4 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Transaction History
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage and view all transactions
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            <HiOutlineDownload className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <DatePicker
                            selected={startDate}
                            onChange={(dates) => {
                                const [start, end] = dates as [Date | null, Date | null];
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            dateFormat='dd/MM/yyyy'
                            withPortal
                            customInput={<DateFilterInput />}
                            isClearable
                            placeholderText="Select date range"
                        />

                        {(searchTerm || startDate) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            >
                                <HiOutlineFilter className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Input
                            type="text"
                            placeholder="Search transactions, cashiers, methods..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2.5 w-full rounded-lg border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden">
                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    customStyles={customTableStyles}
                    progressPending={isLoading}
                    progressComponent={<Loader isLoading={isLoading} />}
                    highlightOnHover
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={perPage}
                    paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    fixedHeader
                    noDataComponent={
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <HiOutlineMenuAlt4 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No transactions found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                {searchTerm || startDate
                                    ? "Try adjusting your search or date filters to find transactions."
                                    : "Transactions will appear here once they are created."
                                }
                            </p>
                            {(searchTerm || startDate) && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    }
                />
            </div>

            <TransactionDetailsModal
                transaction={transaction}
                isOpenDetails={isOpenDetails}
                setIsOpenDetails={setIsOpenDetails}
            />
        </div>
    );
};

export default TransactionsDataTable;