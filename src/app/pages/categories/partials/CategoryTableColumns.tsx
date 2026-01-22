import { TableColumn } from 'react-data-table-component';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Edit2, Trash2, Package } from 'lucide-react';

export const getCategoryColumns = (
    onEdit: (category: Category) => void,
    onDelete: (categoryId: string, categoryName: string) => void
): TableColumn<Category>[] => {
    return [
        {
            name: 'Category',
            selector: (row: Category) => row.name,
            sortable: true,
            grow: 2,
            cell: (row: Category) => (
                <div className="flex items-center gap-3 py-3">
                    <div
                        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{
                            backgroundColor: row.color || '#3B82F6',
                        }}
                    >
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {row.name}
                        </div>
                        {row.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] lg:max-w-xs">
                                {row.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            name: 'Products',
            selector: (row: Category) => row.itemCount || 0,
            sortable: true,
            center: true,
            width: '140px',
            cell: (row: Category) => (
                <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${(row.itemCount || 0) > 0
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        <Package className="w-3.5 h-3.5" />
                        {row.itemCount || 0}
                    </span>
                </div>
            ),
        },
        {
            name: 'Created',
            selector: (row: Category) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
            sortable: true,
            width: '150px',
            cell: (row: Category) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {row.createdAt
                        ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
                        : '—'}
                </div>
            ),
        },
        {
            name: 'Updated',
            selector: (row: Category) => row.updatedAt ? new Date(row.updatedAt).getTime() : 0,
            sortable: true,
            width: '150px',
            cell: (row: Category) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {row.updatedAt
                        ? formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })
                        : '—'}
                </div>
            ),
        },
        {
            name: 'Actions',
            center: true,
            width: '120px',
            cell: (row: Category) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all"
                        title="Edit category"
                    >
                        <HiOutlinePencil className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => onDelete(row.categoryId, row.name)}
                        className={`p-2 rounded-lg transition-all ${row.itemCount > 0
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                        title={row.itemCount > 0 ? "Can't delete category with products" : "Delete category"}
                        disabled={row.itemCount > 0}
                    >
                        <HiOutlineTrash className="w-4.5 h-4.5" />
                    </button>
                </div>
            ),
        },
    ];
};

// Mobile-optimized columns
export const getMobileCategoryColumns = (
    onEdit: (category: Category) => void,
    onDelete: (categoryId: string, categoryName: string) => void
): TableColumn<Category>[] => {
    return [
        {
            name: 'Category',
            selector: (row: Category) => row.name,
            sortable: true,
            grow: 2,
            cell: (row: Category) => (
                <div className="flex items-center gap-3 py-2">
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: row.color || '#3B82F6' }}
                    >
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {row.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {row.itemCount || 0}
                            </span>
                            {row.updatedAt && (
                                <>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            name: '',
            width: '80px',
            right: true,
            cell: (row: Category) => (
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(row.categoryId, row.name)}
                        className={`p-2 rounded-lg transition-colors ${row.itemCount > 0
                            ? 'text-gray-300 dark:text-gray-600'
                            : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                        disabled={row.itemCount > 0}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];
};
