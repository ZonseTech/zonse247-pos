import { ChangeEvent } from 'react';
import { Button, Input } from '../../../components';
import { UserStatus } from '../../../utils/constants';
import PageHeader from '../../../components/page/PageHeader';
import { HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi';

interface UserFiltersProps {
    searchTerm: string;
    statusFilter: string;
    roleFilter: string;
    uniqueRoles: string[];
    totalUsers: number;
    filteredCount: number;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onStatusFilterChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onRoleFilterChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onAddUser: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
    searchTerm,
    statusFilter,
    roleFilter,
    uniqueRoles,
    onSearchChange,
    onStatusFilterChange,
    onRoleFilterChange,
    onAddUser
}) => {
    return (
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600">
            <PageHeader
                title="User Management"
                description="Manage terminal users, roles, and permissions"
            />

            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex relative min-w-64">
                    <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="rounded-md px-3 py-2.5 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>

                <select
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                >
                    <option value="all">All Status</option>
                    <option value={UserStatus.ACTIVE}>Active</option>
                    <option value={UserStatus.INACTIVE}>Inactive</option>
                    <option value={UserStatus.SUSPENDED}>Suspended</option>
                </select>

                <select
                    value={roleFilter}
                    onChange={onRoleFilterChange}
                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                >
                    <option value="all">All Roles</option>
                    {uniqueRoles.map(role => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>

                <Button
                    onClick={onAddUser}
                    className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white dark:text-gray-100 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <HiOutlinePlus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>
        </div>
    );
};

export default UserFilters;