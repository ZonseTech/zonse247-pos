import { Edit2, Trash2, Eye, AlertTriangle, Package, PackagePlus, TrendingUp, Layers, History } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';
import { formatCurrency } from '../../../utils';
import dayjs from 'dayjs';

interface InventoryTableColumnsProps {
    onEdit: (item: ApiProduct) => void;
    onDelete: (productId: string) => void;
    onView?: (item: ApiProduct) => void;
    onAdjustQuantity?: (item: ApiProduct) => void;
    onConvertToVariant?: (item: ApiProduct) => void;
    onViewStockMovements?: (item: ApiProduct) => void;
    compact?: boolean;
}

// Helper to get default variant from ApiProduct
const getDefaultVariant = (row: ApiProduct): ProductVariant | undefined => {
    return row.variants?.find(v => v.isDefault) || row.variants?.[0];
};

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

// Get the nearest expiration date across all variants
const getNearestExpiry = (variants: ProductVariant[] | undefined): { date: Date | string; variant: ProductVariant } | null => {
    if (!variants || variants.length === 0) return null;

    const variantsWithExpiry = variants
        .filter(v => v.expirationDate)
        .map(v => ({ date: v.expirationDate!, variant: v }))
        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

    return variantsWithExpiry.length > 0 ? variantsWithExpiry[0] : null;
};

// Calculate total stock value by summing each variant's (quantity × cost)
const getStockValue = (row: ApiProduct): number => {
    if (!row.variants || row.variants.length === 0) return 0;

    return row.variants.reduce((total, variant) => {
        const qty = variant.inventory?.availableQuantity ?? 0;
        const cost = variant.inventory?.averageCost ?? variant.costPrice ?? 0;
        return total + (qty * cost);
    }, 0);
};

// Calculate weighted average cost across all variants
const getAverageCost = (row: ApiProduct): number => {
    const totalQty = row.totalAvailableQuantity ?? 0;
    if (totalQty === 0) {
        // If no stock, return default variant's cost
        const variant = getDefaultVariant(row);
        return variant?.inventory?.averageCost ?? variant?.costPrice ?? 0;
    }
    return getStockValue(row) / totalQty;
};

