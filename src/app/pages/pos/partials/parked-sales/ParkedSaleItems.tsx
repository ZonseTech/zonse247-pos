import { FunctionComponent } from 'react';
import { formatCurrency } from '../../../../utils';
import { ParkedSaleItemsProps } from './types';

const ParkedSaleItems: FunctionComponent<ParkedSaleItemsProps> = ({
    items,
    notes,
}) => {
    return (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-3 mb-2">
                Items:
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item, index) => (
                    <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded-lg p-2"
                    >
                        <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.quantity} × {formatCurrency(item.sellPrice || item.unitPrice)}
                            </p>
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                            {formatCurrency((item.sellPrice || item.unitPrice) * item.quantity)}
                        </p>
                    </div>
                ))}
            </div>
            {notes && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        <strong>Note:</strong> {notes}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ParkedSaleItems;
