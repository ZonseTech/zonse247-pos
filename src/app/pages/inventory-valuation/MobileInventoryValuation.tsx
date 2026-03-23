import { FC, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
    ArrowLeft,
    BarChart3,
    DollarSign,
    Package,
    Layers,
    Search,
    X,
    RefreshCw,
    Eye,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { IconButton, Button, Badge, Flex, SegmentedControl, Spinner } from '@radix-ui/themes';
import { useInventoryValuation } from '../../hooks/useInventoryValuation';
import { formatCurrency } from '../../utils';
import ValuationDrillDownModal from './partials/ValuationDrillDownModal';
import OpeningBalanceModal from './partials/OpeningBalanceModal';

const COSTING_METHODS: { value: CostingMethodType; short: string }[] = [
    { value: 'WEIGHTED_AVERAGE', short: 'WAC' },
    { value: 'FIFO', short: 'FIFO' },
    { value: 'LIFO', short: 'LIFO' },
];

const MobileInventoryValuation: FC = () => {
    const navigate = useNavigate();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showOpeningBalance, setShowOpeningBalance] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        items,
        summary,
        isLoading,
        loadSummary,
        // Pagination & search
        searchTerm,
        handleSearch,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        pageLabel,
        // Display
        displayMethod,
        setDisplayMethod,
        // Drill-down
        selectedItem,
        itemValuation,
        costLayers,
        isLoadingDetail,
        openDrillDown,
        closeDrillDown,
        // Actions
        changeCostingMethod,
        recordOpeningBalance,
    } = useInventoryValuation();

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadSummary();
        setTimeout(() => setIsRefreshing(false), 500);
    }, [loadSummary]);

    const handleSearchToggle = useCallback(() => {
        setIsSearchVisible((prev) => {
            if (!prev) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
            } else {
                handleSearch('');
            }
            return !prev;
        });
    }, [handleSearch]);

    const handleOpenBalance = useCallback(() => setShowOpeningBalance(true), []);
    const handleCloseBalance = useCallback(() => setShowOpeningBalance(false), []);

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top-android">
                {isSearchVisible ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search products, SKU..."
                            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                        />
                        <button
                            onClick={handleSearchToggle}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-emerald-500" />
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Valuation
                                </h1>
                            </div>
                        </div>
                        <Flex align="center" gap="1">
                            <IconButton
                                size="2"
                                variant="ghost"
                                color="gray"
                                onClick={handleSearchToggle}
                            >
                                <Search className="w-5 h-5" />
                            </IconButton>
                            <IconButton
                                size="2"
                                variant="ghost"
                                color="gray"
                                onClick={handleRefresh}
                                disabled={isLoading || isRefreshing}
                                className={(isLoading || isRefreshing) ? 'animate-spin' : ''}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </IconButton>
                        </Flex>
                    </div>
                )}
            </div>

            {/* Summary Strip */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                {isLoading ? '...' : formatCurrency(summary?.totalValue ?? 0, true)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                            <Package className="w-4 h-4 text-sky-500" />
                            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                                {summary?.totalItems ?? '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                {summary?.totalQuantity?.toLocaleString() ?? '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Costing Method Toggle */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <Flex align="center" gap="2" justify="between">
                    <SegmentedControl.Root
                        size="1"
                        value={displayMethod}
                        onValueChange={(value) => setDisplayMethod(value as CostingMethodType)}
                    >
                        {COSTING_METHODS.map(({ value, short }) => (
                            <SegmentedControl.Item key={value} value={value}>
                                {short}
                            </SegmentedControl.Item>
                        ))}
                    </SegmentedControl.Root>

                    <Button
                        size="1"
                        variant="soft"
                        color="green"
                        onClick={handleOpenBalance}
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Balance
                    </Button>
                </Flex>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading && items.length === 0 ? (
                    <Flex align="center" justify="center" direction="column" py="9" gap="3">
                        <Spinner size="3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading valuation...</p>
                    </Flex>
                ) : !isLoading && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                            <BarChart3 className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                            No valuation data
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs text-sm">
                            {searchTerm
                                ? 'No items match your search.'
                                : 'Inventory valuation data will appear here.'}
                        </p>
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                color="green"
                                size="2"
                                className="mt-4"
                                onClick={() => handleSearch('')}
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                        {items.map((item) => (
                            <button
                                key={item.inventoryId}
                                onClick={() => openDrillDown(item)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors text-left"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.productName}
                                        {item.variantName && item.variantName !== 'Default' && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">– {item.variantName}</span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {item.sku && (
                                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                                                {item.sku}
                                            </span>
                                        )}
                                        <Badge size="1" color="indigo" variant="soft">
                                            {item.costingMethod === 'WEIGHTED_AVERAGE' ? 'WAC' : item.costingMethod}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(item.totalValue, true)}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {item.availableQuantity.toLocaleString()} units
                                    </p>
                                </div>
                                <Eye className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                            </button>
                        ))}

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {pageLabel}
                            </span>
                            <Flex gap="2">
                                <IconButton
                                    size="1"
                                    variant="soft"
                                    color="gray"
                                    disabled={!hasPrevPage || isLoading}
                                    onClick={prevPage}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                    size="1"
                                    variant="soft"
                                    color="gray"
                                    disabled={!hasNextPage || isLoading}
                                    onClick={nextPage}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </IconButton>
                            </Flex>
                        </div>
                    </div>
                )}
            </div>

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
        </div>
    );
};

export default MobileInventoryValuation;
