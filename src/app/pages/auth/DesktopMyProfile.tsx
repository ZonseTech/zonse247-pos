import { FunctionComponent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User2Icon,
    MailIcon,
    PhoneIcon,
    BuildingIcon,
    ShieldIcon,
    KeyRound,
    LogOut,
    AtSignIcon,
    UserIcon,
} from 'lucide-react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import { ThemeContext } from '../../context/ThemeContext';
import PageHeader from '../../components/page/PageHeader';
import Card from '../../components/card/Card';
import { Button } from '../../components';
import { ROUTES } from '../../utils/constants';
import { ChangePasswordForm, InfoRow, ActionRow, formatRoleName } from './profile';

const DesktopMyProfile: FunctionComponent = () => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();
    const { currentBranch } = useBranch();
    const { mode: theme, toggleMode } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | null>(null);

    const handleLogout = () => {
        signout(() => navigate(ROUTES.LOGIN));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
                title="My Profile"
                description="Manage your account settings"
                icon={<User2Icon className="w-8 h-8 text-sky-500" />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                                    {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
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

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
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
                            />
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                                Settings
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            <ActionRow
                                icon={<KeyRound className="w-5 h-5 text-amber-500" />}
                                label="Change Password"
                                description="Update your account password"
                                onTap={() => setActiveTab(activeTab === 'password' ? null : 'password')}
                                active={activeTab === 'password'}
                            />
                            <ActionRow
                                icon={
                                    theme === 'light' ? (
                                        <HiOutlineMoon className="w-5 h-5 text-indigo-500" />
                                    ) : (
                                        <HiOutlineSun className="w-5 h-5 text-yellow-500" />
                                    )
                                }
                                label={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                description={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                                onTap={toggleMode}
                            />
                        </div>
                    </Card>

                    <Card className="p-5 border-red-200 dark:border-red-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <LogOut className="w-5 h-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Sign Out
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        End your session
                                    </p>
                                </div>
                            </div>
                            <Button
                                theme="danger"
                                onClick={handleLogout}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {activeTab === 'password' && (
                <ChangePasswordForm userId={user?.userId || ''} />
            )}
        </div>
    );
};

export default DesktopMyProfile;
