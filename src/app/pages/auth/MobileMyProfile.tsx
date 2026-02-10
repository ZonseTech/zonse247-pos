import { FunctionComponent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MailIcon,
    PhoneIcon,
    BuildingIcon,
    ShieldIcon,
    LogOut,
    ChevronRight,
    KeyRound,
    UserIcon,
    AtSignIcon,
} from 'lucide-react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import { ThemeContext } from '../../context/ThemeContext';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import BottomSheet from '../../components/BottomSheet';
import { ROUTES } from '../../utils/constants';
import MobileChangePasswordForm from './profile/MobileChangePasswordForm';

const formatRoleName = (role: string | null | undefined): string => {
    if (!role) return 'User';
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const MobileMyProfile: FunctionComponent = () => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();
    const { currentBranch } = useBranch();
    const { mode: theme, toggleMode } = useContext(ThemeContext);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogout = () => {
        signout(() => navigate(ROUTES.LOGIN));
    };

    const handleChangePassword = () => {
        setShowChangePassword(true);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="My Profile"
                    className="bg-white dark:bg-gray-800"
                />
            </div>

            <div className="flex-1 overflow-y-auto pt-[60px] pb-6">
                <div className="px-4 mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
                        User Details
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                                    {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {user?.fullname || 'User'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        @{user?.username}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${user?.status === 'active'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                }`}
                                        >
                                            {user?.status?.charAt(0).toUpperCase() + (user?.status?.slice(1) || '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <InfoRow
                            icon={<UserIcon className="w-5 h-5 text-sky-500" />}
                            label="Full Name"
                            value={user?.fullname || 'Not set'}
                        />
                        <InfoRow
                            icon={<AtSignIcon className="w-5 h-5 text-violet-500" />}
                            label="Username"
                            value={user?.username || 'Not set'}
                        />
                        <InfoRow
                            icon={<MailIcon className="w-5 h-5 text-blue-500" />}
                            label="Email"
                            value={user?.email || 'Not set'}
                        />
                        <InfoRow
                            icon={<PhoneIcon className="w-5 h-5 text-green-500" />}
                            label="Phone"
                            value={user?.phone || 'Not set'}
                        />
                        <InfoRow
                            icon={<BuildingIcon className="w-5 h-5 text-purple-500" />}
                            label="Branch"
                            value={currentBranch?.branchName || 'Not assigned'}
                        />
                        <InfoRow
                            icon={<ShieldIcon className="w-5 h-5 text-orange-500" />}
                            label="Role"
                            value={formatRoleName(user?.roleName)}
                            noBorder
                        />
                    </div>
                </div>

                <div className="px-4 mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
                        Settings
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                        <ActionRow
                            icon={<KeyRound className="w-5 h-5 text-amber-500" />}
                            label="Change Password"
                            onTap={handleChangePassword}
                        />
                        <ActionRow
                            icon={
                                theme === 'light' ? (
                                    <HiOutlineMoon className="w-5 h-5 text-indigo-500" />
                                ) : (
                                    <HiOutlineSun className="w-5 h-5 text-yellow-500" />
                                )
                            }
                            label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            onTap={toggleMode}
                            noBorder
                        />
                    </div>
                </div>

                <div className="px-4 mt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium active:scale-[0.98] transition-transform"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            <BottomSheet
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                title="Change Password"
            >
                <MobileChangePasswordForm
                    userId={user?.userId || ''}
                    onSuccess={() => setShowChangePassword(false)}
                />
            </BottomSheet>
        </div>
    );
};

// Info Row Component
interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    noBorder?: boolean;
}

const InfoRow: FunctionComponent<InfoRowProps> = ({ icon, label, value, noBorder = false }) => (
    <div
        className={`flex items-center px-4 py-3 ${!noBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
    >
        <div className="flex-shrink-0 mr-3">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

// Action Row Component
interface ActionRowProps {
    icon: React.ReactNode;
    label: string;
    onTap: () => void;
    noBorder?: boolean;
}

const ActionRow: FunctionComponent<ActionRowProps> = ({ icon, label, onTap, noBorder = false }) => (
    <button
        onClick={onTap}
        className={`w-full flex items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors ${!noBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
    >
        <div className="flex-shrink-0 mr-3">{icon}</div>
        <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
);

export default MobileMyProfile;
