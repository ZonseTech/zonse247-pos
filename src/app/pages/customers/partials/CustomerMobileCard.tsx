import { FC } from 'react';
import { Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react';

interface CustomerMobileCardProps {
    customer: Customer;
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string, customerName: string) => void;
}

const CustomerMobileCard: FC<CustomerMobileCardProps> = ({ customer, onEdit, onDelete }) => (
    <div className="flex items-center gap-3 px-3.5 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/60 active:bg-gray-50 dark:active:bg-gray-700/40 transition-colors">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold shadow-sm">
            {customer.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {customer.name}
                {customer.isDefault && (
                    <span className="ml-1.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded-full">
                        Default
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                {customer.phone && (
                    <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                    </span>
                )}
                {customer.email && (
                    <>
                        {customer.phone && <span className="text-gray-300 dark:text-gray-600">·</span>}
                        <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            {customer.email}
                        </span>
                    </>
                )}
                {customer.address && !customer.email && !customer.phone && (
                    <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {customer.address}
                    </span>
                )}
                {!customer.phone && !customer.email && !customer.address && (
                    <span className="text-gray-400">No contact info</span>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
                onClick={() => onEdit(customer)}
                className="p-2 text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                aria-label="Edit customer"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => onDelete(customer.customerId, customer.name)}
                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label="Delete customer"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

export const CustomerMobileCardSkeleton: FC = () => (
    <div className="flex items-center gap-3 px-3.5 py-3 animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-48" />
        </div>
        <div className="flex gap-1 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700/40 rounded-lg" />
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700/40 rounded-lg" />
        </div>
    </div>
);

export default CustomerMobileCard;
