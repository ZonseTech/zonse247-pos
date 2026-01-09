import { FunctionComponent } from 'react';
import Card from '../../../components/card/Card';
import { BadgeCheckIcon } from 'lucide-react';

const formatRoleName = (role: string | null | undefined): string => {
    if (!role) return 'User';
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

type Props = {
    user: User | null;
};

const ProfileOverviewCard: FunctionComponent<Props> = ({ user }) => {
    return (
        <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user?.fullname || 'User'}
                        </h2>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${user?.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                        >
                            {user?.status?.charAt(0).toUpperCase() + (user?.status?.slice(1) || '')}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">@{user?.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <BadgeCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {formatRoleName(user?.roleName)}
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user?.permissions?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Permissions</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user?.accessibleBranches?.includes('*')
                                ? 'All'
                                : user?.accessibleBranches?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Branches</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProfileOverviewCard;
