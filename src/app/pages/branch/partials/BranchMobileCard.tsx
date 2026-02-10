import { FC } from 'react';
import { Edit2, Trash2, Phone, Mail, MapPin, Store, Building2 } from 'lucide-react';

interface BranchMobileCardProps {
    branch: Branch;
    onEdit: (branch: Branch) => void;
    onStatusToggle: (branchId: string, status: string) => void;
    onDelete: (branchId: string, branchName: string) => void;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'suspended':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const BranchMobileCard: FC<BranchMobileCardProps> = ({
    branch,
    onEdit,
    onStatusToggle,
    onDelete,
}) => {
    const isDefaultBranch = branch.branchId === '-1';
    const statusColorClass = getStatusColor(branch.status);

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
                {/* Branch Icon/Logo */}
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600 flex-shrink-0">
                    {branch.logoUrl ? (
                        <img
                            src={branch.logoUrl}
                            alt={'...'}
                            className="w-12 h-12 rounded-full object-cover text-center"
                        />
                    ) : (
                        <Store className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    )}
                </div>

                {/* Branch Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {branch.branchName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {branch.branchCode}
                            </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClass} flex-shrink-0`}>
                            {branch.status}
                        </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mt-2">
                        {branch.addressLine1 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">
                                    {branch.addressLine1}
                                    {branch.city && `, ${branch.city}`}
                                </span>
                            </div>
                        )}
                        {branch.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{branch.phoneNumber}</span>
                            </div>
                        )}
                        {branch.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{branch.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{branch.currencySymbol} ({branch.currencyCode}) • Tax: {branch.taxRate}%</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => onEdit(branch)}
                            disabled={isDefaultBranch}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDefaultBranch
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20'
                                }`}
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => onStatusToggle(branch.branchId, branch.status)}
                            disabled={isDefaultBranch}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDefaultBranch
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : branch.status === 'active'
                                    ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                    : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}
                        >
                            <span>{branch.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <button
                            onClick={() => onDelete(branch.branchId, branch.branchName)}
                            disabled={isDefaultBranch}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ml-auto ${isDefaultBranch
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BranchMobileListProps {
    branches: Branch[];
    onEdit: (branch: Branch) => void;
    onStatusToggle: (branchId: string, status: string) => void;
    onDelete: (branchId: string, branchName: string) => void;
    isLoading?: boolean;
}

export const BranchMobileList: FC<BranchMobileListProps> = ({
    branches,
    onEdit,
    onStatusToggle,
    onDelete,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
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
            {branches.map((branch) => (
                <BranchMobileCard
                    key={branch.branchId}
                    branch={branch}
                    onEdit={onEdit}
                    onStatusToggle={onStatusToggle}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default BranchMobileCard;