// Get stock status label
const getStockStatusLabel = (quantity: number, reorderPoint: number): { label: string; color: string } => {
    if (quantity <= 0) {
        return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (quantity <= reorderPoint) {
        return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
};

export const getInventoryTableColumns = ({
    onEdit,
    onDelete,
    onView,
    onAdjustQuantity,
    onConvertToVariant,
    onViewStockMovements,
    compact = false,
}: InventoryTableColumnsProps): TableColumn<ApiProduct>[] => {
    if (compact) {
        return [
            {
                name: 'Barcode',
                selector: (row) => getDefaultVariant(row)?.primaryBarcode || '-',
                sortable: true,
                cell: (row) => {
                    const variant = getDefaultVariant(row);
                    return (
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {variant?.primaryBarcode || '-'}
                        </span>
                    );
                },
            },
            {
                name: 'Item',
                selector: (row) => row.name || '-',
                sortable: true,
                cell: (row) => {
                    const variantCount = row.variantCount ?? row.variants?.length ?? 1;
                    const hasMultipleVariants = variantCount > 1;

                    return (
                        <div className="flex flex-col py-0.5">
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                                    {row.name}
                                </span>
                                {hasMultipleVariants && (
                                    <span className="px-1 py-0.5 text-[9px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                        {variantCount}
                                    </span>
                                )}
                            </div>
                            {row.categoryDetails?.name && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                    {row.categoryDetails.name as string}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                name: 'Cost',
                selector: (row) => getDefaultVariant(row)?.costPrice || 0,
                sortable: true,
                cell: (row) => {
                    const variant = getDefaultVariant(row);
                    return (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {formatCurrency(variant?.costPrice || 0)}
                        </span>
                    );
                },
            },
            {
                name: 'Sell',
                selector: (row) => getDefaultVariant(row)?.sellingPrice || 0,
                sortable: true,
                cell: (row) => {
                    const variant = getDefaultVariant(row);
                    return (
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(variant?.sellingPrice || 0)}
                        </span>
                    );
                },
            },
            {
                name: 'Qty',
                selector: (row) => row.totalAvailableQuantity ?? 0,
                sortable: true,
                cell: (row) => {
                    const variant = getDefaultVariant(row);
                    const qty = row.totalAvailableQuantity ?? 0;
                    const reorderPoint = variant?.inventory?.reorderPoint ?? 0;
                    const colorClass = getStockStatusColor(qty, reorderPoint);

                    return (
                        <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                                {qty}
                            </span>
                            {qty <= reorderPoint && qty > 0 && (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            )}
                        </div>
                    );
                },
            },
            {
                name: 'Min',
                selector: (row) => getDefaultVariant(row)?.inventory?.reorderPoint || 0,
                sortable: true,
                cell: (row) => {
                    const variant = getDefaultVariant(row);
                    return (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {variant?.inventory?.reorderPoint || 0}
                        </span>
                    );
                },
            },
            {
                name: 'Expiry',
                selector: (row) => getDefaultVariant(row)?.expirationDate ? new Date(getDefaultVariant(row)!.expirationDate!).getTime() : 0,
                sortable: true,
                cell: (row) => {
                    const variant = getDefaultVariant(row);
                    const status = getExpirationStatus(variant?.expirationDate);
                    if (!status) return <span className="text-xs text-gray-400">-</span>;

                    return (
                        <div className="flex flex-col">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                                {status.label}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-0.5">
                                {dayjs(variant?.expirationDate).format('DD/MM')}
                            </span>
                        </div>
                    );
                },
            },
            {
                name: 'Status',
                selector: (row) => row.isActive ? 'active' : 'inactive',
                sortable: true,
                cell: (row) => {
                    const status = row.isActive ? 'active' : 'inactive';
                    const colorClass = status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';

                    return (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${colorClass}`}>
                            {status}
                        </span>
                    );
                },
            },
            {
                name: '',
                cell: (row) => {
                    const productId = row.id?.toString() || '';
                    return (
                        <div className="flex items-center space-x-0.5">
                            {onAdjustQuantity && (
                                <button
                                    onClick={() => onAdjustQuantity(row)}
                                    className="p-1 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    title="Adjust"
                                >
                                    <PackagePlus className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                onClick={() => onEdit(row)}
                                className="p-1 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Edit"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onDelete(productId)}
                                className="p-1 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                },
                right: true,
            },
        ];
    }

    return [
        {
            name: 'Product Name',
            selector: (row) => row.name || '-',
            sortable: true,
            cell: (row) => {
                const variantCount = row.variantCount ?? row.variants?.length ?? 1;
                const hasMultipleVariants = variantCount > 1;

                return (
                    <div className="flex flex-col py-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium uppercase text-gray-900 dark:text-gray-100">
                                {row.name}
                            </span>
                            {hasMultipleVariants && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded cursor-pointer" title="Click row to expand variants">
                                    {variantCount} variants
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {row.categoryDetails?.name && (
                                <span className="px-1.5 py-0.5 hidden text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                                    {row.categoryDetails.name}
                                </span>
                            )}
                            {row.brand && (
                                <span className="text-xs hidden text-gray-500 dark:text-gray-400">
                                    {row.brand}
                                </span>
                            )}
                            {!row.isActive && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 rounded">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        // {
        //     name: 'SKU / Barcode',
        //     selector: (row) => getDefaultVariant(row)?.sku || getDefaultVariant(row)?.primaryBarcode || '-',
        //     sortable: true,
        //     cell: (row) => {
        //         const variant = getDefaultVariant(row);
        //         const sku = variant?.sku;
        //         const barcode = variant?.primaryBarcode;
        //         const variantCount = row.variantCount ?? row.variants?.length ?? 1;

        //         return (
        //             <div className="flex flex-col gap-0.5">
        //                 {sku && (
        //                     <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[130px]" title={sku}>
        //                         {sku}
        //                     </span>
        //                 )}
        //                 {barcode && (
        //                     <span className="font-mono text-[10px] text-gray-500 dark:text-gray-500 truncate max-w-[130px]" title={barcode}>
        //                         {barcode}
        //                     </span>
        //                 )}
        //                 {!sku && !barcode && (
        //                     <span className="text-gray-400">-</span>
        //                 )}
        //                 {variantCount > 1 && (
        //                     <span className="text-[9px] text-blue-500 dark:text-blue-400">
        //                         +{variantCount - 1} more barcodes
        //                     </span>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
        {
            name: 'Unit Price',
            selector: (row) => getDefaultVariant(row)?.sellingPrice || 0,
            sortable: true,
            cell: (row) => {
                const variant = getDefaultVariant(row);
                const hasPromo = variant?.promoPrice && variant.promoPrice > 0;

                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(variant?.sellingPrice || 0)}
                        </span>
                        {hasPromo ? (
                            <span className="text-[10px] text-green-600 dark:text-green-400">
                                Promo: {formatCurrency(variant!.promoPrice!)}
                            </span>
                        ) : null}
                    </div>
                );
            },
        },
        {
            name: 'Avg Cost',
            selector: (row) => getAverageCost(row),
            sortable: true,
            cell: (row) => {
                const avgCost = getAverageCost(row);
                const variant = getDefaultVariant(row);
                const lastCost = variant?.inventory?.lastPurchaseCost ?? 0;
                const costDiff = lastCost > 0 ? ((lastCost - avgCost) / avgCost) * 100 : 0;

                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(avgCost)}
                        </span>
                        {lastCost > 0 && Math.abs(costDiff) > 1 && (
                            <span className={`text-[10px] ${costDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                Last: {formatCurrency(lastCost)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            name: 'Stock',
            selector: (row) => row.totalAvailableQuantity ?? 0,
            sortable: true,
            cell: (row) => {
                const variant = getDefaultVariant(row);
                const qty = row.totalAvailableQuantity ?? 0;
                const reserved = row.totalReservedQuantity ?? 0;
                const reorderPoint = variant?.inventory?.reorderPoint ?? 0;
                const unit = variant?.unit || row.defaultUnit || 'pc';
                const colorClass = getStockStatusColor(qty, reorderPoint);

                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                                {qty.toLocaleString()} {unit}
                            </span>
                            {qty <= reorderPoint && qty > 0 && (
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                            )}
                        </div>
                        {reserved > 0 && (
                            <span className="text-[10px] text-orange-500 dark:text-orange-400">
                                {reserved} reserved
                            </span>
                        )}
                    </div>
                );
            },
        },
        // {
        //     name: 'Stock Value',
        //     selector: (row) => getStockValue(row),
        //     sortable: true,
        //     cell: (row) => {
        //         const stockValue = getStockValue(row);
        //         const variant = getDefaultVariant(row);
        //         const retailValue = (row.totalAvailableQuantity ?? 0) * (variant?.sellingPrice ?? 0);
        //         const margin = retailValue > 0 ? ((retailValue - stockValue) / retailValue) * 100 : 0;

        //         return (
        //             <div className="flex flex-col">
        //                 <span className="font-medium text-gray-900 dark:text-gray-100">
        //                     {formatCurrency(stockValue)}
        //                 </span>
        //                 {margin > 0 && (
        //                     <div className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400">
        //                         <TrendingUp className="w-3 h-3" />
        //                         <span>{margin.toFixed(0)}% margin</span>
        //                     </div>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
        {
            name: 'Expiry',
            selector: (row) => {
                const nearest = getNearestExpiry(row.variants);
                return nearest ? dayjs(nearest.date).valueOf() : 0;
            },
            sortable: true,
            cell: (row) => {
                const nearest = getNearestExpiry(row.variants);
                if (!nearest) return <span className="text-gray-400 text-xs">No expiry</span>;

                const status = getExpirationStatus(nearest.date);
                if (!status) return <span className="text-gray-400 text-xs">No expiry</span>;

                const variantCount = row.variantCount ?? row.variants?.length ?? 1;

                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block w-fit ${status.color}`}>
                            {status.label}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {dayjs(nearest.date).format('DD MMM YYYY')}
                        </span>
                        {variantCount > 1 && (
                            <span className="text-[9px] text-blue-500 dark:text-blue-400">
                                (earliest of {variantCount})
                            </span>
                        )}
                    </div>
                );
            },
        },
        // {
        //     name: 'Status',
        //     selector: (row) => {
        //         const variant = getDefaultVariant(row);
        //         const qty = row.totalAvailableQuantity ?? 0;
        //         const reorderPoint = variant?.inventory?.reorderPoint ?? 0;
        //         return qty <= 0 ? 0 : qty <= reorderPoint ? 1 : 2;
        //     },
        //     sortable: true,
        //     cell: (row) => {
        //         const variant = getDefaultVariant(row);
        //         const qty = row.totalAvailableQuantity ?? 0;
        //         const reorderPoint = variant?.inventory?.reorderPoint ?? 0;
        //         const status = getStockStatusLabel(qty, reorderPoint);

        //         return (
        //             <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
        //                 {status.label}
        //             </span>
        //         );
        //     },
        // },
        {
            name: 'Actions',
            cell: (row) => {
                const productId = row.id?.toString() || '';
                const isInactive = !row.isActive;
                const isDiscontinued = (row as any).status === 'DISCONTINUED';
                const disableStockActions = isInactive || isDiscontinued;
                return (
                    <div className="flex items-center space-x-0.5">
                        {onView && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onView(row); }}
                                className="group p-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                title="View Details"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                        {onViewStockMovements && (row.variantCount ?? 1) <= 1 ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onViewStockMovements(row); }}
                                className="group p-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                title="Stock Movements"
                            >
                                <History className="w-4 h-4" />
                            </button>
                        ) : null}
                        {onAdjustQuantity && !disableStockActions ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdjustQuantity(row); }}
                                className="group p-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                title="Adjust Quantity"
                            >
                                <PackagePlus className="w-4 h-4" />
                            </button>
                        ) : null}
                        {onConvertToVariant && !disableStockActions ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onConvertToVariant(row); }}
                                className="group p-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                title="Convert to Variant"
                            >
                                <Layers className="w-4 h-4" />
                            </button>
                        ) : null}
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                            className="group p-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Edit Item"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        {!isDiscontinued && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(productId); }}
                                className="group p-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete Item"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            },
            right: true,
        },
    ];
};

export default getInventoryTableColumns;
