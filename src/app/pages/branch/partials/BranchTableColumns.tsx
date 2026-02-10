import { Fragment } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Store, MapPin, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';

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
}

export const BranchActions: React.FC<BranchActionsProps> = ({
    branch,
    onEdit,
    onStatusToggle,
    onDelete
}) => {
    const isDefaultBranch = branch.branchId === '-1';

    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={() => onEdit(branch)}
                disabled={isDefaultBranch}
                className={`group p-2 rounded-lg transition-all duration-200 ${isDefaultBranch
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                    }`}
                title="Edit branch"
            >
                <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            <button
                onClick={() => onStatusToggle(branch.branchId, branch.status)}
                disabled={isDefaultBranch}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isDefaultBranch
                    ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                    : branch.status === 'active'
                        ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-400'
                        : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 focus:ring-green-500 dark:focus:ring-green-400'
                    }`}
                title={branch.status === 'active' ? 'Deactivate branch' : 'Activate branch'}
            >
                {branch.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>

            <button
                onClick={() => onDelete(branch.branchId, branch.branchName)}
                disabled={isDefaultBranch}
                className={`group p-2 rounded-lg transition-all duration-200 ${isDefaultBranch
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                    }`}
                title="Delete branch"
            >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
        </div>
    );
};

export const getBranchColumns = (
    onEdit: (branch: Branch) => void,
    onStatusToggle: (branchId: string, status: string) => void,
    onDelete: (branchId: string, branchName: string) => void
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
            name: 'Contact',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm space-y-1">
                        {row.addressLine1 && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate">
                                    {row.addressLine1}
                                    {row.city && `, ${row.city}`}
                                </span>
                            </div>
                        )}
                        {row.phoneNumber && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Phone className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span>{row.phoneNumber}</span>
                            </div>
                        )}
                        {row.email && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Mail className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate">{row.email}</span>
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Currency & Tax',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm space-y-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            {row.currencySymbol} ({row.currencyCode})
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            Tax: {row.taxRate}%
                            <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${row.chargeTax
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                {row.chargeTax ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'active'
                            ? 'bg-green-400 dark:bg-green-300'
                            : 'bg-gray-400 dark:bg-gray-500'
                            }`} />
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
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
                />
            )
        }
    ];
