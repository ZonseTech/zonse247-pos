import { FC } from 'react';
import { Edit2, Trash2, Key, Lock, LockOpen, User, Mail, Phone, Shield } from 'lucide-react';
import usersService from '../../../services/users.service';

interface UserMobileCardProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
    onToggleStatus: (userId: string, status: UserStatus) => void;
}

const UserMobileCard: FC<UserMobileCardProps> = ({
    user,
    onEdit,
    onDelete,
    onResetPassword,
    onToggleStatus,
}) => {
    const statusInfo = usersService.getStatusColor(user.status);
    const statusColorClass = statusInfo === 'green'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : statusInfo === 'red'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : statusInfo === 'yellow'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';

    const userId = String(user.userId);

    // Generate initials from fullname
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                {/* <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {getInitials(user.fullname || user.username || '')}
                </div> */}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {user.fullname || user.username || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClass} flex-shrink-0`}>
                            {user.status || 'unknown'}
                        </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mt-2">
                        {user.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                        )}
                        {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        {(user.roleName || user.roleId) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{user.roleName || user.roleId}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => onEdit(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => onResetPassword(userId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                            <Key className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                        <button
                            onClick={() => onToggleStatus(userId, user.status === 'active' ? 'inactive' : 'active')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${user.status === 'active'
                                ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}
                        >
                            {user.status === 'active' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                            <span>{user.status === 'active' ? 'Lock' : 'Unlock'}</span>
                        </button>
                        <button
                            onClick={() => onDelete(userId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface UserMobileListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
    onToggleStatus: (userId: string, status: UserStatus) => void;
    isLoading?: boolean;
}

export const UserMobileList: FC<UserMobileListProps> = ({
    users,
    onEdit,
    onDelete,
    onResetPassword,
    onToggleStatus,
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
                <UserMobileCard
                    key={user.userId}
                    user={user}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onResetPassword={onResetPassword}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
};

export default UserMobileCard;
