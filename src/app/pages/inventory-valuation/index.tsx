import { FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import {
    DollarSign,
    Package,
    Layers,
    RefreshCw,
    Search,
    Eye,
    TrendingUp,
    BarChart3,
    FileSpreadsheet,
} from 'lucide-react';
import DataTable, { TableColumn } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader, Button } from '../../components';
import { useInventoryValuation } from '../../hooks/useInventoryValuation';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { formatCurrency } from '../../utils';
import ValuationDrillDownModal from './partials/ValuationDrillDownModal';
import OpeningBalanceModal from './partials/OpeningBalanceModal';
import MobileInventoryValuation from './MobileInventoryValuation';

const COSTING_METHODS: { value: CostingMethodType; label: string; short: string }[] = [
    { value: 'WEIGHTED_AVERAGE', label: 'Weighted Average', short: 'WAC' },
    { value: 'FIFO', label: 'First In, First Out', short: 'FIFO' },
    { value: 'LIFO', label: 'Last In, First Out', short: 'LIFO' },
];

const InventoryValuation: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const [searchTerm, setSearchTerm] = useState('');
    const [showOpeningBalance, setShowOpeningBalance] = useState(false);

    const {
        summary,
        isLoading,
        loadSummary,
        displayMethod,
        setDisplayMethod,
        getDisplayTotal,
        getItemDisplayValue,
        selectedItem,
        itemValuation,
        costLayers,
        isLoadingDetail,
        openDrillDown,
        closeDrillDown,
        changeCostingMethod,
        recordOpeningBalance,
    } = useInventoryValuation();

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    if (isMobile) {
        return <MobileInventoryValuation />;
    }

    const filteredItems = useMemo(() => {
        if (!summary?.items) return [];
        if (!searchTerm.trim()) return summary.items;
        const term = searchTerm.toLowerCase();
        return summary.items.filter(
            (item) =>
                item.productName.toLowerCase().includes(term) ||
                item.sku?.toLowerCase().includes(term) ||
                item.inventoryId.toLowerCase().includes(term)
        );
    }, [summary?.items, searchTerm]);

    const columns: TableColumn<InventoryValuationItem>[] = [
        {
            name: 'Product',
            sortable: true,
            minWidth: '220px',
            selector: (row) => row.productName,
            cell: (row) => (
                <div className="py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {row.productName}
                    </p>
                    {row.sku && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {row.sku}
                        </p>
                    )}
                </div>
            ),
        },
        {
            name: 'Qty',
            sortable: true,
            width: '90px',
            right: true,
            selector: (row) => row.availableQuantity,
            cell: (row) => (
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {row.availableQuantity.toLocaleString()}
                </span>
            ),
        },
        {
            name: 'Avg Cost',
            sortable: true,
            width: '120px',
            right: true,
            selector: (row) => row.averageCost,
            cell: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(row.averageCost, true)}
                </span>
            ),
        },
        {
            name: 'Value',
            sortable: true,
            width: '140px',
            right: true,
            selector: (row) => getItemDisplayValue(row),
            cell: (row) => (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(getItemDisplayValue(row), true)}
                </span>
            ),
        },
        {
            name: 'Method',
            width: '100px',
            center: true,
            cell: (row) => {
                const label = row.costingMethod === 'WEIGHTED_AVERAGE' ? 'WAC'
                    : row.costingMethod === 'FIFO' ? 'FIFO' : 'LIFO';
                return (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        {label}
                    </span>
                );
            },
        },
        {
            name: '',
            width: '60px',
            center: true,
            cell: (row) => (
                <button
                    onClick={() => openDrillDown(row)}
                    className="p-1.5 text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            ),
        },
    ];

    const activeLabel = COSTING_METHODS.find(m => m.value === displayMethod)?.short ?? 'WAC';

    return (
        <AppLayout>
            <PageHeader
                icon={<BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400" />}
                title="Inventory Valuation"
                description="Stock valuation summary across costing methods"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    title="Total Value"
                    value={formatCurrency(getDisplayTotal(), true)}
                    subtitle={`${activeLabel} method`}
                    icon={<DollarSign className="w-5 h-5" />}
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                    iconBgColor="bg-emerald-100 dark:bg-emerald-900/40"
                    textColor="text-emerald-600 dark:text-emerald-400"
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Total Items"
                    value={summary?.totalItems?.toLocaleString() ?? '—'}
                    subtitle="Tracked products"
                    icon={<Package className="w-5 h-5" />}
                    bgColor="bg-sky-50 dark:bg-sky-900/20"
                    iconBgColor="bg-sky-100 dark:bg-sky-900/40"
                    textColor="text-sky-600 dark:text-sky-400"
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Total Quantity"
                    value={summary?.totalQuantity?.toLocaleString() ?? '—'}
                    subtitle="Units in stock"
                    icon={<Layers className="w-5 h-5" />}
                    bgColor="bg-indigo-50 dark:bg-indigo-900/20"
                    iconBgColor="bg-indigo-100 dark:bg-indigo-900/40"
                    textColor="text-indigo-600 dark:text-indigo-400"
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Avg Value / Item"
                    value={summary && summary.totalItems > 0
                        ? formatCurrency(getDisplayTotal() / summary.totalItems, true)
                        : '—'}
                    subtitle="Per product average"
                    icon={<TrendingUp className="w-5 h-5" />}
                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                    iconBgColor="bg-amber-100 dark:bg-amber-900/40"
                    textColor="text-amber-600 dark:text-amber-400"
                    isLoading={isLoading}
                />
            </div>

            {/* Main Table Card */}
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
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Costing Method Toggle */}
                            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {COSTING_METHODS.map(({ value, short }) => (
                                    <button
                                        key={value}
                                        onClick={() => setDisplayMethod(value)}
                                        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${displayMethod === value
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {short}
                                    </button>
                                ))}
                            </div>

                            {/* Opening Balance */}
                            <Button
                                theme="primary"
                                size="small"
                                onClick={() => setShowOpeningBalance(true)}
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                                Opening Balance
                            </Button>

                            {/* Refresh */}
                            <Button
                                theme="neutral"
                                layout="outline"
                                size="small"
                                onClick={loadSummary}
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
                        onRowClicked={(row) => openDrillDown(row)}
                        pointerOnHover
                        noDataComponent={
                            <div className="text-center py-12">
                                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No valuation data
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm
                                        ? 'No items match your search.'
                                        : 'Inventory valuation data will appear here.'}
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Drill-Down Modal */}
            <ValuationDrillDownModal
                isOpen={!!selectedItem}
                onClose={closeDrillDown}
                item={selectedItem}
                valuation={itemValuation}
                costLayers={costLayers}
                isLoading={isLoadingDetail}
                onChangeCostingMethod={changeCostingMethod}
            />

            <OpeningBalanceModal
                isOpen={showOpeningBalance}
                onClose={() => setShowOpeningBalance(false)}
                onSubmit={recordOpeningBalance}
            />
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

export default InventoryValuation;
