import { FC, useState, useCallback, useRef, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Package,
    Calendar,
    Hash,
    FileText,
    ChevronDown,
    User,
    Building2,
    Clock
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import classNames from 'classnames';
import { getMovementDisplayType, isCorrectableMovement } from '../../../utils/stock-movement.helper';

dayjs.extend(relativeTime);

interface StockMovementMobileCardProps {
    movement: StockMovement;
    index?: number;
    // Shown as a "Correct" action on correctable movements when provided
    onCorrect?: (movement: StockMovement) => void;
    isCorrected?: boolean;
}

const typeConfig: Record<string, {
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
}> = {
    PURCHASE_RECEIPT: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        label: 'Purchase'
    },
    SALE: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        label: 'Sale'
    },
    RETURN: {
        color: 'text-sky-600 dark:text-sky-400',
        bgColor: 'bg-sky-50 dark:bg-sky-900/20',
        borderColor: 'border-sky-200 dark:border-sky-800',
        label: 'Return'
    },
    ADJUSTMENT: {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        label: 'Adjustment'
    },
    TRANSFER_IN: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        label: 'Transfer In'
    },
    TRANSFER_OUT: {
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-50 dark:bg-pink-900/20',
        borderColor: 'border-pink-200 dark:border-pink-800',
        label: 'Transfer Out'
    },
    DAMAGE: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        label: 'Damage'
    },
    EXPIRY: {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-700/50',
        borderColor: 'border-gray-200 dark:border-gray-600',
        label: 'Expiry'
    },
    OPENING_BALANCE: {
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        label: 'Opening Balance'
    },
    RETURN_TO_SUPPLIER: {
        color: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        borderColor: 'border-teal-200 dark:border-teal-800',
        label: 'Supplier Return'
    },
    STOCK_COUNT: {
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
        label: 'Stock Count'
    },
    CORRECTION: {
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-50 dark:bg-violet-900/20',
        borderColor: 'border-violet-200 dark:border-violet-800',
        label: 'Correction'
    },
};

const StockMovementMobileCard: FC<StockMovementMobileCardProps> = ({ movement, index = 0, onCorrect, isCorrected = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isIncrease = movement.direction === 'IN';
    const isDecrease = movement.direction === 'OUT';
    const Icon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : RefreshCw;

    const config = typeConfig[getMovementDisplayType(movement)] || typeConfig.ADJUSTMENT;

    const quantityColorClass = isIncrease
        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
        : isDecrease
            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30';

    const timeAgo = useMemo(() => {
        return dayjs(movement.movementDate).fromNow();
    }, [movement.movementDate]);

    const formattedDate = useMemo(() => {
        return dayjs(movement.movementDate).format('ddd, MMM D, YYYY • h:mm A');
    }, [movement.movementDate]);

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const hasExtendedInfo = movement.unitCost > 0 || movement.referenceNumber || movement.notes || movement.performedByUser;

    return (
        <div
            ref={cardRef}
            className={classNames(
                'animate-fade-in-up',
                'border-b border-gray-100 dark:border-gray-700/50 last:border-b-0'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div
                className={classNames(
                    'p-4 transition-colors duration-200',
                    'active:bg-gray-50 dark:active:bg-gray-700/30'
                )}
                onClick={hasExtendedInfo ? handleToggle : undefined}
            >
                {/* Top Row - Type Badge & Time */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={classNames(
                            'px-2.5 py-1 rounded-lg text-xs font-semibold',
                            config.bgColor,
                            config.color
                        )}>
                            {config.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                        </span>
                    </div>
                    {hasExtendedInfo && (
                        <button className="p-1 -mr-1 text-gray-400">
                            <ChevronDown className={classNames(
                                'w-4 h-4 transition-transform duration-200',
                                isExpanded && 'rotate-180'
                            )} />
                        </button>
                    )}
                </div>

                {/* Product Info Row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={classNames(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            config.bgColor
                        )}>
                            <Package className={classNames('w-5 h-5', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {movement.product?.name || 'Unknown Product'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {movement.previousQuantity} → {movement.newQuantity}
                                {movement.variant?.sku && <span className="ml-2">• {movement.variant.sku}</span>}
                            </p>
                        </div>
                    </div>

                    {/* Quantity Change Badge */}
                    <div className={classNames(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold',
                        quantityColorClass
                    )}>
                        <Icon className="w-4 h-4" />
                        <span className="text-lg tabular-nums">
                            {isIncrease ? '+' : isDecrease ? '-' : '±'}
                            {movement.quantity}
                        </span>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && hasExtendedInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 space-y-3 animate-expand">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formattedDate}</span>
                        </div>

                        {movement.unitCost > 0 && (
                            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Unit Cost</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'MWK',
                                    }).format(movement.unitCost)}
                                </span>
                            </div>
                        )}

                        {movement.referenceNumber && (
                            <div className="flex items-center gap-2 text-sm">
                                <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">Ref:</span>
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                    {movement.referenceNumber}
                                </span>
                            </div>
                        )}

                        {movement.performedByUser && (
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">By:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {movement.performedByUser.fullname}
                                </span>
                            </div>
                        )}

                        {movement.notes && (
                            <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {movement.notes}
                                </p>
                            </div>
                        )}

                        {isCorrected ? (
                            <p className="text-xs italic text-gray-500 dark:text-gray-400">Corrected</p>
                        ) : onCorrect && isCorrectableMovement(movement) ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCorrect(movement);
                                }}
                                className="text-sm font-medium text-violet-600 dark:text-violet-400"
                            >
                                Correct this movement
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                    opacity: 0;
                }
                @keyframes expand {
                    from {
                        opacity: 0;
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 500px;
                    }
                }
                .animate-expand {
                    animation: expand 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

interface StockMovementMobileListProps {
    movements: StockMovement[];
    isLoading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    onCorrect?: (movement: StockMovement) => void;
    correctedIds?: Set<string>;
}

export const StockMovementMobileList: FC<StockMovementMobileListProps> = ({
    movements,
    isLoading = false,
    onLoadMore,
    hasMore = false,
    onCorrect,
    correctedIds,
}) => {
    const observerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for infinite scroll
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && onLoadMore) {
            onLoadMore();
        }
    }, [hasMore, isLoading, onLoadMore]);

    // Set up intersection observer
    const observerCallback = useRef(handleObserver);
    observerCallback.current = handleObserver;

    if (isLoading && movements.length === 0) {
        return (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {movements.map((movement, index) => (
                <StockMovementMobileCard
                    key={movement.id}
                    movement={movement}
                    index={index}
                    onCorrect={onCorrect}
                    isCorrected={correctedIds?.has(movement.id)}
                />
            ))}

            {/* Loading more indicator */}
            {isLoading && movements.length > 0 && (
                <div className="flex items-center justify-center py-6">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-sky-500 rounded-full animate-spin" />
                        <span className="text-sm">Loading more...</span>
                    </div>
                </div>
            )}

            {/* Intersection observer target */}
            {hasMore && !isLoading && (
                <div ref={observerRef} className="h-4" />
            )}
        </div>
    );
};

export default StockMovementMobileCard;

