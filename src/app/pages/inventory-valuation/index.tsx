import { FunctionComponent, useCallback, useContext, useMemo, useState } from 'react';
import {
    DollarSign,
    Package,
    Layers,
    TrendingUp,
    BarChart3,
    FileSpreadsheet,
} from 'lucide-react';
import DataTable from 'react-data-table-component';
import { Button, Box, Flex, SegmentedControl } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import SummaryCards from '../../components/stats/SummaryCards';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import MobileDateFilter from '../../components/reports/MobileDateFilter';
import { useInventoryValuation } from '../../hooks/useInventoryValuation';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { formatCurrency } from '../../utils';
import { getValuationTableColumns } from './partials/ValuationTableColumns';
import ValuationDrillDownModal from './partials/ValuationDrillDownModal';
import OpeningBalanceModal from './partials/OpeningBalanceModal';
import MobileInventoryValuation from './MobileInventoryValuation';

const COSTING_METHODS: { value: CostingMethodType; short: string }[] = [
    { value: 'WEIGHTED_AVERAGE', short: 'WAC' },
    { value: 'FIFO', short: 'FIFO' },
    { value: 'LIFO', short: 'LIFO' },
];

const InventoryValuation: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const [showOpeningBalance, setShowOpeningBalance] = useState(false);

    const {
        items,
        summary,
        isLoading,
        perPage,
        totalRows,
        searchTerm,
        handleSearch,
        handlePageChange,
        handlePerRowsChange,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        displayMethod,
        setDisplayMethod,
        selectedItem,
        itemValuation,
        costLayers,
        isLoadingDetail,
        openDrillDown,
        closeDrillDown,
        changeCostingMethod,
        recordOpeningBalance,
    } = useInventoryValuation();

    const columns = useMemo(
        () => getValuationTableColumns({ openDrillDown }),
        [openDrillDown]
    );

    const summaryCards = useMemo(() => [
        {
            title: 'Total Value',
            value: formatCurrency(summary?.totalValue ?? 0, true),
            subtitle: 'Stock value',
            icon: <DollarSign className="w-5 h-5" />,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Total Items',
            value: summary?.totalItems?.toLocaleString() ?? '—',
            subtitle: 'Tracked products',
            icon: <Package className="w-5 h-5" />,
            bgColor: 'bg-sky-50 dark:bg-sky-900/20',
            iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
            textColor: 'text-sky-600 dark:text-sky-400',
        },
        {
            title: 'Total Quantity',
            value: summary?.totalQuantity?.toLocaleString() ?? '—',
            subtitle: 'Units in stock',
            icon: <Layers className="w-5 h-5" />,
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
            textColor: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            title: 'Avg Value / Item',
            value: summary && summary.totalItems > 0
                ? formatCurrency((summary.totalValue ?? 0) / summary.totalItems, true)
                : '—',
            subtitle: 'Per product average',
            icon: <TrendingUp className="w-5 h-5" />,
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-600 dark:text-amber-400',
        },
    ], [summary]);

    const handleOpenBalance = useCallback(() => setShowOpeningBalance(true), []);
    const handleCloseBalance = useCallback(() => setShowOpeningBalance(false), []);

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        setStartDate(start ? start.toISOString().split('T')[0] : '');
        setEndDate(end ? end.toISOString().split('T')[0] : '');
    }, [setStartDate, setEndDate]);

    if (isMobile) {
        return <MobileInventoryValuation />;
    }

    return (
        <AppLayout>
            <PageHeader
                icon={<BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="Inventory Valuation"
                description="Stock valuation summary across costing methods"
            />

            <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <SummaryCards
                    cards={summaryCards}
                    isLoading={isLoading}
                    skeletonCount={4}
                    variant="embedded"
                />

                <Flex
                    direction={{ initial: 'column', sm: 'row' }}
                    align={{ initial: 'start', sm: 'center' }}
                    justify="between"
                    gap={{ initial: '2', sm: '3' }}
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700"
                >
                    <Flex align="center" gap="2" wrap="wrap">
                        <MobileDateFilter
                            startDate={startDate ? new Date(startDate) : null}
                            endDate={endDate ? new Date(endDate) : null}
                            onChange={handleDateChange}
                        />
                    </Flex>

                    <SearchBar
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:flex-1 sm:max-w-xs"
                    />
                </Flex>

                <Flex
                    direction={{ initial: 'column', sm: 'row' }}
                    align={{ initial: 'start', sm: 'center' }}
                    justify="between"
                    gap={{ initial: '2', sm: '3' }}
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700"
                >
                    <Flex align="center" gap="2" wrap="wrap">
                        <SegmentedControl.Root
                            size="2"
                            value={displayMethod}
                            onValueChange={(value) => setDisplayMethod(value as CostingMethodType)}

                        >
                            {COSTING_METHODS.map(({ value, short }) => (
                                <SegmentedControl.Item key={value} value={value}>
                                    {short}
                                </SegmentedControl.Item>
                            ))}
                        </SegmentedControl.Root>

                        <Button size="2" onClick={handleOpenBalance}>
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Opening Balance
                        </Button>
                    </Flex>
                </Flex>

                <DataTable
                    columns={columns}
                    data={items}
                    theme={mode as string}
                    progressPending={isLoading}
                    progressComponent={<TableSkeleton rows={perPage} columns={6} />}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={perPage}
                    paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    customStyles={getTableStyles(mode)}
                    highlightOnHover
                    responsive
                    persistTableHead
                    onRowClicked={openDrillDown}
                    pointerOnHover
                    noDataComponent={
                        <TableEmptyState
                            icon={<BarChart3 />}
                            title="No valuation data"
                            description={
                                searchTerm
                                    ? 'No items match your search.'
                                    : 'Inventory valuation data will appear here.'
                            }
                        />
                    }
                />
            </Box>

            {!!selectedItem && (
                <ValuationDrillDownModal
                    isOpen
                    onClose={closeDrillDown}
                    item={selectedItem}
                    valuation={itemValuation}
                    costLayers={costLayers}
                    isLoading={isLoadingDetail}
                    onChangeCostingMethod={changeCostingMethod}
                />
            )}

            <OpeningBalanceModal
                isOpen={showOpeningBalance}
                onClose={handleCloseBalance}
                onSubmit={recordOpeningBalance}
            />
        </AppLayout>
    );
};

export default InventoryValuation;
