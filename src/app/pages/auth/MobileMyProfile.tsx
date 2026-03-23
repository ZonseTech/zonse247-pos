import { FunctionComponent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MailIcon,
    PhoneIcon,
    BuildingIcon,
    ShieldIcon,
    LogOut,
    KeyRound,
    UserIcon,
    AtSignIcon,
} from 'lucide-react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { Box, Flex, Text, Badge, Button as RadixButton } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import { ThemeContext } from '../../context/ThemeContext';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import BottomSheet from '../../components/BottomSheet';
import { ROUTES } from '../../utils/constants';
import { MobileChangePasswordForm, InfoRow, ActionRow, formatRoleName } from './profile';

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
        <Flex direction="column" className="h-full bg-gray-100 dark:bg-gray-900">
            <Box className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="My Profile"
                    className="bg-white dark:bg-gray-800"
                />
            </Box>

            <Box flexGrow="1" className="overflow-y-auto pt-[60px] pb-6">
                <Box px="4" mt="4">
                    <Text as="p" size="1" weight="bold" color="gray" className="uppercase tracking-wider mb-2 px-1">
                        User Details
                    </Text>
                    <Box className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                        <Flex align="center" gap="4" px="4" py="4" className="border-b border-gray-100 dark:border-gray-700">
                            <Avatar.Root className="w-14 h-14 rounded-full overflow-hidden inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <Avatar.Fallback className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                                    {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <Box flexGrow="1" minWidth="0">
                                <Text as="p" size="4" weight="bold" truncate>
                                    {user?.fullname || 'User'}
                                </Text>
                                <Text as="p" size="2" color="gray">
                                    @{user?.username}
                                </Text>
                                <Flex align="center" gap="2" mt="1">
                                    <Badge
                                        color={user?.status === 'active' ? 'green' : 'red'}
                                        variant="soft"
                                        size="1"
                                    >
                                        {user?.status?.charAt(0).toUpperCase() + (user?.status?.slice(1) || '')}
                                    </Badge>
                                </Flex>
                            </Box>
                        </Flex>

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
                    </Box>
                </Box>

                <Box px="4" mt="4">
                    <Text as="p" size="1" weight="bold" color="gray" className="uppercase tracking-wider mb-2 px-1">
                        Settings
                    </Text>
                    <Box className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                        <ActionRow
                            icon={<KeyRound className="w-5 h-5 text-amber-500" />}
                            label="Change Password"
                            onTap={handleChangePassword}
                            showChevron
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
                            showChevron
                        />
                    </Box>
                </Box>

                <Box px="4" mt="4">
                    <RadixButton
                        color="red"
                        variant="soft"
                        size="3"
                        onClick={handleLogout}
                        className="w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </RadixButton>
                </Box>
            </Box>

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
        </Flex>
    );
};

export default MobileMyProfile;
