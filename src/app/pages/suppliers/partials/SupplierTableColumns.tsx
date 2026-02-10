import { TableColumn } from 'react-data-table-component';
import { Pencil, Trash2, Phone, Mail, MapPin, User, Calendar } from 'lucide-react';

interface SupplierTableActionsProps {
    onEdit: (supplierId: string) => void;
    onDelete: (supplierId: string) => void;
}

export const getSupplierTableColumns = ({
    onEdit,
    onDelete,
}: SupplierTableActionsProps): TableColumn<Supplier>[] => [
        {
            name: 'Supplier Name',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.name}
                    </div>
                    {row.code && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Code: {row.code}
                        </div>
                    )}
                </div>
            ),
            sortable: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'Contact Details',
            cell: (row) => (
                <div className="py-2 space-y-1">
                    {row.contactPerson && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{row.contactPerson}</span>
                        </div>
                    )}
                    {row.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{row.phone}</span>
                        </div>
                    )}
                    {row.email && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[200px]" title={row.email}>
                                {row.email}
                            </span>
                        </div>
                    )}
                    {!row.contactPerson && !row.phone && !row.email && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">No contact info</span>
                    )}
                </div>
            ),
            grow: 2,
            minWidth: '250px',
        },
        {
            name: 'Address',
            cell: (row) => (
                <div className="py-2">
                    {row.address ? (
                        <div className="flex items-start gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                            <span className="line-clamp-2">{row.address}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">-</span>
                    )}
                </div>
            ),
            grow: 1,
            minWidth: '180px',
        },
        {
            name: 'Status',
            cell: (row) => {
                const isActive = row.isActive;
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-gray-500'
                            }`}></span>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
            sortable: true,
            width: '120px',
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
                        onClick={() => onEdit(row.id)}
                        className="p-2 text-sky-500 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                        title="Edit supplier"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(row.id)}
                        className="p-2 text-red-500 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete supplier"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
            right: true,
            width: '120px',
        },
    ];
