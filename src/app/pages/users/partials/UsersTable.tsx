import { Fragment, useContext } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, Shield, User2, Phone, Mail, Key, Clock, Users } from 'lucide-react';
import { getRoleColor, getStatusColor, getStatusIcon, getStatusActionText, getStatusActionTitle } from '../../../utils/user-utils';
import { ZonseThemeContext } from '../../../components';
import { UserStatus } from '../../../utils/constants';
import { getTableStyles } from '../../../utils/table-styles';

interface UsersTableProps {
    data: User[];
    isLoading: boolean;
    totalRows: number;
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerRowsChange: (perPage: number, page: number) => void;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onResetPassword: (user: User) => void;
    onToggleStatus: (user: User) => void;
    onDelete: (userId: string, username: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
    data,
    isLoading,
    totalRows,
    page,
    perPage,
    onPageChange,
    onPerRowsChange,
    onView,
    onEdit,
    onResetPassword,
    onToggleStatus,
    onDelete
}) => {
    const { mode } = useContext(ZonseThemeContext);

    const columns: Array<TableColumn<User>> = [
        {
            name: "User",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {row?.fullname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">@{row?.username}</div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Contact',
            cell: (row) => (
                <Fragment>
                    <div>
                        {row?.email && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {row?.email}
                            </div>
                        )}
                        {row?.phone && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {row?.phone}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Role',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(row?.roleUuid)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {(row?.roleName || 'Unknown')}
                    </span>
                </Fragment>
            )
        },
        {
            name: 'Last Activity',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm">
                        {row?.lastLogin && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="text-xs">
                                    {new Date(row.lastLogin).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {!row?.lastLogin && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Never logged in</span>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status as UserStatus)}`}>
                        {getStatusIcon(row?.status as UserStatus)}
                        {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            name: <div className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <button
                            onClick={() => onView(row)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                            title="View details"
                        >
                            <User2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => onEdit(row)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                            title="Edit user"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => onResetPassword(row)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                }`}
                            title="Reset password"
                        >
                            <Key className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => onToggleStatus(row)}
                            disabled={row?.uuid === '-1'}
                            className={`text-xs px-2 py-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-800'
                                : row?.status === UserStatus.ACTIVE
                                    ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border dark:border-red-800/50'
                                    : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border dark:border-green-800/50'
                                }`}
                            title={getStatusActionTitle(row?.status as UserStatus)}
                        >
                            {getStatusActionText(row?.status as UserStatus)}
                        </button>

                        <button
                            onClick={() => onDelete(row?.uuid, row?.username)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                            title="Delete user"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </Fragment>
            )
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            theme={mode as string}
            progressPending={isLoading}
            highlightOnHover
            striped
            responsive
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={onPerRowsChange}
            onChangePage={onPageChange}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 250px)"
            customStyles={getTableStyles(mode)}
            noDataComponent={
                <div className="text-center py-8 bg-white dark:bg-gray-800">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No users found.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Click "Add User" to create your first user.
                    </p>
                </div>
            }
        />
    );
};

export default UsersTable;