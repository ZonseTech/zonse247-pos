import { UserStatus } from './constants';

export const getRoleColor = (roleUuid: string) => {
    const roleMap: Record<string, string> = {
        'super_admin': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border dark:border-purple-800/50',
        'admin': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border dark:border-purple-800/50',
        'manager': 'text-sky-500 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 border dark:border-sky-800/50',
        'cashier': 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border dark:border-green-800/50',
    };
    return roleMap[roleUuid] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border dark:border-gray-700/50';
};

export const getStatusColor = (status?: UserStatus) => {
    switch (status) {
        case UserStatus.ACTIVE:
            return 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border dark:border-green-800/50';
        case UserStatus.SUSPENDED:
            return 'text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border dark:border-red-800/50';
        case UserStatus.INACTIVE:
            return 'text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/50 border dark:border-gray-700/50';
        default:
            return 'text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/50 border dark:border-gray-700/50';
    }
};

export const getStatusIcon = (status?: UserStatus) => {
    const iconClass = "w-3 h-3 mr-1";
    switch (status) {
        case UserStatus.ACTIVE:
            return <div className={`${iconClass} bg-green-500 dark:bg-green-400 rounded-full shadow-sm`} />;
        case UserStatus.SUSPENDED:
            return <div className={`${iconClass} bg-red-500 dark:bg-red-400 rounded-full shadow-sm`} />;
        case UserStatus.INACTIVE:
            return <div className={`${iconClass} bg-gray-500 dark:bg-gray-400 rounded-full shadow-sm`} />;
        default:
            return <div className={`${iconClass} bg-gray-500 dark:bg-gray-400 rounded-full shadow-sm`} />;
    }
};

export const getStatusActionText = (status?: UserStatus) => {
    switch (status) {
        case UserStatus.ACTIVE: return 'Suspend';
        case UserStatus.SUSPENDED: return 'Activate';
        case UserStatus.INACTIVE: return 'Activate';
        default: return 'Activate';
    }
};

export const getStatusActionTitle = (status?: UserStatus) => {
    switch (status) {
        case UserStatus.ACTIVE: return 'Suspend user';
        case UserStatus.SUSPENDED: return 'Activate user';
        case UserStatus.INACTIVE: return 'Activate user';
        default: return 'Activate user';
    }
};