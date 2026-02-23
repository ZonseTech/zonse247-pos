import { FunctionComponent, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';
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

    const {
        isLoading,
        setPage,
        perPage,
        totalRows,
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

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="Staffs"
                    rightContent={
                        <HelpModal iconClassName="w-6 h-6 text-sky-500 dark:text-sky-400 cursor-pointer active:scale-95 transition-transform" />
                    }
                />
            </div>

            <div className={`flex-1 min-h-0 overflow-hidden pt-14`}>
                <div className="h-full overflow-y-auto pb-20">
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <UserMobileList
                                users={[]}
                                onEdit={handleEdit}
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
