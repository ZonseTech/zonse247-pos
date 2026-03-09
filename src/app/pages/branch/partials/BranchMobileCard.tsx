import { FC } from 'react';
import { Edit2, Trash2, Phone, Mail, MapPin, Store, Briefcase, Eye, Clock } from 'lucide-react';
import { BranchPermissions } from '../../../hooks/useBranchPermissions';

interface BranchMobileCardProps {
    branch: Branch;
    onEdit: (branch: Branch) => void;
    onStatusToggle: (branchId: string, status: string) => void;
    onDelete: (branchId: string, branchName: string) => void;
    permissions: BranchPermissions;
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

const getMraStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'APPROVED':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'REJECTED':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'PENDING':
        default:
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
};

const formatBusinessType = (type: string | null) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const BranchMobileCard: FC<BranchMobileCardProps> = ({
    branch,
    onEdit,
    onStatusToggle,
    onDelete,
    permissions,
}) => {
    const canEdit = permissions.canEditBranch(branch.branchId);
    const canDelete = permissions.canDeleteBranch(branch.branchId);
    const canToggleStatus = permissions.canToggleStatus(branch.branchId);
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

                    {/* Branch Details */}
                    <div className="space-y-1.5 mt-2">
                        {/* Location & Business Type */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">
                                {branch.location || 'Location not set'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{formatBusinessType(branch.businessType)}</span>
                        </div>
                        
                        {/* Contact Info */}
                        {branch.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                <span>{branch.phoneNumber}</span>
                            </div>
                        )}
                        {branch.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                <span className="truncate">{branch.email}</span>
                            </div>
                        )}
                        
                        {/* MRA Status */}
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMraStatusColor(branch.mraApprovalStatus)}`}>
                                MRA: {branch.mraApprovalStatus || 'Pending'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {canEdit ? (
                            <button
                                onClick={() => onEdit(branch)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => onEdit(branch)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                            >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                            </button>
                        )}

                        {canToggleStatus && (
                            <button
                                onClick={() => onStatusToggle(branch.branchId, branch.status)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${branch.status === 'active'
                                    ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                    : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    }`}
                            >
                                <span>{branch.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                        )}

                        {canDelete && (
                            <button
                                onClick={() => onDelete(branch.branchId, branch.branchName)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ml-auto text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
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
    permissions: BranchPermissions;
}

export const BranchMobileList: FC<BranchMobileListProps> = ({
    branches,
    onEdit,
    onStatusToggle,
    onDelete,
    isLoading = false,
    permissions,
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
                    permissions={permissions}
                />
            ))}
        </div>
    );
};

export default BranchMobileCard;
