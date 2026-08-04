import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    Activity,
    ArrowLeft,
    Search,
    X,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Package,
    SlidersHorizontal,
    ShieldAlert,
    Clock,
    ClipboardCheck,
    ArrowRightLeft,
} from 'lucide-react';
import { useStockMovements } from '../../hooks/useStockMovements';
import { useAuth } from '../../context/AuthProvider';
import { hasPermission } from '../../utils';
import { StockMovementMobileList } from './partials/StockMovementMobileCard';
import MobileFilters from './partials/MobileFilters';
import StockAdjustmentModal from './partials/StockAdjustmentModal';
import DamageStockModal from './partials/DamageStockModal';
import ExpiryStockModal from './partials/ExpiryStockModal';
import StockCountModal from './partials/StockCountModal';
import StockTransferModal from './partials/StockTransferModal';
import classNames from 'classnames';

type ModalType = 'adjust' | 'damage' | 'expiry' | 'count' | 'transfer' | null;

const MobileStockMovements: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const productId = (location.state as any)?.productId;

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const { user } = useAuth();

    const canAdjust = hasPermission(user, 'inventory.adjust');
    const canWaste = hasPermission(user, 'inventory.waste');
    const canCount = hasPermission(user, 'inventory.count');
    const canTransfer = hasPermission(user, 'inventory.transfer');

    const {
        movements,
        isLoading,
        page,
        setPage,
        perPage,
        totalRows,
        movementTypeFilter,
        setMovementTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loadMovements,
        adjustStock,
        damageStock,
        transferStock,
        performStockCount,
        recordExpiry,
        tenantId,
        branchId,
        userId,
    } = useStockMovements(productId);

    // Accumulated movements for infinite scroll
    const [accumulatedMovements, setAccumulatedMovements] = useState<StockMovement[]>([]);

    // Update accumulated movements when page or data changes
    useEffect(() => {
        if (movements && movements.length > 0) {
            if (page === 1) {
                setAccumulatedMovements(movements);
            } else {
                setAccumulatedMovements(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMovements = movements.filter(m => !existingIds.has(m.id));
                    return [...prev, ...newMovements];
                });
            }
        } else if (page === 1) {
            setAccumulatedMovements([]);
        }
    }, [movements, page]);

    // Calculate summary stats
    const summaryStats = {
        total: totalRows,
        inCount: accumulatedMovements.filter(m => m.direction === 'IN').length,
        outCount: accumulatedMovements.filter(m => m.direction === 'OUT').length,
    };

    const hasMore = totalRows > accumulatedMovements.length;

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            setPage(page + 1);
        }
    }, [isLoading, hasMore, page, setPage]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setPage(1);
        setAccumulatedMovements([]);
        await loadMovements();
        setTimeout(() => setIsRefreshing(false), 500);
    }, [loadMovements, setPage]);

    const handleSearchToggle = useCallback(() => {
        setIsSearchVisible(prev => {
            if (!prev) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
            } else {
                setSearchTerm('');
            }
            return !prev;
        });
    }, []);

    // Pull to refresh touch handlers
    const touchStartY = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling) return;
        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, Math.min(100, (currentY - touchStartY.current) * 0.5));
        setPullDistance(distance);
    };

    const handleTouchEnd = () => {
        if (pullDistance > 60) {
            handleRefresh();
        }
        setPullDistance(0);
        setIsPulling(false);
    };

    // Filter when search term changes
    const filteredMovements = searchTerm
        ? accumulatedMovements.filter(m =>
            m.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : accumulatedMovements;

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
                            placeholder="Search products, references..."
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
                                <Activity className="w-6 h-6 text-sky-500" />
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Stock Movements
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
                            <MobileFilters
                                movementTypeFilter={movementTypeFilter}
                                onMovementTypeChange={(value) => {
                                    setMovementTypeFilter(value);
                                    setPage(1);
                                    setAccumulatedMovements([]);
                                }}
                                startDate={startDate}
                                onStartDateChange={(value) => {
                                    setStartDate(value);
                                    setPage(1);
                                    setAccumulatedMovements([]);
                                }}
                                endDate={endDate}
                                onEndDateChange={(value) => {
                                    setEndDate(value);
                                    setPage(1);
                                    setAccumulatedMovements([]);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Stats Bar */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                            <Package className="w-4 h-4 text-sky-500" />
                            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">{summaryStats.total}</span>
                            <span className="text-xs text-sky-500 dark:text-sky-400">total</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{summaryStats.inCount}</span>
                            <span className="text-xs text-green-500/80 hidden sm:inline">in</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/30 rounded-lg">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">{summaryStats.outCount}</span>
                            <span className="text-xs text-red-500/80 hidden sm:inline">out</span>
                        </div>
                    </div>

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

                {/* Active Filters Display */}
                {(movementTypeFilter || startDate || endDate) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {movementTypeFilter && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-xs rounded-full">
                                {movementTypeFilter.replace(/_/g, ' ')}
                                <button onClick={() => setMovementTypeFilter('')} className="hover:text-sky-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {startDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                From: {startDate}
                                <button onClick={() => setStartDate('')} className="hover:text-gray-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {endDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                To: {endDate}
                                <button onClick={() => setEndDate('')} className="hover:text-gray-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {canAdjust && (
                        <button
                            onClick={() => setActiveModal('adjust')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 whitespace-nowrap active:scale-95 transition-all"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Adjust
                        </button>
                    )}
                    {canWaste && (
                        <button
                            onClick={() => setActiveModal('damage')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 whitespace-nowrap active:scale-95 transition-all"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Damage
                        </button>
                    )}
                    {canWaste && (
                        <button
                            onClick={() => setActiveModal('expiry')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 whitespace-nowrap active:scale-95 transition-all"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Expiry
                        </button>
                    )}
                    {canCount && (
                        <button
                            onClick={() => setActiveModal('count')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 whitespace-nowrap active:scale-95 transition-all"
                        >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Stock Count
                        </button>
                    )}
                    {canTransfer && (
                        <button
                            onClick={() => setActiveModal('transfer')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 whitespace-nowrap active:scale-95 transition-all"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Transfer
                        </button>
                    )}
                </div>
            </div>

            {/* Pull to Refresh Indicator */}
            {pullDistance > 0 && (
                <div
                    className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden transition-all"
                    style={{ height: pullDistance }}
                >
                    <RefreshCw
                        className={classNames(
                            'w-6 h-6 text-sky-500 transition-transform',
                            pullDistance > 60 && 'animate-spin'
                        )}
                        style={{ transform: `rotate(${pullDistance * 3}deg)` }}
                    />
                </div>
            )}

            {/* Content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto overscroll-contain"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {isLoading && accumulatedMovements.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800">
                        <StockMovementMobileList
                            movements={[]}
                            isLoading={true}
                        />
                    </div>
                ) : filteredMovements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                            <Activity className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                            No movements found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs text-sm">
                            {movementTypeFilter || startDate || endDate || searchTerm
                                ? "Try adjusting your filters or search term."
                                : "Stock movements will appear here as inventory changes."}
                        </p>
                        {(movementTypeFilter || startDate || endDate || searchTerm) && (
                            <button
                                onClick={() => {
                                    setMovementTypeFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                    setSearchTerm('');
                                }}
                                className="mt-4 px-4 py-2 text-sky-500 font-medium text-sm hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 min-h-full">
                        <StockMovementMobileList
                            movements={filteredMovements}
                            isLoading={isLoading}
                            onLoadMore={handleLoadMore}
                            hasMore={hasMore && !searchTerm}
                        />

                        {/* Bottom Pagination Info */}
                        {!hasMore && filteredMovements.length > 0 && (
                            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                                Showing all {filteredMovements.length} movements
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Datepicker Portal */}
            <div id="datepicker-portal" />

            {/* Modals */}
            <StockAdjustmentModal
                isOpen={activeModal === 'adjust'}
                onClose={() => setActiveModal(null)}
                onSubmit={adjustStock}
            />
            <DamageStockModal
                isOpen={activeModal === 'damage'}
                onClose={() => setActiveModal(null)}
                onSubmit={damageStock}
            />
            <ExpiryStockModal
                isOpen={activeModal === 'expiry'}
                onClose={() => setActiveModal(null)}
                onSubmit={recordExpiry}
            />
            <StockCountModal
                isOpen={activeModal === 'count'}
                onClose={() => setActiveModal(null)}
                onSubmit={performStockCount}
            />
            <StockTransferModal
                isOpen={activeModal === 'transfer'}
                onClose={() => setActiveModal(null)}
                onSubmit={transferStock}
                tenantId={tenantId}
                branchId={branchId}
                userId={userId}
            />
        </div>
    );
};

export default MobileStockMovements;
