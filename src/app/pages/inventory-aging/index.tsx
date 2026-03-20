import { FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import {
    Clock,
    AlertTriangle,
    PackageX,
    DollarSign,
    Package,
    RefreshCw,
    Search,
} from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader, Button } from '../../components';
import { useInventoryAging } from '../../hooks/useInventoryAging';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { formatCurrency } from '../../utils';
import AgingBucketChart from './partials/AgingBucketChart';
import { getAgingTableColumns } from './partials/AgingTableColumns';
import MobileInventoryAging from './MobileInventoryAging';

const THRESHOLD_OPTIONS = [30, 60, 90, 120, 180, 365];
const CHART_METRICS = [
    { value: 'totalValue' as const, label: 'Value' },
    { value: 'itemCount' as const, label: 'Items' },
    { value: 'totalQuantity' as const, label: 'Qty' },
];
const STATUS_FILTERS = [
    { value: 'all' as const, label: 'All' },
    { value: 'active' as const, label: 'Active' },
    { value: 'slow' as const, label: 'Slow' },
    { value: 'dead' as const, label: 'Dead' },
];

const InventoryAging: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const [searchTerm, setSearchTerm] = useState('');
    const [chartMetric, setChartMetric] = useState<'totalValue' | 'itemCount' | 'totalQuantity'>('totalValue');

    const {
        agingData,
        isLoading,
        thresholdDays,
        setThresholdDays,
        statusFilter,
        setStatusFilter,
        loadAgingReport,
        getBucketChartData,
        getFilteredItems,
        valueAtRisk,
    } = useInventoryAging();

    useEffect(() => {
        loadAgingReport();
    }, [loadAgingReport]);

    if (isMobile) {
        return <MobileInventoryAging />;
    }

    const handleThresholdChange = (days: number) => {
        setThresholdDays(days);
        loadAgingReport(days);
    };

    const filteredItems = useMemo(() => {
        const items = getFilteredItems();
        if (!searchTerm.trim()) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(
            (item) =>
                item.productName.toLowerCase().includes(term) ||
                item.sku?.toLowerCase().includes(term)
        );
    }, [getFilteredItems, searchTerm]);

    const bucketChartData = getBucketChartData();
    const columns = getAgingTableColumns();
    const isDark = mode === 'dark';

    return (
        <AppLayout>
            <PageHeader
                icon={<Clock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 dark:text-amber-400" />}
                title="Inventory Aging"
                description="Slow-mover and dead stock analysis"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    title="Total Items"
                    value={agingData?.totalItems?.toLocaleString() ?? '—'}
                    subtitle="Tracked products"
                    icon={<Package className="w-5 h-5" />}
                    bgColor="bg-sky-50 dark:bg-sky-900/20"
                    iconBgColor="bg-sky-100 dark:bg-sky-900/40"
                    textColor="text-sky-600 dark:text-sky-400"
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Slow Movers"
                    value={agingData?.totalSlowMovers?.toLocaleString() ?? '—'}
                    subtitle={agingData ? formatCurrency(agingData.slowMoverValue, true) : '—'}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                    iconBgColor="bg-amber-100 dark:bg-amber-900/40"
                    textColor="text-amber-600 dark:text-amber-400"
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Never Sold"
                    value={agingData?.totalNeverSold?.toLocaleString() ?? '—'}
                    subtitle={agingData ? formatCurrency(agingData.neverSoldValue, true) : '—'}
                    icon={<PackageX className="w-5 h-5" />}
                    bgColor="bg-red-50 dark:bg-red-900/20"
                    iconBgColor="bg-red-100 dark:bg-red-900/40"
                    textColor="text-red-600 dark:text-red-400"
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Value at Risk"
                    value={formatCurrency(valueAtRisk, true)}
                    subtitle="Slow + never-sold stock"
                    icon={<DollarSign className="w-5 h-5" />}
                    bgColor="bg-rose-50 dark:bg-rose-900/20"
                    iconBgColor="bg-rose-100 dark:bg-rose-900/40"
                    textColor="text-rose-600 dark:text-rose-400"
                    isLoading={isLoading}
                />
            </div>

            {/* Chart Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                <div className="px-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Aging Distribution
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Stock grouped by days since last sale
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Metric Toggle */}
                        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {CHART_METRICS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setChartMetric(value)}
                                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${chartMetric === value
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <ComponentLoader loading={true} />
                        </div>
                    ) : (
                        <AgingBucketChart data={bucketChartData} metric={chartMetric} isDark={isDark} />
                    )}
                </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Toolbar */}
                <div className="px-4 pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            {/* Status Filter */}
                            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {STATUS_FILTERS.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setStatusFilter(value)}
                                        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === value
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Threshold Selector */}
                            <select
                                value={thresholdDays}
                                onChange={(e) => handleThresholdChange(Number(e.target.value))}
                                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            >
                                {THRESHOLD_OPTIONS.map((d) => (
                                    <option key={d} value={d}>
                                        Threshold: {d}d
                                    </option>
                                ))}
                            </select>

                            {/* Refresh */}
                            <Button
                                theme="neutral"
                                layout="outline"
                                size="small"
                                onClick={() => loadAgingReport()}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden mt-2">
                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        theme={mode as string}
                        progressPending={isLoading}
                        progressComponent={<ComponentLoader loading={isLoading} />}
                        pagination
                        paginationPerPage={15}
                        paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                        customStyles={getTableStyles(mode)}
                        highlightOnHover
                        responsive
                        persistTableHead
                        fixedHeader
                        defaultSortFieldId={5}
                        defaultSortAsc={false}
                        noDataComponent={
                            <div className="text-center py-12">
                                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No aging data
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'No items match your filters.'
                                        : 'Inventory aging data will appear here.'}
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>
        </AppLayout>
    );
};

// ─── Summary Card Component ────────────────────────────────────────────────

interface SummaryCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    isLoading?: boolean;
}

const SummaryCard: FunctionComponent<SummaryCardProps> = ({
    title, value, subtitle, icon, bgColor, iconBgColor, textColor, isLoading,
}) => (
    <div className={`${bgColor} rounded-lg p-4 border border-transparent`}>
        <div className="flex items-center gap-3">
            <div className={`${iconBgColor} ${textColor} p-2.5 rounded-lg`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                {isLoading ? (
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mt-1" />
                ) : (
                    <>
                        <p className={`text-lg font-bold ${textColor}`}>{value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{subtitle}</p>
                    </>
                )}
            </div>
        </div>
    </div>
);

export default InventoryAging;
