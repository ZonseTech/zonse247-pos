import { FC } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Package, Calendar, Hash, FileText } from 'lucide-react';
import dayjs from 'dayjs';

interface StockMovementMobileCardProps {
    movement: StockMovement;
}

const typeColors: Record<StockMovementType, string> = {
    PURCHASE_RECEIPT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    SALE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    RETURN: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    ADJUSTMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    TRANSFER_IN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    TRANSFER_OUT: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    DAMAGE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    EXPIRY: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    STOCK_TAKE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    PRODUCTION: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    CONSUMPTION: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const StockMovementMobileCard: FC<StockMovementMobileCardProps> = ({ movement }) => {
    const isIncrease = movement.direction === 'IN';
    const isDecrease = movement.direction === 'OUT';
    const Icon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : RefreshCw;
    const colorClass = isIncrease
        ? 'text-green-500 dark:text-green-400'
        : isDecrease
            ? 'text-red-500 dark:text-red-400'
            : 'text-yellow-600 dark:text-yellow-400';

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[movement.movementType]}`}>
                            {movement.movementType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {dayjs(movement.movementDate).format('MMM D, YYYY HH:mm')}
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {movement.product?.name || 'Unknown Product'}
                    </h3>
                </div>

                {/* Movement indicator */}
                <div className={`flex items-center gap-1.5 font-bold text-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                    <span>
                        {isIncrease ? '+' : isDecrease ? '-' : '±'}
                        {movement.quantity}
                    </span>
                </div>
            </div>

            {/* Stock change details */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Before</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{movement.previousQuantity}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Change</p>
                    <p className={`font-semibold ${colorClass}`}>
                        {isIncrease ? '+' : isDecrease ? '-' : '±'}{movement.quantity}
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">After</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{movement.newQuantity}</p>
                </div>
            </div>

            {/* Additional info */}
            <div className="space-y-1.5 text-sm">
                {movement.unitCost > 0 && (
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span>Unit Cost:</span>
                        <span className="font-medium">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'MWK',
                            }).format(movement.unitCost)}
                        </span>
                    </div>
                )}
                {movement.referenceNumber && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{movement.referenceNumber}</span>
                    </div>
                )}
                {movement.notes && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span className="text-xs line-clamp-2">{movement.notes}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface StockMovementMobileListProps {
    movements: StockMovement[];
    isLoading?: boolean;
}

export const StockMovementMobileList: FC<StockMovementMobileListProps> = ({
    movements,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {movements.map((movement) => (
                <StockMovementMobileCard
                    key={movement.id}
                    movement={movement}
                />
            ))}
        </div>
    );
};

export default StockMovementMobileCard;
