import { FunctionComponent } from 'react';
import { formatCurrency, calculateTotal } from './helpers';
import type { POFormValues } from './types';

interface POViewItemsProps {
    purchaseOrder: PurchaseOrder;
    values: POFormValues;
}

const POViewItems: FunctionComponent<POViewItemsProps> = ({ purchaseOrder, values }) => (
    <div className="space-y-3">
        {purchaseOrder.items.map((item, index) => {
            const vName = item.variant?.variantName || '';
            const pName = item.variant?.product?.name || '';
            const displayName = pName
                ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                : vName || item.product?.name || 'Unknown';
            const sku = item.variant?.sku || item.product?.sku || '';

            return (
                <div
                    key={item.id || index}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
                            {sku && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {sku}</p>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(item.totalPrice || item.orderedQuantity * item.unitPrice)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Ordered</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.orderedQuantity}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Unit Price</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Received</span>
                            <p className="font-medium text-green-600 dark:text-green-400">{item.receivedQuantity || 0}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Damaged</span>
                            <p className="font-medium text-red-600 dark:text-red-400">{item.damagedQuantity || 0}</p>
                        </div>
                    </div>

                    {item.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{item.notes}</p>
                    )}
                </div>
            );
        })}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-lg">
                <span className="text-gray-600 dark:text-gray-400">Total: </span>
                <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(purchaseOrder.totalAmount ?? calculateTotal(values.items))}
                </span>
            </div>
        </div>
    </div>
);

export default POViewItems;
