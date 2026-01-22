import React from 'react';
import { Edit2, Trash2, Key, Lock, LockOpen, Mail, Phone, Shield } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';
import usersService from '../../../services/users.service';

interface UserTableColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
    onToggleStatus: (userId: string, status: UserStatus) => void;
}

// Generate initials from fullname
const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const getStatusColorClass = (status: UserStatus) => {
    const statusInfo = usersService.getStatusColor(status);
    return statusInfo === 'green'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : statusInfo === 'red'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : statusInfo === 'yellow'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

export const getUserTableColumns = ({
    onEdit,
    onDelete,
    onResetPassword,
    onToggleStatus,
}: UserTableColumnsProps): TableColumn<User>[] => [
        {
            name: 'User',
            cell: (row: User) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {getInitials(row.fullname || row.username || '')}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {row.fullname || '-'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{row.username}
                        </p>
                    </div>
                </div>
            ),
            sortable: true,
            minWidth: '200px',
        },
        {
            name: 'Contact',
            cell: (row: User) => (
                <div className="space-y-1">
                    {row.email && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[180px]">{row.email}</span>
                        </div>
                    )}
                    {row.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{row.phone}</span>
                        </div>
                    )}
                    {!row.email && !row.phone && (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                </div>
            ),
            minWidth: '200px',
        },
        {
            name: 'Role',
            cell: (row: User) => (
                <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {row.roleName || row.roleId || '-'}
                    </span>
                </div>
            ),
            sortable: true,
            minWidth: '140px',
        },
        {
            name: 'Status',
            cell: (row: User) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColorClass(row.status)}`}>
                    {row.status || 'unknown'}
                </span>
            ),
            sortable: true,
            width: '120px',
        },
        {
            name: 'Actions',
            cell: (row: User) => {
                const userId = String(row.userId);

                return (
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => onEdit(row)}
                            className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
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
            width: '180px',
            ignoreRowClick: true,
        },
    ];
