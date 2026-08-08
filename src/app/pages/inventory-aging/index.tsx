import { FunctionComponent, useContext, useMemo } from 'react';
import {
    Clock,
    AlertTriangle,
    PackageX,
    DollarSign,
    Package,
} from 'lucide-react';
import DataTable from 'react-data-table-component';
import { Box, Flex, SegmentedControl, Select } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import SummaryCards, { type SummaryCardItem } from '../../components/stats/SummaryCards';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import { useInventoryAging } from '../../hooks/useInventoryAging';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { formatCurrency } from '../../utils';
import { getAgingTableColumns } from './partials/AgingTableColumns';
import MobileInventoryAging from './MobileInventoryAging';

const THRESHOLD_OPTIONS = [30, 60, 90, 120, 180, 365];
const STATUS_FILTERS = [
    { value: 'all' as const, label: 'All' },
    { value: 'active' as const, label: 'Active' },
    { value: 'slow' as const, label: 'Slow' },
    { value: 'dead' as const, label: 'Dead' },
];

const InventoryAging: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();

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
        thresholdDays,
        handleThresholdChange,
        statusFilter,
        handleStatusFilterChange,
        valueAtRisk,
    } = useInventoryAging();

    if (isMobile) {
        return <MobileInventoryAging />;
    }

    const columns = getAgingTableColumns();

    const summaryCards: SummaryCardItem[] = useMemo(() => [
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
            title: 'Slow Movers',
            value: summary?.totalSlowMovers?.toLocaleString() ?? '—',
            subtitle: summary ? formatCurrency(summary.slowMoverValue, true) : '—',
            icon: <AlertTriangle className="w-5 h-5" />,
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-600 dark:text-amber-400',
        },
        {
            title: 'Never Sold',
            value: summary?.totalNeverSold?.toLocaleString() ?? '—',
            subtitle: summary ? formatCurrency(summary.neverSoldValue, true) : '—',
            icon: <PackageX className="w-5 h-5" />,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            iconBgColor: 'bg-red-100 dark:bg-red-900/40',
            textColor: 'text-red-600 dark:text-red-400',
        },
        {
            title: 'Value at Risk',
            value: formatCurrency(valueAtRisk, true),
            subtitle: 'Slow + never-sold stock',
            icon: <DollarSign className="w-5 h-5" />,
            bgColor: 'bg-rose-50 dark:bg-rose-900/20',
            iconBgColor: 'bg-rose-100 dark:bg-rose-900/40',
            textColor: 'text-rose-600 dark:text-rose-400',
        },
    ], [summary, valueAtRisk]);

    return (
        <>
            <PageHeader
                icon={<Clock className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="Inventory Aging"
                description="Slow-mover and dead stock analysis"
            />

            <Box className="rounded-lg my-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <SummaryCards cards={summaryCards} isLoading={isLoading} skeletonCount={4} variant="embedded" />

                <Flex
                    direction={{ initial: 'column', sm: 'row' }}
                    align={{ initial: 'start', sm: 'center' }}
                    justify="between"
                    gap={{ initial: '2', sm: '3' }}
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700"
                >
                    <SearchBar
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:flex-1 sm:max-w-xs"
                    />

                    <Flex align="center" gap="2" wrap="wrap">
                        <SegmentedControl.Root
                            size="2"
                            value={statusFilter}
                            onValueChange={(value) => handleStatusFilterChange(value as 'all' | 'active' | 'slow' | 'dead')}
                        >
                            {STATUS_FILTERS.map(({ value, label }) => (
                                <SegmentedControl.Item key={value} value={value}>
                                    {label}
                                </SegmentedControl.Item>
                            ))}
                        </SegmentedControl.Root>

                        <Select.Root
                            size="2"
                            value={String(thresholdDays)}
                            onValueChange={(value) => handleThresholdChange(Number(value))}
                        >
                            <Select.Trigger placeholder="Threshold" />
                            <Select.Content>
                                {THRESHOLD_OPTIONS.map((d) => (
                                    <Select.Item key={d} value={String(d)}>
                                        Threshold: {d}d
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
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
                    defaultSortFieldId={5}
                    defaultSortAsc={false}
                    noDataComponent={
                        <TableEmptyState
                            icon={<Clock />}
                            title="No aging data"
                            description={
                                searchTerm || statusFilter !== 'all'
                                    ? 'No items match your filters.'
                                    : 'Inventory aging data will appear here.'
                            }
                        />
                    }
                />
            </Box>
        </>
    );
};

export default InventoryAging;
