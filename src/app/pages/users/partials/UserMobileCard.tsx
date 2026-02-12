import { FC } from 'react';
import { Clock, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import usersService from '../../../services/users.service';

interface UserMobileCardProps {
    user: User;
    onEdit: (user: User) => void;
}

const UserMobileCard: FC<UserMobileCardProps> = ({
    user,
    onEdit,
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

    // Format salary display
    const formatSalary = () => {
        if (!user.staffSalary) return null;
        const salaryNum = parseFloat(String(user.staffSalary));
        if (isNaN(salaryNum)) return null;
        const formatted = salaryNum.toLocaleString();
        const suffix = user.calculateAs === 'hourly' ? '/hr' : user.calculateAs === 'daily' ? '/day' : '/mo';
        return `K${formatted}${suffix}`;
    };

    return (
        <button
            onClick={() => onEdit(user)}
            className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 text-left active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0 shadow-sm">
                    {getInitials(user.fullname || user.username || '')}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {user.fullname || user.username || 'Unknown User'}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {(user.roleName || user.roleId) && (
                                    <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                                        {user.roleName || user.roleId}
                                    </span>
                                )}
                                {user.trackAttendance && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" />
                                        Tracked
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClass} flex-shrink-0`}>
                            {user.status || 'unknown'}
                        </span>
                    </div>

                    {/* Staff Details Row */}
                    {(user.staffSalary || user.joiningDate) && (
                        <div className="flex items-center gap-4 flex-wrap mt-1">
                            {formatSalary() && (
                                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{formatSalary()}</span>
                                </div>
                            )}
                            {user.joiningDate && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span>Joined {new Date(user.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
        </button>
    );
};

interface UserMobileListProps {
    users: User[];
    onEdit: (user: User) => void;
    isLoading?: boolean;
}

export const UserMobileList: FC<UserMobileListProps> = ({
    users,
    onEdit,
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
                />
            ))}
        </div>
    );
};

export default UserMobileCard;
