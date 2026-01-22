import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import usersService from '../services/users.service';

interface UseUsersReturn {
    users: User[];
    filteredUsers: User[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    roleFilter: string;
    setRoleFilter: (roleId: string) => void;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    totalRows: number;
    deleteUser: (userId: string) => Promise<void>;
    updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
    resetPassword: (userId: string, newPassword: string, forceChange?: boolean) => Promise<void>;
    refreshUsers: () => Promise<void>;
    filterUsers: (term: string, roleId?: string) => User[];
    getPaginatedData: () => User[];
    clearFilters: () => void;
}

export const useUsers = (): UseUsersReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await usersService.list();
            setUsers(data);
            setFilteredUsers(data);
            setTotalRows(data.length);
        } catch (error: any) {
            console.error('Error loading users:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load users';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filterUsers = useCallback((term: string, roleId?: string): User[] => {
        let filtered = users;

        // Filter by role first
        if (roleId && roleId !== 'all') {
            filtered = filtered.filter((user) => user.roleId === roleId);
        }

        // Then filter by search term
        if (term.trim()) {
            const lowerTerm = term.toLowerCase();
            filtered = filtered.filter((user) =>
                user.username?.toLowerCase().includes(lowerTerm) ||
                user.fullname?.toLowerCase().includes(lowerTerm) ||
                user.email?.toLowerCase().includes(lowerTerm) ||
                user.phone?.toLowerCase().includes(lowerTerm) ||
                user.roleId?.toLowerCase().includes(lowerTerm) ||
                user.roleName?.toLowerCase().includes(lowerTerm)
            );
        }

        return filtered;
    }, [users]);

    useEffect(() => {
        const filtered = filterUsers(searchTerm, roleFilter);
        setFilteredUsers(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    }, [searchTerm, roleFilter, filterUsers]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setRoleFilter('all');
    }, []);

    const getPaginatedData = useCallback((): User[] => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [page, perPage, filteredUsers]);

    const deleteUser = useCallback(async (userId: string) => {
        try {
            await usersService.delete(userId);
            Notify.success('User deleted successfully');
            await loadUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to delete user';
            Notify.failure(errorMessage);
        }
    }, [loadUsers]);

    const updateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
        try {
            await usersService.toggleStatus(userId, status);
            Notify.success(`User ${status} successfully`);
            await loadUsers();
        } catch (error: any) {
            console.error('Error updating user status:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update user status';
            Notify.failure(errorMessage);
        }
    }, [loadUsers]);

    const resetPassword = useCallback(async (userId: string, newPassword: string, forceChange: boolean = true) => {
        try {
            await usersService.resetPassword(userId, { newPassword, forcePasswordChange: forceChange });
            Notify.success('Password reset successfully');
            await loadUsers();
        } catch (error: any) {
            console.error('Error resetting password:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to reset password';
            Notify.failure(errorMessage);
        }
    }, [loadUsers]);

    const refreshUsers = useCallback(async () => {
        await loadUsers();
    }, [loadUsers]);

    return {
        users,
        filteredUsers,
        isLoading,
        searchTerm,
        setSearchTerm,
        roleFilter,
        setRoleFilter,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        deleteUser,
        updateUserStatus,
        resetPassword,
        refreshUsers,
        filterUsers,
        getPaginatedData,
        clearFilters,
    };
};