import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import FloatingFilterButton from '../../components/buttons/FloatingFilterButton';
import { HelpModal } from '../../components/modals';
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { useUsers } from '../../hooks/useUsers';
import { UserMobileList } from './partials/UserMobileCard';
import { ROUTES } from '../../utils/constants';
import { Box, Flex, Heading, IconButton, Text } from '@radix-ui/themes';

const MobileUserManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const {
        users,
        isLoading,
        setPage,
        perPage,
        totalRows,
    } = useUsers();

    const filteredUsers = (() => {
        if (!searchQuery.trim()) return users;

        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            user.fullname?.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.includes(query) ||
            user.roleName?.toLowerCase().includes(query)
        );
    })();

    const handleAddUser = useCallback(() => {
        navigate(ROUTES.USER_FORM);
    }, [navigate]);

    const handleEdit = useCallback((user: User) => {
        navigate(ROUTES.USER_FORM, { state: { userId: user.userId } });
    }, [navigate]);

    return (
        <Flex direction="column" className="h-full overflow-hidden">
            <Box className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="Staffs"
                    rightContent={
                        <HelpModal iconClassName="w-6 h-6 text-sky-500 dark:text-sky-400 cursor-pointer active:scale-95 transition-transform" />
                    }
                />
            </Box>

            <Box className="flex-1 min-h-0 overflow-hidden pt-14">
                <Box className="h-full overflow-y-auto pb-20">
                    {isLoading ? (
                        <UserMobileList
                            users={[]}
                            onEdit={handleEdit}
                            isLoading={true}
                        />
                    ) : filteredUsers.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" py="9" px="4">
                            <Flex
                                align="center"
                                justify="center"
                                mb="4"
                                className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full"
                            >
                                <Users className="w-8 h-8 text-gray-400" />
                            </Flex>
                            <Heading as="h3" size="3" weight="medium" mb="2" align="center">
                                {searchQuery ? 'No users found' : 'No users yet'}
                            </Heading>
                            <Text as="p" size="2" color="gray" align="center" className="max-w-sm">
                                {searchQuery ? `No users match "${searchQuery}"` : 'Add your first user to get started.'}
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <UserMobileList
                                users={filteredUsers}
                                onEdit={handleEdit}
                                isLoading={false}
                            />

                            <Flex
                                align="center"
                                justify="between"
                                px="4"
                                py="3"
                                className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                            >
                                <Text size="1" color="gray">
                                    {totalRows} total
                                </Text>
                                <Flex align="center" gap="2">
                                    <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="gray"
                                        onClick={() => setPage(1)}
                                        disabled={totalRows <= perPage}
                                    >
                                        <HiOutlineChevronLeft className="w-5 h-5" />
                                    </IconButton>
                                    <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="gray"
                                        onClick={() => setPage(Math.ceil(totalRows / perPage))}
                                        disabled={totalRows <= perPage}
                                    >
                                        <HiOutlineChevronRight className="w-5 h-5" />
                                    </IconButton>
                                </Flex>
                            </Flex>
                        </>
                    )}
                </Box>
            </Box>

            <FloatingFilterButton
                onClick={handleAddUser}
                icon={<HiOutlinePlus className="w-6 h-6" />}
                className="bottom-6"
            />
        </Flex>
    );
};

export default MobileUserManagement;
