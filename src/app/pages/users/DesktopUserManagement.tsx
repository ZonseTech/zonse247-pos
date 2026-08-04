import { FunctionComponent, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus, HiOutlineUsers } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader } from '../../components';
import { useUsers } from '../../hooks/useUsers';
import { getUserTableColumns } from './partials/UserTableColumns';
import { ROUTES } from '../../utils/constants';
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { useAuth } from '../../context/AuthProvider';
import { hasPermission } from '../../utils';

const DesktopUserManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const { user } = useAuth();

    const canCreateUser = hasPermission(user, 'users.create');
    const canEditUser = hasPermission(user, 'users.edit');
    const canDeleteUser = hasPermission(user, 'users.delete');

    const {
        users,
        isLoading,
        perPage,
        totalRows,
        handlePageChange,
        handlePerRowsChange,
        deleteUser,
        updateUserStatus,
        resetPassword,
    } = useUsers();

    const handleAddUser = useCallback(() => {
        if (!canCreateUser) {
            return;
        }

        navigate(ROUTES.USER_FORM);
    }, [navigate, canCreateUser]);

    const handleEdit = useCallback((user: User) => {
        if (!canEditUser) {
            return;
        }

        navigate(ROUTES.USER_FORM, { state: { userId: user.userId } });
    }, [navigate, canEditUser]);

    const handleDelete = useCallback((userId: string) => {
        if (!canDeleteUser) {
            return;
        }

        Confirm.show(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            'Yes, Delete',
            'Cancel',
            () => {
                deleteUser(userId);
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [deleteUser, canDeleteUser]);

    const handleResetPassword = useCallback((userId: string) => {
        if (!canEditUser) {
            return;
        }

        Confirm.show(
            'Reset Password',
            'Enter new password for this user:',
            'Reset',
            'Cancel',
            () => {
                const newPassword = prompt('Enter new password (min 8 characters):');
                if (newPassword && newPassword.length >= 8) {
                    resetPassword(userId, newPassword, true);
                } else if (newPassword) {
                    Notify.failure('Password must be at least 8 characters');
                }
            }
        );
    }, [resetPassword, canEditUser]);

    const handleToggleStatus = useCallback((userId: string, newStatus: UserStatus) => {
        if (!canEditUser) {
            return;
        }

        const action = newStatus === 'active' ? 'activate' : 'deactivate';
        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} this user?`,
            'Yes',
            'Cancel',
            () => {
                updateUserStatus(userId, newStatus);
            }
        );
    }, [updateUserStatus, canEditUser]);

    const columns = getUserTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onResetPassword: handleResetPassword,
        onToggleStatus: handleToggleStatus,
        canEditUser,
        canDeleteUser,
        canResetPassword: canEditUser,
        canToggleStatus: canEditUser,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    title='Staffs Management'
                    description='Manage user accounts, roles, and permissions'
                    icon={<HiOutlineUsers className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={canCreateUser ? (
                        <Button
                            size="2"
                            variant="solid"

                            onClick={handleAddUser}
                            className="cursor-pointer"
                        >
                            <HiOutlinePlus className="w-4 h-4" />
                            Add Staff
                        </Button>
                    ) : undefined}
                />

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={users}
                        theme={mode as string}
                        progressPending={isLoading}
                        progressComponent={<ComponentLoader loading={isLoading} />}
                        highlightOnHover
                        striped
                        responsive
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        customStyles={getTableStyles(mode)}
                        noDataComponent={
                            <Flex direction="column" align="center" justify="center" py="9">
                                <Flex
                                    align="center"
                                    justify="center"
                                    mb="4"
                                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full"
                                >
                                    <Users className="w-8 h-8 text-gray-400" />
                                </Flex>
                                <Heading as="h3" size="3" weight="medium" mb="2">
                                    No users found
                                </Heading>
                                <Text as="p" size="2" color="gray" align="center" className="max-w-sm">
                                    Add your first user to get started.
                                </Text>
                            </Flex>
                        }
                    />
                </Box>
            </Box>
        </AppLayout>
    );
};

export default DesktopUserManagement;
