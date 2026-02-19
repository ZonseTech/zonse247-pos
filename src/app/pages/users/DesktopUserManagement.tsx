import { FunctionComponent, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus, HiOutlineUsers } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, ComponentLoader } from '../../components';
import { useUsers } from '../../hooks/useUsers';
import { getUserTableColumns } from './partials/UserTableColumns';
import { ROUTES } from '../../utils/constants';

const DesktopUserManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        setPage,
        setPerPage,
        perPage,
        totalRows,
        deleteUser,
        updateUserStatus,
        resetPassword,
        getPaginatedData,
    } = useUsers();

    const handleAddUser = useCallback(() => {
        navigate(ROUTES.USER_FORM);
    }, [navigate]);

    const handleEdit = useCallback((user: User) => {
        navigate(ROUTES.USER_FORM, { state: { userId: user.userId } });
    }, [navigate]);

    const handleDelete = useCallback((userId: string) => {
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
    }, [deleteUser]);

    const handleResetPassword = useCallback((userId: string) => {
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
    }, [resetPassword]);

    const handleToggleStatus = useCallback((userId: string, newStatus: UserStatus) => {
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
    }, [updateUserStatus]);

    const columns = getUserTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onResetPassword: handleResetPassword,
        onToggleStatus: handleToggleStatus,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Staffs Management'
                    description='Manage user accounts, roles, and permissions'
                    icon={<HiOutlineUsers className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Button
                            onClick={handleAddUser}
                            theme='primary'
                            className="flex items-center"
                        >
                            <HiOutlinePlus className="w-4 h-4 mr-2" />
                            <span>Add Staff</span>
                        </Button>
                    }
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={getPaginatedData()}
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
                            onChangeRowsPerPage={(newPerPage, page) => {
                                setPage(page);
                                setPerPage(newPerPage);
                            }}
                            onChangePage={setPage}
                            fixedHeader
                            fixedHeaderScrollHeight="calc(100vh - 420px)"
                            customStyles={getTableStyles(mode)}
                            noDataComponent={
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No users found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                        Add your first user to get started.
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default DesktopUserManagement;
