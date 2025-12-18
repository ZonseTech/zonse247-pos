import { FunctionComponent, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext } from '../../components';
import { useUsers } from '../../hooks/useUsers';
import { SearchBar } from './partials/SearchBar';
import { getUserTableColumns } from './partials/UserTableColumns';
import { ROUTES } from '../../utils/constants';

const UserManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
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
        navigate(ROUTES.USER_FORM, { state: { userId: user.id || user.userId } });
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
                // In a real implementation, you'd show a modal to get the new password
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
                    title='Users'
                    description='Manage user accounts, roles, and permissions'
                >
                    <div className="flex items-center space-x-4">
                        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={handleAddUser}
                                theme='primary'
                            >
                                <HiOutlinePlus className="w-4 h-4 mr-2" />
                                {'Add User'}
                            </Button>
                        </div>
                    </div>
                </PageHeader>
                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    theme={mode as string}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setPage(page);
                        setPerPage(newPerPage);
                    }}
                    onChangePage={setPage}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No user(s) found matching your search.' : 'No users found.'}
                            </p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default UserManagement;
