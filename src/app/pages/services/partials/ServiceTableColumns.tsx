import { Pencil, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import type { TableColumn } from 'react-data-table-component';

interface ColumnCallbacks {
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
    onToggleStatus?: (service: Service) => void;
}

const PRICING_COLORS: Record<string, string> = {
    FIXED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    HOURLY: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PER_UNIT: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    PACKAGE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    FLAT_RATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    VARIABLE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    TIERED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    SUBSCRIPTION: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    CUSTOM: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const PRICING_LABELS: Record<string, string> = {
    FIXED: 'Fixed',
    HOURLY: 'Hourly',
    PER_UNIT: 'Per Unit',
    PACKAGE: 'Package',
    FLAT_RATE: 'Flat Rate',
    VARIABLE: 'Variable',
    TIERED: 'Tiered',
    SUBSCRIPTION: 'Subscription',
    CUSTOM: 'Custom',
};

export const getServiceTableColumns = ({ onEdit, onDelete, onToggleStatus }: ColumnCallbacks): TableColumn<Service>[] => [
    {
        name: 'Service',
        selector: (row) => row.name,
        sortable: true,
        grow: 2,
        cell: (row) => (
            <div className="py-2.5">
                <p className="font-medium text-gray-900 dark:text-gray-100">{row.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {row.sku && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{row.sku}</span>
                    )}
                    {row.description && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                            {row.description}
                        </span>
                    )}
                </div>
            </div>
        ),
    },
    {
        name: 'Category',
        selector: (row) => row.category?.name || '—',
        sortable: true,
        cell: (row) =>
            row.category ? (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {row.category.name}
                </span>
            ) : (
                <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
    },
    {
        name: 'Pricing',
        selector: (row) => row.pricingType,
        sortable: true,
        cell: (row) => (
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${PRICING_COLORS[row.pricingType] || PRICING_COLORS.CUSTOM}`}>
                {PRICING_LABELS[row.pricingType] || row.pricingType}
            </span>
        ),
    },
    {
        name: 'Price',
        selector: (row) => row.basePrice ?? 0,
        sortable: true,
        right: true,
        cell: (row) => (
            <div className="text-right">
                {row.basePrice != null ? (
                    <>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            MK {Number(row.basePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {row.pricingType === 'HOURLY' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">/hr</span>
                        )}
                        {row.pricingType === 'PER_UNIT' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">/unit</span>
                        )}
                    </>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-xs italic">No price</span>
                )}
            </div>
        ),
    },
    {
        name: 'Duration',
        selector: (row) => row.durationMin ?? 0,
        sortable: true,
        cell: (row) =>
            row.durationMin ? (
                <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {row.durationMin >= 60
                        ? `${Math.floor(row.durationMin / 60)}h ${row.durationMin % 60 ? `${row.durationMin % 60}m` : ''}`
                        : `${row.durationMin}m`}
                </span>
            ) : (
                <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
    },
    {
        name: 'Status',
        selector: (row) => (row.isActive ? 'Active' : 'Inactive'),
        sortable: true,
        width: '100px',
        cell: (row) => (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${row.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                {row.isActive ? 'Active' : 'Inactive'}
            </span>
        ),
    },
    {
        name: 'Actions',
        width: '130px',
        right: true,
        cell: (row) => (
            <div className="flex items-center gap-0.5">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                    className="p-1.5 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    title="Edit service"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                {onToggleStatus && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleStatus(row); }}
                        className={`p-1.5 rounded-lg transition-colors text-gray-500 dark:text-gray-400 ${row.isActive
                                ? 'hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                : 'hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                        title={row.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {row.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                    className="p-1.5 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete service"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ),
        ignoreRowClick: true,
    },
];
