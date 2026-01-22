import React from 'react';
import { Edit2, Trash2, Eye, AlertTriangle, Package, PackagePlus } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';
import { formatCurrency } from '../../../utils';
import dayjs from 'dayjs';

interface InventoryTableColumnsProps {
    onEdit: (item: InventoryItem) => void;
    onDelete: (productId: string) => void;
    onView?: (item: InventoryItem) => void;
    onAdjustQuantity?: (item: InventoryItem) => void;
    compact?: boolean;
}

const getStockStatusColor = (quantity: number, minStock: number) => {
    if (quantity <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (quantity <= minStock) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
};

const getExpirationStatus = (expirationDate?: Date | string) => {
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

export const getInventoryTableColumns = ({
    onEdit,
    onDelete,
    onView,
    onAdjustQuantity,
    compact = false,
}: InventoryTableColumnsProps): TableColumn<InventoryItem>[] => {
    // Compact columns for EBN terminals - optimized with better visibility
    if (compact) {
        return [
            {
                name: 'Barcode',
                selector: (row) => row.barcode || '-',
                sortable: true,
                width: '110px',
                cell: (row) => (
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {row.barcode || '-'}
                    </span>
                ),
            },
            {
                name: 'Item',
                selector: (row) => row.name || '-',
                sortable: true,
                cell: (row) => (
                    <div className="flex flex-col py-0.5">
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                            {row.name}
                        </span>
                        {row.categoryDetails?.name && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                {row.categoryDetails.name as string}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                name: 'Cost',
                selector: (row) => Number(row.costPrice) || 0,
                sortable: true,
                width: '85px',
                cell: (row) => (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatCurrency(Number(row.costPrice) || 0)}
                    </span>
                ),
            },
            {
                name: 'Sell',
                selector: (row) => Number(row.sellPrice) || 0,
                sortable: true,
                width: '85px',
                cell: (row) => (
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(Number(row.sellPrice) || 0)}
                    </span>
                ),
            },
            {
                name: 'Qty',
                selector: (row) => Number(row.quantity) || 0,
                sortable: true,
                width: '75px',
                cell: (row) => {
                    const qty = Number(row.quantity) || 0;
                    const minStock = Number(row.minStock) || 0;
                    const colorClass = getStockStatusColor(qty, minStock);

                    return (
                        <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                                {qty}
                            </span>
                            {qty <= minStock && qty > 0 && (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            )}
                        </div>
                    );
                },
            },
            {
                name: 'Min',
                selector: (row) => Number(row.minStock) || 0,
                sortable: true,
                width: '55px',
                cell: (row) => (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {row.minStock || 0}
                    </span>
                ),
            },
            {
                name: 'Expiry',
                selector: (row) => row.expirationDate ? new Date(row.expirationDate).getTime() : 0,
                sortable: true,
                width: '80px',
                cell: (row) => {
                    const status = getExpirationStatus(row.expirationDate);
                    if (!status) return <span className="text-xs text-gray-400">-</span>;

                    return (
                        <div className="flex flex-col">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                                {status.label}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-0.5">
                                {dayjs(row.expirationDate).format('DD/MM')}
                            </span>
                        </div>
                    );
                },
            },
            {
                name: 'Status',
                selector: (row) => row.status || 'active',
                sortable: true,
                width: '70px',
                cell: (row) => {
                    const status = row.status || 'active';
                    const colorClass = status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : status === 'inactive'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

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
                    const productId = row.productId?.toString() || '';
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
                                className="p-1 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Edit"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onDelete(productId)}
                                className="p-1 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                },
                width: '95px',
                right: true,
            },
        ];
    }

    // Full columns for desktop
    return [
        {
            name: 'Barcode',
            selector: (row) => row.barcode || '-',
            sortable: true,
            cell: (row) => (
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {row.barcode || '-'}
                </span>
            ),
        },
        {
            name: 'Item Name',
            selector: (row) => row.name || '-',
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {row.name}
                    </span>
                    {row.brand && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {row.brand}
                        </span>
                    )}
                </div>
            ),
        },
        {
            name: 'Category',
            selector: (row) => row.categoryDetails?.name || '-',
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.categoryDetails?.color && (
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: row.categoryDetails.color }}
                        />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                        {row.categoryDetails?.name || '-'}
                    </span>
                </div>
            ),
        },
        {
            name: 'Cost Price',
            selector: (row) => Number(row.costPrice) || 0,
            sortable: true,
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(Number(row.costPrice) || 0)}
                </span>
            ),
        },
        {
            name: 'Sell Price',
            selector: (row) => Number(row.sellPrice) || 0,
            sortable: true,
            cell: (row) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(Number(row.sellPrice) || 0)}
                </span>
            ),
        },
        {
            name: 'Original Quantity',
            selector: (row) => Number(row.originalQuantity) || 0,
            sortable: true,
            cell: (row) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {Number(row.originalQuantity) || 0}
                </span>
            ),
        },
        {
            name: 'Quantity',
            selector: (row) => Number(row.quantity) || 0,
            sortable: true,
            cell: (row) => {
                const qty = Number(row.quantity) || 0;
                const minStock = Number(row.minStock) || 0;
                const colorClass = getStockStatusColor(qty, minStock);

                return (
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                            {qty} {row.unit || 'pc'}
                        </span>
                        {qty <= minStock && qty > 0 && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                    </div>
                );
            },
        },
        {
            name: 'Min Stock',
            selector: (row) => Number(row.minStock) || 0,
            sortable: true,
            cell: (row) => (
                <span className="text-gray-500 dark:text-gray-400">
                    {row.minStock || 0}
                </span>
            ),
        },
        {
            name: 'Expiry',
            selector: (row) => row.expirationDate ? new Date(row.expirationDate).getTime() : 0,
            sortable: true,
            cell: (row) => {
                const status = getExpirationStatus(row.expirationDate);
                if (!status) return <span className="text-gray-400">-</span>;

                return (
                    <div className="flex flex-col">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                            {dayjs(row.expirationDate).format('DD/MM/YY')}
                        </span>
                    </div>
                );
            },
        },
        {
            name: 'Status',
            selector: (row) => row.status || 'active',
            sortable: true,
            cell: (row) => {
                const status = row.status || 'active';
                const colorClass = status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            name: 'Actions',
            cell: (row) => {
                const productId = row.productId?.toString() || '';
                return (
                    <div className="flex items-center space-x-1">
                        {onView && (
                            <button
                                onClick={() => onView(row)}
                                className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                title="View Details"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                        {onAdjustQuantity && (
                            <button
                                onClick={() => onAdjustQuantity(row)}
                                className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                title="Adjust Quantity"
                            >
                                <PackagePlus className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => onEdit(row)}
                            className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Edit Item"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(productId)}
                            className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Item"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
            width: '160px',
            right: true,
        },
    ];
};

export default getInventoryTableColumns;
