import { FC } from 'react';
import { Edit2, Trash2, Phone, Mail, MapPin, User, Building2 } from 'lucide-react';

interface SupplierMobileCardProps {
    supplier: Supplier;
    onEdit: (supplierId: string) => void;
    onDelete: (supplierId: string) => void;
}

const SupplierMobileCard: FC<SupplierMobileCardProps> = ({
    supplier,
    onEdit,
    onDelete,
}) => {
    const isActive = supplier.isActive;
    const statusColorClass = isActive
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
                {/* Supplier Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {supplier.name}
                            </h3>
                            {supplier.code && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Code: {supplier.code}
                                </p>
                            )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClass} flex-shrink-0 flex items-center gap-1`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mt-2">
                        {supplier.contactPerson && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{supplier.contactPerson}</span>
                            </div>
                        )}
                        {supplier.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{supplier.phone}</span>
                            </div>
                        )}
                        {supplier.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{supplier.email}</span>
                            </div>
                        )}
                        {supplier.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{supplier.address}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => onEdit(supplier.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => onDelete(supplier.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SupplierMobileListProps {
    suppliers: Supplier[];
    onEdit: (supplierId: string) => void;
    onDelete: (supplierId: string) => void;
    isLoading?: boolean;
}

export const SupplierMobileList: FC<SupplierMobileListProps> = ({
    suppliers,
    onEdit,
    onDelete,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {suppliers.map((supplier) => (
                <SupplierMobileCard
                    key={supplier.id}
                    supplier={supplier}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default SupplierMobileCard;
