import React from 'react';
import { Edit2, Trash2, Key, Lock, LockOpen } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';
import usersService from '../../../services/users.service';

interface UserTableColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
    onToggleStatus: (userId: string, status: UserStatus) => void;
}

export const getUserTableColumns = ({
    onEdit,
    onDelete,
    onResetPassword,
    onToggleStatus,
}: UserTableColumnsProps): TableColumn<User>[] => [
        {
            name: 'Username',
            selector: (row: User) => row.username || '-',
            sortable: true,
            width: '150px',
        },
        {
            name: 'Full Name',
            selector: (row: User) => row.fullname || '-',
            sortable: true,
            width: '180px',
        },
        {
            name: 'Email',
            selector: (row: User) => row.email || '-',
            sortable: true,
            width: '200px',
        },
        {
            name: 'Phone',
            selector: (row: User) => row.phone || '-',
            sortable: true,
            width: '140px',
        },
        {
            name: 'Role',
            selector: (row: User) => row.roleName || row.roleId || '-',
            sortable: true,
            width: '140px',
        },
        {
            name: 'Status',
            cell: (row: User) => {
                const statusInfo = usersService.getStatusColor(row.status);
                const colorClass = statusInfo === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : statusInfo === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : statusInfo === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {row.status || 'unknown'}
                    </span>
                );
            },
            sortable: true,
            width: '120px',
        },
        {
            name: 'Actions',
            cell: (row: User) => {
                const userId = String(row.id || row.userId);
                return (
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => onEdit(row)}
                            className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit User"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onResetPassword(userId)}
                            className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            title="Reset Password"
                        >
                            <Key className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onToggleStatus(
                                userId,
                                row.status === 'active' ? 'inactive' : 'active'
                            )}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.status === 'active'
                                ? 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}
                            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                            {row.status === 'active' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onDelete(userId)}
                            className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete User"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
            width: '200px',
            ignoreRowClick: true,
        },
    ];
