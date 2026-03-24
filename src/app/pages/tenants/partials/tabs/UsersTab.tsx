import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Fragment, FunctionComponent, memo, useContext } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import { User, Mail, Phone, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';

interface UsersTabProps {
    users: User[];
    loading: boolean;
    tenantId?: string;
    onRefresh?: () => void;
}

const getUserStatusColor = (status: UserStatus | undefined): string => {
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

const getStatusIcon = (status: UserStatus | undefined) => {
    switch (status) {
        case 'active':
            return <CheckCircle className="w-3.5 h-3.5" />;
        case 'suspended':
            return <XCircle className="w-3.5 h-3.5" />;
        default:
            return <Clock className="w-3.5 h-3.5" />;
    }
};

const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getUserColumns = (): TableColumn<User>[] => [
    {
        name: 'User',
        cell: (row) => (
            <div className="flex items-center py-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-purple-500" />
                </div>
                <div className="ml-3 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {row.fullname}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{row.username}
                    </div>
                </div>
            </div>
        ),
        minWidth: '200px',
        sortable: true,
        sortField: 'fullname',
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
                {row.phone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span>{row.phone}</span>
                    </div>
                )}
            </div>
        ),
        minWidth: '180px',
    },
    {
        name: 'Role',
        cell: (row) => (
            <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.roleName || 'No role assigned'}
                </span>
            </div>
        ),
        minWidth: '150px',
    },
    {
        name: 'Branch',
        cell: (row) => (
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {row.branch?.branchName || '-'}
            </div>
        ),
        minWidth: '120px',
    },
    {
        name: 'Last Login',
        cell: (row) => (
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(row.lastLogin)}
            </div>
        ),
        minWidth: '140px',
    },
    {
        name: 'Status',
        cell: (row) => (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserStatusColor(row.status)}`}>
                {getStatusIcon(row.status)}
                {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
            </span>
        ),
        width: '110px',
        center: true,
    },
];

const UsersTab: FunctionComponent<UsersTabProps> = memo(({ users, loading, tenantId, onRefresh }) => {
    const { mode } = useContext(ZonseThemeContext);

    if (loading) {
        return <TableSkeleton rows={5} columns={5} showCheckbox={false} showActions={false} />;
    }

    return (
        <Fragment>
            <DataTable
                columns={getUserColumns()}
                data={users}
                theme={mode as string}
                highlightOnHover
                striped
                responsive
                noDataComponent={
                    <div className="text-center py-12">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No users found for this tenant</p>
                    </div>
                }
                customStyles={getTableStyles(mode)}
            />
        </Fragment>
    );
});

UsersTab.displayName = 'UsersTab';

export default UsersTab;
