import { TableColumn } from 'react-data-table-component';
import { Pencil, Trash2, BarChart3, Barcode, Package, Tag, Calendar, AlertTriangle } from 'lucide-react';

interface ProductTableActionsProps {
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onViewStock: (product: Product) => void;
}

export const getProductTableColumns = ({
    onEdit,
    onDelete,
    onViewStock,
}: ProductTableActionsProps): TableColumn<Product>[] => [
        {
            name: 'Product',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {row.sku && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                SKU: {row.sku}
                            </span>
                        )}
                        {row.primaryBarcode && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Barcode className="w-3 h-3" />
                                {row.primaryBarcode}
                            </span>
                        )}
                    </div>
                </div>
            ),
            sortable: true,
            grow: 2,
            minWidth: '250px',
        },
        {
            name: 'Category',
            cell: (row) => (
                <div className="py-2">
                    {row.categoryDetails?.name ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{row.categoryDetails.name}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">Uncategorized</span>
                    )}
                </div>
            ),
            sortable: true,
            minWidth: '160px',
        },
        {
            name: 'Price & Unit',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'MWK',
                        }).format(row.sellingPrice)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        per {row.unit}
                    </div>
                </div>
            ),
            sortable: true,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Inventory',
            cell: (row) => {
                const stock = row.inventory?.availableQuantity || 0;
                const reorderPoint = row.inventory?.reorderPoint || 0;
                const isLowStock = reorderPoint > 0 && stock <= reorderPoint;
                const isOutOfStock = stock === 0;

                return (
                    <div className="py-2">
                        <div className={`flex items-center gap-1.5 font-medium ${isOutOfStock
                                ? 'text-red-600 dark:text-red-400'
                                : isLowStock
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-green-600 dark:text-green-400'
                            }`}>
                            <Package className="w-4 h-4" />
                            <span>{stock}</span>
                        </div>
                        {isLowStock && !isOutOfStock && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Low stock</span>
                            </div>
                        )}
                        {row.inventory?.reservedQuantity ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Reserved: {row.inventory.reservedQuantity}
                            </div>
                        ) : null}
                    </div>
                );
            },
            sortable: true,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Status',
            cell: (row) => {
                const statusConfig = {
                    ACTIVE: {
                        label: 'Active',
                        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                        dotColor: 'bg-green-500',
                    },
                    INACTIVE: {
                        label: 'Inactive',
                        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                        dotColor: 'bg-gray-500',
                    },
                    DISCONTINUED: {
                        label: 'Discontinued',
                        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                        dotColor: 'bg-red-500',
                    },
                    OUT_OF_STOCK: {
                        label: 'Out of Stock',
                        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                        dotColor: 'bg-orange-500',
                    },
                };

                const config = statusConfig[row.status] || statusConfig.ACTIVE;

                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotColor}`}></span>
                        {config.label}
                    </span>
                );
            },
            sortable: true,
            minWidth: '140px',
        },
        {
            name: 'Created',
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(row.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}</span>
                </div>
            ),
            sortable: true,
            width: '140px',
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewStock(row)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="View Stock History"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit product"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(row.productId)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete product"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
            right: true,
            width: '140px',
        },
    ];
