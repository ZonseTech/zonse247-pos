import { TableColumn } from 'react-data-table-component';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

export const getCategoryColumns = (
    onEdit: (category: Category) => void,
    onDelete: (categoryId: string, categoryName: string) => void
): TableColumn<Category>[] => {
    return [
        {
            name: 'Category Name',
            selector: (row: Category) => row.name,
            sortable: true,
            grow: 2,
            cell: (row: Category) => (
                <div className="flex items-center space-x-3 py-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                            {row.name}
                        </div>
                        {row.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {row.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            name: 'Product Count',
            selector: (row: Category) => row.itemCount || 0,
            sortable: true,
            center: true,
            cell: (row: Category) => (
                <div className="flex items-center justify-center">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {row.itemCount || 0} {(row.itemCount || 0) === 1 ? 'product' : 'products'}
                    </span>
                </div>
            ),
        },
        {
            name: 'Created',
            selector: (row: Category) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
            sortable: true,
            cell: (row: Category) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {row.createdAt
                        ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
                        : 'N/A'}
                </div>
            ),
        },
        {
            name: 'Last Updated',
            selector: (row: Category) => row.updatedAt ? new Date(row.updatedAt).getTime() : 0,
            sortable: true,
            cell: (row: Category) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {row.updatedAt
                        ? formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })
                        : 'N/A'}
                </div>
            ),
        },
        {
            name: 'Actions',
            center: true,
            cell: (row: Category) => (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit category"
                    >
                        <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(row.categoryId, row.name)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete category"
                        disabled={row.itemCount > 0}
                    >
                        <HiOutlineTrash className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];
};
