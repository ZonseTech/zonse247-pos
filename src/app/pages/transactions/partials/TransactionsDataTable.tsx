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
import { HiOutlineSearch, HiOutlineMenuAlt4 } from "react-icons/hi";
import transactionService from "../../../services/transactions.service";
import { HiOutlineCalendarDateRange, HiOutlineEye } from "react-icons/hi2";
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

const TransactionsDataTable: FunctionComponent<Props> = ({ showProducts, setShowProducts, setSoldProducts, setSummaryData }) => {
    const columns: TableColumn<Transaction>[] = [
        {
            width: "15%",
            name: "Invoice",
            selector: (row) => row.refNumber || row.transactionId || '-',
        },
        {
            name: "Date",
            selector: (row) => dayjs(row.date).format('DD-MM-YYYY'),
        },
        {
            name: "Total",
            selector: (row) => formatCurrency(row.total),
        },
        {
            name: "Paid",
            selector: (row) => formatCurrency(row.paid),
        },
        {
            name: "Change",
            selector: (row) => formatCurrency(row.changeAmount),
        },
        {
            name: "Method",
            selector: (row) => row.paymentMethod?.name || '-',
        },
        {
            name: "Till",
            selector: (row) => row.till || '-',
        },
        {
            name: "Cashier",
            selector: (row) => {
                return row.user?.fullname || row.userId || '-'
            },
        },
        {
            width: "5%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => {

                return <IconButton
                    color=''
                    icon={
                        <HiOutlineEye
                            className='w-5 h-5 text-green-400'
                            onClick={() => handleOnClickTransactionDetails(row)}
                        />
                    }
                />
            },
        },
    ];

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false)
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transaction, setTransaction] = useState<Transaction>({} as Transaction);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    const extractSoldProducts = (transactions: Transaction[]) => {
        if (!setSoldProducts) return;

        const productMap = new Map();

        transactions.forEach(transaction => {
            transaction?.items?.forEach(item => {
                if (item) {
                    const { categoryDetails, quantity, productId, barcode, sellPrice, purchasePrice, name } = item;

                    const product = {
                        barcode: barcode || '',
                        sellPrice: sellPrice || 0,
                        purchasePrice: purchasePrice || 0,
                        name: name || '',
                        category: categoryDetails?.name || '',
                        quantity,
                    };

                    productMap.set(productId, product);
                }
            });
        });

        setSoldProducts(Array.from(productMap.values()));
    };

    const calculateSummaryStats = (data: Transaction[]) => {
        const totalTransactions = data.length;
        const totalSales = data.reduce((sum, transaction) => sum + parseFloat((transaction.total || '')?.toString()), 0);
        const totalItemsSold = data.reduce((sum, transaction) => {
            const itemCount = transaction?.items?.reduce((count, item) => count + (item.quantity || 0), 0);
            return sum + Number(itemCount);
        }, 0);

        const uniqueProductIds = new Set<string | number>();
        data.forEach(transaction => {
            transaction?.items?.forEach(item => {
                if (item.productId) {
                    uniqueProductIds.add(item.productId);
                }
            });
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
            setTransactions(data);

            const filtered = searchTerm
                ? data.filter(tx =>
                    (tx.refNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.paymentMethod?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.till?.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                : data;

            setFilteredTransactions(filtered);
            setTotalRows(filtered.length);

            extractSoldProducts(filtered);

            const stats = calculateSummaryStats(filtered);

            setSummaryData([
                { title: 'Sales', value: formatCurrency(stats.totalSales) as string, bgColor: 'bg-green-500' },
                { title: 'Transactions', value: stats.totalTransactions, bgColor: 'bg-green-400' },
                { title: 'Items Sold', value: stats.totalItemsSold, bgColor: 'bg-yellow-400' },
                {
                    title: 'Products',
                    value: stats.totalProducts,
                    bgColor: 'bg-green-400',
                    onClick: () => setShowProducts(!showProducts)
                },
            ]);

        } catch (error) {
            Notify.failure("Error loading transactions: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnClickTransactionDetails = (trans: Transaction) => {
        setTransaction(trans)
        setIsOpenDetails(!isOpenDetails)
    }

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

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            const filtered = searchTerm
                ? transactions.filter(tx =>
                    (tx.refNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.paymentMethod?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (tx.till?.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                : transactions;

            setFilteredTransactions(filtered);
            setTotalRows(filtered.length);

            extractSoldProducts(filtered);

            const stats = calculateSummaryStats(filtered);

            setSummaryData([
                { title: 'Sales', value: formatCurrency(stats.totalSales), bgColor: 'bg-green-500' },
                { title: 'Transactions', value: stats.totalTransactions, bgColor: 'bg-green-400' },
                { title: 'Items Sold', value: stats.totalItemsSold, bgColor: 'bg-yellow-400' },
                {
                    title: 'Products',
                    value: stats.totalProducts,
                    bgColor: 'bg-green-400',
                    onClick: () => setShowProducts(!showProducts)
                },
            ]);
        }
    }, [searchTerm, transactions]);

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const DateFilterInput = forwardRef(
        ({ value, onClick, className }: any, ref: any) => (
            <button className={className} onClick={onClick} ref={ref}>
                <HiOutlineCalendarDateRange className="w-4 h-4" /> <span>Filter Date: {value}</span>
            </button>
        ),
    );

    return (
        <div className="bg-white dark:bg-gray-700 rounded-md p-4 mt-4">
            <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex gap-2">
                    <DatePicker
                        selected={startDate}
                        onChange={(date: any) => setStartDate(date)}
                        dateFormat={'dd/MM/yyyy'}
                        withPortal
                        customInput={<DateFilterInput className="flex flex-row justify-center items-center gap-x-2.5" />}
                        selectsMultiple={false as any}
                    />
                </div>
                <div>
                    <h2 className="text-xl uppercase font-medium text-gray-700 flex-1">
                        Transactions
                    </h2>
                </div>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="rounded-md px-3 py-2.5 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="uppercase">
                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    theme={mode as string}
                    // progressComponent={<Loader isLoading={isLoading} />}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
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