import { TableColumn } from 'react-data-table-component';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerColumnsProps {
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string, customerName: string) => void;
}

export const getCustomerColumns = ({
    onEdit,
    onDelete,
}: CustomerColumnsProps): TableColumn<Customer>[] => [
        {
            name: 'Customer',
            selector: (row) => row.name,
            sortable: true,
            grow: 2,
            cell: (row) => (
                <div className="flex items-center gap-3 py-3">
                    <div className="flex-shrink-0 w-11 h-11 rounded bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {row.name}
                        </div>
                        {row.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] lg:max-w-xs">
                                {row.email}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            name: 'Phone',
            selector: (row) => row.phone || '-',
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.phone ? (
                        <>
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">{row.phone}</span>
                        </>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                </div>
            ),
        },
        {
            name: 'Email',
            selector: (row) => row.email || '-',
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.email ? (
                        <>
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{row.email}</span>
                        </>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                </div>
            ),
        },
        {
            name: 'Address',
            selector: (row) => row.address || '-',
            sortable: true,
            grow: 1,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.address ? (
                        <>
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{row.address}</span>
                        </>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                </div>
            ),
        },
        {
            name: 'Actions',
            center: true,
            width: '120px',
            cell: (row) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all"
                        title="Edit customer"
                    >
                        <HiOutlinePencil className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => onDelete(row.customerId, row.name)}
                        className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete customer"
                    >
                        <HiOutlineTrash className="w-4.5 h-4.5" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

// Mobile-optimized columns
export const getMobileCustomerColumns = ({
    onEdit,
    onDelete,
}: CustomerColumnsProps): TableColumn<Customer>[] => [
        {
            name: 'Customer',
            selector: (row) => row.name,
            sortable: true,
            grow: 2,
            cell: (row) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-sky-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {row.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                            {row.phone && (
                                <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {row.phone}
                                </span>
                            )}
                            {row.email && (
                                <>
                                    {row.phone && <span>•</span>}
                                    <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        {row.email}
                                    </span>
                                </>
                            )}
                            {!row.phone && !row.email && (
                                <span className="text-gray-400">No contact info</span>
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
            cell: (row) => (
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(row.customerId, row.name)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];
