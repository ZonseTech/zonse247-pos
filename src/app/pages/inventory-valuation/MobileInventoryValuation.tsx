import { FC, useState, useCallback, useEffect, useRef } from 'react';
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
    Loader2,
    FileSpreadsheet,
} from 'lucide-react';
import classNames from 'classnames';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showOpeningBalance, setShowOpeningBalance] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

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
                setSearchTerm('');
            }
            return !prev;
        });
    }, []);

    const filteredItems = searchTerm.trim()
        ? (summary?.items ?? []).filter(
            (item) =>
                item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : summary?.items ?? [];

    const activeLabel = COSTING_METHODS.find((m) => m.value === displayMethod)?.short ?? 'WAC';

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
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleSearchToggle}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading || isRefreshing}
                                className={classNames(
                                    'p-2 rounded-lg text-gray-500 dark:text-gray-400',
                                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                                    'disabled:opacity-50 transition-all',
                                    (isLoading || isRefreshing) && 'animate-spin'
                                )}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
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
                                {isLoading ? '...' : formatCurrency(getDisplayTotal(), true)}
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
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {COSTING_METHODS.map(({ value, short }) => (
                        <button
                            key={value}
                            onClick={() => setDisplayMethod(value)}
                            className={classNames(
                                'px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all active:scale-95',
                                displayMethod === value
                                    ? 'bg-emerald-500 text-white'
                                    : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            )}
                        >
                            {short}
                        </button>
                    ))}
                    <span className="flex items-center text-[10px] text-gray-400 dark:text-gray-500 pl-2">
                        Viewing: {activeLabel}
                    </span>
                    <button
                        onClick={() => setShowOpeningBalance(true)}
                        className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full whitespace-nowrap active:scale-95 transition-all"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Balance
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading && filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading valuation...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
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
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 px-4 py-2 text-emerald-500 font-medium text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                        {filteredItems.map((item) => (
                            <button
                                key={item.inventoryId}
                                onClick={() => openDrillDown(item)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors text-left"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.productName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {item.sku && (
                                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                                                {item.sku}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded">
                                            {item.costingMethod === 'WEIGHTED_AVERAGE' ? 'WAC' : item.costingMethod}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(getItemDisplayValue(item), true)}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {item.availableQuantity.toLocaleString()} units
                                    </p>
                                </div>
                                <Eye className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                            </button>
                        ))}

                        {/* Bottom Info */}
                        <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                            Showing {filteredItems.length} of {summary?.totalItems ?? 0} items
                        </div>
                    </div>
                )}
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
        </div>
    );
};

export default MobileInventoryValuation;
