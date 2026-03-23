import { FunctionComponent, memo, useContext } from 'react';
import { ZonseThemeContext } from '../../../components';
import { getTableStyles } from '../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import { Building2, MapPin, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BranchesTabProps {
    branches: Branch[];
    loading: boolean;
}

const getBranchStatusColor = (status: BranchStatus | undefined): string => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
        case 'suspended':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
    }
};

const getMraStatusIcon = (status: MraApprovalStatus | undefined) => {
    switch (status) {
        case 'APPROVED':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'REJECTED':
            return <XCircle className="w-4 h-4 text-red-500" />;
        case 'PENDING':
        default:
            return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
};

const getBranchColumns = (): TableColumn<Branch>[] => [
    {
        name: 'Branch',
        cell: (row) => (
            <div className="flex items-center py-2">
                <div className="ml-3 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {row.branchName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {row.branchCode}
                    </div>
                </div>
            </div>
        ),
        sortable: true,
        sortField: 'branchName',
    },
    {
        name: 'Contact',
        cell: (row) => (
            <div className="py-2">
                {row.email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Mail className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{row.email}</span>
                    </div>
                )}
                {row.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span>{row.phoneNumber}</span>
                    </div>
                )}
            </div>
        ),
    },
    {
        name: 'Location',
        cell: (row) => (
            <div className="py-2">
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        {row.city && <span className="block truncate">{row.city}</span>}
                        {row.addressLine1 && (
                            <span className="block text-xs text-gray-500 dark:text-gray-500 truncate">
                                {row.addressLine1}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        ),
    },
    {
        name: 'Currency',
        cell: (row) => (
            <div className="text-sm text-gray-700 dark:text-gray-300">
                {row.currencySymbol} ({row.currencyCode})
            </div>
        ),
        center: true,
    },
    {
        name: 'MRA Status',
        cell: (row) => (
            <div className="flex items-center gap-1.5">
                {getMraStatusIcon(row.mraApprovalStatus)}
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {row.mraApprovalStatus?.toLowerCase() || 'pending'}
                </span>
            </div>
        ),
        center: true,
    },
    {
        name: 'Status',
        cell: (row) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBranchStatusColor(row.status)}`}>
                {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
            </span>
        ),
        width: '100px',
        center: true,
    },
];

const AccountBranchesTab: FunctionComponent<BranchesTabProps> = memo(({ branches, loading }) => {
    const { mode } = useContext(ZonseThemeContext);

    if (loading) {
        return <TableSkeleton rows={5} columns={5} showCheckbox={false} showActions={false} />;
    }

    return (
        <DataTable
            columns={getBranchColumns()}
            data={branches}
            theme={mode as string}
            highlightOnHover
            striped
            responsive
            noDataComponent={
                <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No branches found</p>
                </div>
            }
            customStyles={getTableStyles(mode)}
        />
    );
});

AccountBranchesTab.displayName = 'AccountBranchesTab';

export default AccountBranchesTab;
