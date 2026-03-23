import { FC, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
    ArrowLeft,
    Clock,
    AlertTriangle,
    PackageX,
    DollarSign,
    Package,
    Search,
    X,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { IconButton, Flex, SegmentedControl, Spinner } from '@radix-ui/themes';
import classNames from 'classnames';
import { useInventoryAging, BUCKET_KEYS, BUCKET_LABELS, BUCKET_COLORS, type BucketKey } from '../../hooks/useInventoryAging';
import { formatCurrency } from '../../utils';

const STATUS_FILTERS = [
    { value: 'all' as const, label: 'All' },
    { value: 'slow' as const, label: 'Slow' },
    { value: 'dead' as const, label: 'Dead' },
    { value: 'active' as const, label: 'Active' },
];

const THRESHOLD_OPTIONS = [30, 60, 90, 120, 180, 365];

const STATUS_BADGE: Record<string, string> = {
    active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    slow: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    dead: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
};

const MobileInventoryAging: FC = () => {
    const navigate = useNavigate();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        items,
        summary,
        isLoading,
        searchTerm,
        handleSearch,
        thresholdDays,
        handleThresholdChange,
        statusFilter,
        handleStatusFilterChange,
        loadAgingReport,
        getBucketChartData,
        valueAtRisk,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        pageLabel,
    } = useInventoryAging();

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadAgingReport();
        setTimeout(() => setIsRefreshing(false), 500);
    }, [loadAgingReport]);

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

    const bucketChartData = getBucketChartData();
    const maxBucketValue = Math.max(...bucketChartData.map((b) => b.totalValue), 1);

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
                        <button onClick={handleSearchToggle} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
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
                                <Clock className="w-6 h-6 text-amber-500" />
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Aging</h1>
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
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex-shrink-0">
                        <Package className="w-4 h-4 text-sky-500" />
                        <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                            {summary?.totalItems ?? '—'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {summary?.totalSlowMovers ?? '—'}
                        </span>
                        <span className="text-[10px] text-amber-500 hidden sm:inline">slow</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                        <PackageX className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {summary?.totalNeverSold ?? '—'}
                        </span>
                        <span className="text-[10px] text-red-500 hidden sm:inline">never</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                            {isLoading ? '...' : formatCurrency(valueAtRisk, true)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls: Threshold + Status Filter */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <Flex align="center" gap="2" justify="between">
                    <select
                        value={thresholdDays}
                        onChange={(e) => handleThresholdChange(Number(e.target.value))}
                        className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 outline-none flex-shrink-0"
                    >
                        {THRESHOLD_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}d threshold</option>
                        ))}
                    </select>
                    <SegmentedControl.Root
                        size="1"
                        value={statusFilter}
                        onValueChange={(value) => handleStatusFilterChange(value as 'all' | 'active' | 'slow' | 'dead')}
                    >
                        {STATUS_FILTERS.map(({ value, label }) => (
                            <SegmentedControl.Item key={value} value={value}>
                                {label}
                            </SegmentedControl.Item>
                        ))}
                    </SegmentedControl.Root>
                </Flex>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading && items.length === 0 ? (
                    <Flex align="center" justify="center" direction="column" py="9" gap="3">
                        <Spinner size="3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading aging report...</p>
                    </Flex>
                ) : !isLoading && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                            <Clock className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                            No items found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs text-sm">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your filters.'
                                : 'Aging data will appear here.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Bucket Bars (simple mobile representation) */}
                        {bucketChartData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                    Aging Buckets
                                </p>
                                <div className="space-y-1.5">
                                    {bucketChartData.map((bucket) => {
                                        const pct = maxBucketValue > 0 ? (bucket.totalValue / maxBucketValue) * 100 : 0;
                                        return (
                                            <div key={bucket.key} className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 flex-shrink-0 text-right">
                                                    {bucket.label.replace(' days', 'd')}
                                                </span>
                                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.max(pct, 2)}%`,
                                                            backgroundColor: BUCKET_COLORS[bucket.key as BucketKey],
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                                                    {bucket.itemCount}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Items List */}
                        <div className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                            {items.map((item) => (
                                <div
                                    key={item.inventoryId}
                                    className="flex items-center gap-3 px-4 py-3"
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
                                            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${STATUS_BADGE[item.status] || ''}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(item.stockValue, true)}
                                        </p>
                                        <p className={`text-[10px] font-medium ${item.daysSinceLastSale === null
                                            ? 'text-gray-400'
                                            : item.daysSinceLastSale > 180
                                                ? 'text-red-500'
                                                : item.daysSinceLastSale > 90
                                                    ? 'text-amber-500'
                                                    : 'text-gray-400'
                                            }`}>
                                            {item.daysSinceLastSale !== null ? `${item.daysSinceLastSale}d idle` : 'Never sold'}
                                        </p>
                                    </div>
                                </div>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default MobileInventoryAging;
