import { FunctionComponent } from 'react';
import { HiOutlineUser, HiOutlinePlay, HiOutlineTrash } from 'react-icons/hi';
import { formatCurrency, formatDate } from '../../../../utils';
import { ParkedSaleCardProps } from './types';
import ParkedSaleItems from './ParkedSaleItems';

const ParkedSaleCard: FunctionComponent<ParkedSaleCardProps> = ({
    sale,
    isSelected,
    isLoading,
    onViewDetails,
    onResume,
    onDelete,
}) => {
    const handleResume = (e: React.MouseEvent) => {
        e.stopPropagation();
        onResume(sale);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(sale);
    };

    return (
        <div
            className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl border transition-all duration-200 ${isSelected
                ? 'border-amber-400 dark:border-amber-500 shadow-md'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => onViewDetails(sale)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <HiOutlineUser className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                {sale.reference}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(String(sale.parkedAt || sale.createdAt))} • {sale.items?.length || 0} item{(sale.items?.length || 0) !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {formatCurrency(sale.totalAmount)}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleResume}
                                disabled={isLoading}
                                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-500 disabled:bg-gray-400 text-white py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
                            >
                                <HiOutlinePlay className="w-4 h-4" />
                                Resume
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-500 disabled:bg-gray-400 text-white py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isSelected && sale.items && sale.items.length > 0 && (
                <ParkedSaleItems items={sale.items} notes={sale.notes} />
            )}
        </div>
    );
};

export default ParkedSaleCard;
