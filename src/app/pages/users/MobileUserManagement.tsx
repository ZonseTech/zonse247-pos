import { FunctionComponent, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Users, Search, X } from 'lucide-react';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import FloatingFilterButton from '../../components/buttons/FloatingFilterButton';
import { HelpModal } from '../../components/modals';
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { useUsers } from '../../hooks/useUsers';
import { UserMobileList } from './partials/UserMobileCard';
import { ROUTES } from '../../utils/constants';

const MobileUserManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const {
        isLoading,
        setPage,
        perPage,
        totalRows,
        deleteUser,
        updateUserStatus,
        resetPassword,
        getPaginatedData,
    } = useUsers();

    const filteredUsers = useMemo(() => {
        const users = getPaginatedData();
        if (!searchQuery.trim()) return users;

        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            user.fullname?.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.includes(query) ||
            user.roleName?.toLowerCase().includes(query)
        );
    }, [getPaginatedData, searchQuery]);

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

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="Users"
                    rightContent={
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="p-1 rounded-lg active:scale-95 transition-transform"
                            >
                                {showSearch ? (
                                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Search className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                )}
                            </button>
                            <HelpModal iconClassName="w-6 h-6 text-sky-500 dark:text-sky-400 cursor-pointer active:scale-95 transition-transform" />
                        </div>
                    }
                    className="bg-white dark:bg-gray-700"
                />

                {/* Search Bar */}
                {showSearch && (
                    <div className="bg-white dark:bg-gray-700 px-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, phone..."
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-600 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-sky-500"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className={`flex-1 min-h-0 overflow-hidden ${showSearch ? 'pt-[160px]' : 'pt-[110px]'}`}>
                <div className="h-full overflow-y-auto pb-20">
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <UserMobileList
                                users={[]}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onResetPassword={handleResetPassword}
                                onToggleStatus={handleToggleStatus}
                                isLoading={true}
                            />
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                    {searchQuery ? 'No users found' : 'No users yet'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                    {searchQuery ? `No users match "${searchQuery}"` : 'Add your first user to get started.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <UserMobileList
                                    users={filteredUsers}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onResetPassword={handleResetPassword}
                                    onToggleStatus={handleToggleStatus}
                                    isLoading={false}
                                />

                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {totalRows} total
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(1)}
                                            disabled={totalRows <= perPage}
                                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <HiOutlineChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setPage(Math.ceil(totalRows / perPage))}
                                            disabled={totalRows <= perPage}
                                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <HiOutlineChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <FloatingFilterButton
                onClick={handleAddUser}
                icon={<HiOutlinePlus className="w-6 h-6" />}
                className="bottom-6"
            />
        </div>
    );
};

export default MobileUserManagement;
