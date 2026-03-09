import { Fragment } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Store, MapPin, Phone, Mail, Edit2, Trash2, Eye, Briefcase, Clock } from 'lucide-react';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';
import { BranchPermissions } from '../../../hooks/useBranchPermissions';

const getMraStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'APPROVED':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        case 'REJECTED':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
        case 'PENDING':
        default:
            return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
    }
};

const formatBusinessType = (type: string | null) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
        case 'inactive':
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        case 'pending':
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
        case 'suspended':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
};

interface BranchActionsProps {
    branch: Branch;
    onEdit: (branch: Branch) => void;
    onStatusToggle: (branchId: string, status: string) => void;
    onDelete: (branchId: string, branchName: string) => void;
    permissions: BranchPermissions;
}

export const BranchActions: React.FC<BranchActionsProps> = ({
    branch,
    onEdit,
    onStatusToggle,
    onDelete,
    permissions,
}) => {
    const canEdit = permissions.canEditBranch(branch.branchId);
    const canDelete = permissions.canDeleteBranch(branch.branchId);
    const canToggleStatus = permissions.canToggleStatus(branch.branchId);

    return (
        <div className="flex items-center space-x-1">
            {canEdit ? (
                <button
                    onClick={() => onEdit(branch)}
                    className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    title="Edit branch"
                >
                    <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                </button>
            ) : (
                <button
                    onClick={() => onEdit(branch)}
                    className="group p-2 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    title="View branch"
                >
                    <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
                </button>
            )}

            {canToggleStatus && (
                <button
                    onClick={() => onStatusToggle(branch.branchId, branch.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${branch.status === 'active'
                            ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-400'
                            : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 focus:ring-green-500 dark:focus:ring-green-400'
                        }`}
                    title={branch.status === 'active' ? 'Deactivate branch' : 'Activate branch'}
                >
                    {branch.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            )}

            {canDelete && (
                <button
                    onClick={() => onDelete(branch.branchId, branch.branchName)}
                    className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    title="Delete branch"
                >
                    <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                </button>
            )}
        </div>
    );
};

export const getBranchColumns = (
    onEdit: (branch: Branch) => void,
    onStatusToggle: (branchId: string, status: string) => void,
    onDelete: (branchId: string, branchName: string) => void,
    permissions: BranchPermissions
): TableColumn<Branch>[] => [
        {
            name: "Branch",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                            {row.logoUrl ? (
                                <img
                                    src={row.logoUrl}
                                    alt={'...'}
                                    className="w-10 h-10 rounded-full object-cover text-center"
                                />
                            ) : (
                                <Store className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {row.branchName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {row.branchCode}
                            </div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Location',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm space-y-1">
                        {row.location ? (
                            <div className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                                <MapPin className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate">{row.location}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">Not set</span>
                        )}
                        {row.businessType && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Briefcase className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-xs">{formatBusinessType(row.businessType)}</span>
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Contact',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm space-y-1">
                        {row.phoneNumber ? (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Phone className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span>{row.phoneNumber}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic">No phone</span>
                        )}
                        {row.email ? (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Mail className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate max-w-[150px]">{row.email}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic">No email</span>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <div className="space-y-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'active'
                                ? 'bg-green-400 dark:bg-green-300'
                                : 'bg-gray-400 dark:bg-gray-500'
                                }`} />
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getMraStatusColor(row.mraApprovalStatus)}`}>
                                MRA: {row.mraApprovalStatus || 'Pending'}
                            </span>
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            width: "20%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500 dark:text-gray-400' />,
            cell: (row) => (
                <BranchActions
                    branch={row}
                    onEdit={onEdit}
                    onStatusToggle={onStatusToggle}
                    onDelete={onDelete}
                    permissions={permissions}
                />
            )
        }
    ];
