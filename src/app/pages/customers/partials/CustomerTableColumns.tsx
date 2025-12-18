import { TableColumn } from 'react-data-table-component';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

interface CustomerColumnsProps {
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string, customerName: string) => void;
}

export const getCustomerColumns = ({
    onEdit,
    onDelete,
}: CustomerColumnsProps): TableColumn<Customer>[] => [
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <div className="py-2">
                    <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                </div>
            ),
        },
        {
            name: 'Phone',
            selector: (row) => row.phone || '-',
            sortable: true,
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {row.phone || '-'}
                </span>
            ),
        },
        {
            name: 'Email',
            selector: (row) => row.email || '-',
            sortable: true,
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {row.email || '-'}
                </span>
            ),
        },
        {
            name: 'Address',
            selector: (row) => row.address || '-',
            sortable: true,
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">
                    {row.address || '-'}
                </span>
            ),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit customer"
                    >
                        <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(row.customerId, row.name)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete customer"
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
