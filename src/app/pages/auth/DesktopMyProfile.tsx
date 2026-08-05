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
} from 'lucide-react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { Flex, Box, Text, Heading, Badge, Card, Button, Theme } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import { ThemeContext } from '../../context/ThemeContext';
import PageHeader from '../../components/page/PageHeader';
import { ROUTES } from '../../utils/constants';
import { ChangePasswordForm, InfoRow, ActionRow, formatRoleName } from './profile';
import AppLayout from '../../layouts/AppLayout';

const DesktopMyProfile: FunctionComponent = () => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();
    const { currentBranch } = useBranch();
    const { mode: theme, toggleMode } = useContext(ThemeContext);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const handleLogout = () => {
        signout(() => navigate(ROUTES.LOGIN));
    };

    return (
        <AppLayout>
            <PageHeader
                title="My Profile"
                description="Manage your account settings"
                icon={<User2Icon className="w-8 h-8 text-sky-500" />}
                showBackButton={false}
            />

            <Flex gap="6" direction={{ initial: 'column', lg: 'row' }}>
                <Box flexGrow="1" className="lg:flex-[2]">
                    <Card size="3" className="overflow-hidden">
                        <Flex
                            align="center"
                            gap="4"
                            py="5"
                            className="border-b border-gray-100 dark:border-gray-700"
                        >
                            <Avatar.Root className="w-16 h-16 rounded-full overflow-hidden inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                <Avatar.Fallback className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                                    {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <Box flexGrow="1" minWidth="0">
                                <Heading as="h2" size="5" weight="bold" truncate>
                                    {user?.fullname || 'User'}
                                </Heading>
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

                        <Box className="divide-y divide-gray-100 dark:divide-gray-700">
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
                                value={formatRoleName(user?.role?.name)}
                            />
                        </Box>
                    </Card>
                </Box>

                <Flex direction="column" gap="6" className="lg:flex-1">
                    <Card size="3" className="overflow-hidden">
                        <Box pb="3" className="border-b border-gray-100 dark:border-gray-700">
                            <Text size="1" weight="bold" className="uppercase tracking-wide text-gray-900 dark:text-white">
                                Settings
                            </Text>
                        </Box>
                        <Box className="divide-y divide-gray-100 dark:divide-gray-700">
                            <ActionRow
                                icon={<KeyRound className="w-5 h-5 text-amber-500" />}
                                label="Change Password"
                                description="Update your account password"
                                onTap={() => setIsPasswordModalOpen(true)}
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
                        </Box>
                    </Card>

                    <Card size="2" className="border-red-200 dark:border-red-900/30">
                        <Flex align="center" justify="between">
                            <Flex align="center" gap="3">
                                <LogOut className="w-5 h-5 text-red-500" />
                                <Box>
                                    <Text as="p" size="2" weight="medium">
                                        Sign Out
                                    </Text>
                                    <Text as="p" size="1" color="gray">
                                        End your session
                                    </Text>
                                </Box>
                            </Flex>
                            <Button
                                color="red"
                                variant="solid"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </Flex>
                    </Card>
                </Flex>
            </Flex>

            <Dialog.Root
                open={isPasswordModalOpen}
                onOpenChange={(open) => setIsPasswordModalOpen(open)}
            >
                <Dialog.Portal>
                    <Theme appearance="inherit" accentColor="cyan">
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                            <Dialog.Title className="sr-only">Change Password</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>

                            <ChangePasswordForm
                                userId={user?.userId || ''}
                                onSuccess={() => setIsPasswordModalOpen(false)}
                            />
                        </Dialog.Content>
                    </Theme>
                </Dialog.Portal>
            </Dialog.Root>
        </AppLayout>
    );
};

export default DesktopMyProfile;
