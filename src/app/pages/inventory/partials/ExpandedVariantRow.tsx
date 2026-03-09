import React, { useState } from 'react';
import { AlertTriangle, Package, Calendar, Barcode, History } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import dayjs from 'dayjs';
import StockMovementModal from './StockMovementModal';

interface ExpandedVariantRowProps {
    data: ApiProduct;
}

const getStockStatusColor = (quantity: number, reorderPoint: number) => {
    if (quantity <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (quantity <= reorderPoint) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
};

const getExpirationStatus = (expirationDate?: Date | string | null) => {
    if (!expirationDate) return null;
    const expDate = dayjs(expirationDate);
    const today = dayjs();
    const daysUntilExpiry = expDate.diff(today, 'day');

    if (daysUntilExpiry < 0) {
        return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (daysUntilExpiry <= 30) {
        return { label: `${daysUntilExpiry}d left`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    }
    if (daysUntilExpiry <= 90) {
        return { label: `${daysUntilExpiry}d left`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
    return { label: 'Good', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
};

const ExpandedVariantRow: React.FC<ExpandedVariantRowProps> = ({ data }) => {
    const variants = data.variants || [];
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    if (variants.length === 0) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center text-gray-500 dark:text-gray-400">
                No variants available
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variants ({variants.length})
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100/50 dark:bg-gray-700/30 text-left">
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Variant</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">SKU / Barcode</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Cost</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Sell Price</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Reorder</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Expiry</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Status</th>
                            <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400 text-center w-20"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((variant, index) => {
                            const qty = variant.inventory?.availableQuantity ?? 0;
                            const reorderPoint = variant.inventory?.reorderPoint ?? 0;
                            const stockColor = getStockStatusColor(qty, reorderPoint);
                            const expiryStatus = getExpirationStatus(variant.expirationDate);

                            return (
                                <tr
                                    key={variant.id}
                                    className={`border-b border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                                        } hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {variant.isDefault && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 rounded">
                                                    Default
                                                </span>
                                            )}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {variant.variantName}
                                            </span>
                                            {variant.size && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({variant.size})
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-0.5">
                                            {variant.sku && (
                                                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                                                    {variant.sku}
                                                </span>
                                            )}
                                            {variant.primaryBarcode && variant.primaryBarcode !== variant.sku && (
                                                <div className="flex items-center gap-1">
                                                    <Barcode className="w-3 h-3 text-gray-400" />
                                                    <span className="font-mono text-xs text-gray-500 dark:text-gray-500">
                                                        {variant.primaryBarcode}
                                                    </span>
                                                </div>
                                            )}
                                            {!variant.sku && !variant.primaryBarcode && (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {formatCurrency(variant.inventory?.averageCost ?? variant.costPrice ?? 0)}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(variant.sellingPrice)}
                                            </span>
                                            {variant.promoPrice && variant.promoPrice > 0 && (
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                    Promo: {formatCurrency(variant.promoPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${stockColor}`}>
                                                {qty} {variant.unit}
                                            </span>
                                            {qty <= reorderPoint && qty > 0 && (
                                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                            )}
                                            {variant.inventory?.reservedQuantity ? (
                                                <span className="text-xs text-orange-500">
                                                    ({variant.inventory.reservedQuantity} reserved)
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {reorderPoint || '-'}
                                    </td>

                                    <td className="px-4 py-3">
                                        {expiryStatus ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block w-fit ${expiryStatus.color}`}>
                                                    {expiryStatus.label}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {dayjs(variant.expirationDate).format('DD MMM YYYY')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">No expiry</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${variant.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                            }`}>
                                            {variant.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedVariant(variant)}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50"
                                            title="View stock movement history"
                                        >
                                            <History className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>
                        Total Available: <strong className="text-gray-900 dark:text-gray-100">{data.totalAvailableQuantity}</strong>
                    </span>
                    {data.totalReservedQuantity > 0 && (
                        <span>
                            Reserved: <strong className="text-orange-500">{data.totalReservedQuantity}</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Stock Movement Modal */}
            {selectedVariant && (
                <StockMovementModal
                    isOpen={!!selectedVariant}
                    onClose={() => setSelectedVariant(null)}
                    variantId={selectedVariant.id}
                    variantName={selectedVariant.variantName}
                    productName={data.name}
                    sku={selectedVariant.sku}
                />
            )}
        </div>
    );
};

export default ExpandedVariantRow;
