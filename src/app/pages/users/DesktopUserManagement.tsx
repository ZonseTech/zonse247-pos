import { FunctionComponent, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus, HiOutlineUsers } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, ComponentLoader } from '../../components';
import { useUsers } from '../../hooks/useUsers';
import { SearchBar } from './partials/SearchBar';
import { RoleFilter } from './partials/RoleFilter';
import { getUserTableColumns } from './partials/UserTableColumns';
import UserSummaryCards, { UserSummaryCard } from './partials/UserSummaryCards';
import { ROUTES } from '../../utils/constants';

const DesktopUserManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        roleFilter,
        setRoleFilter,
        setPage,
        setPerPage,
        perPage,
        totalRows,
        deleteUser,
        updateUserStatus,
        resetPassword,
        getPaginatedData,
        users,
        clearFilters,
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

    // Calculate summary stats
    const summaryCards: UserSummaryCard[] = useMemo(() => {
        const allUsers = users || [];
        const activeCount = allUsers.filter(u => u.status === 'active').length;
        const inactiveCount = allUsers.filter(u => u.status === 'inactive').length;
        const suspendedCount = allUsers.filter(u => u.status !== 'active' && u.status !== 'inactive').length;

        return [
            {
                title: 'Total Users',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Active',
                value: activeCount,
                icon: 'active',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Inactive',
                value: inactiveCount,
                icon: 'inactive',
                bgColor: 'bg-gray-50 dark:bg-gray-700/50',
                iconBgColor: 'bg-gray-100 dark:bg-gray-600',
                textColor: 'text-gray-600 dark:text-gray-400',
            },
            {
                title: 'Suspended',
                value: suspendedCount,
                icon: 'suspended',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ];
    }, [users, totalRows]);

    const hasActiveFilters = searchTerm.length > 0 || roleFilter !== 'all';

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Users'
                    description='Manage user accounts, roles, and permissions'
                    icon={<HiOutlineUsers className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Button
                            onClick={handleAddUser}
                            theme='primary'
                            className="flex items-center"
                        >
                            <HiOutlinePlus className="w-4 h-4 mr-2" />
                            <span>Add User</span>
                        </Button>
                    }
                >
                    {/* Search and Filter Section */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col gap-3">
                            {/* Search Row */}
                            <div className="flex flex-row gap-3">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search users by name, email, or username..."
                                />

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                    >
                                        <HiOutlineFilter className="w-4 h-4" />
                                        <span>Clear</span>
                                    </button>
                                )}
                            </div>

                            {/* Role Filter */}
                            <RoleFilter
                                selectedRole={roleFilter}
                                onChange={setRoleFilter}
                            />
                        </div>
                    </div>
                </PageHeader>

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Summary Cards */}
                    <UserSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />

                    {/* Desktop View - Data Table */}
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
                                        {searchTerm ? 'No matching users' : 'No users found'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                        {searchTerm
                                            ? "Try adjusting your search terms."
                                            : "Add your first user to get started."
                                        }
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                                        >
                                            Clear filters
                                        </button>
                                    )}
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
