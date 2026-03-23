import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import usersService from '../services/users.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { usePagination } from './usePagination';

interface UseUsersReturn {
    users: User[];
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
    handlePageChange: (page: number) => void;
    handlePerRowsChange: (newPerPage: number, page: number) => void;
    deleteUser: (userId: string) => Promise<void>;
    updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
    resetPassword: (userId: string, newPassword: string, forceChange?: boolean) => Promise<void>;
    refreshUsers: () => Promise<void>;
    clearFilters: () => void;
}

export const useUsers = (): UseUsersReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const {
        page, setPage, perPage, setPerPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange,
    } = usePagination();

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await usersService.listPaginated({
                page,
                perPage,
                search: searchTerm || undefined,
                roleId: roleFilter !== 'all' ? roleFilter : undefined,
            });
            setUsers(result.data || []);
            setTotalRows(result.pagination?.total || 0);
        } catch (error: any) {
            console.error('Error loading users:', error);
            Notify.failure(getErrorMessage(error, 'Failed to load users'));
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, searchTerm, roleFilter, setTotalRows]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, roleFilter, setPage]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setRoleFilter('all');
    }, []);

    const deleteUser = useCallback(async (userId: string) => {
        try {
            await usersService.delete(userId);
            Notify.success('User deleted successfully');
            await loadUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            Notify.failure(getErrorMessage(error, 'Failed to delete user'));
        }
    }, [loadUsers]);

    const updateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
        try {
            await usersService.toggleStatus(userId, status);
            Notify.success(`User ${status} successfully`);
            await loadUsers();
        } catch (error: any) {
            console.error('Error updating user status:', error);
            Notify.failure(getErrorMessage(error, 'Failed to update user status'));
        }
    }, [loadUsers]);

    const resetPassword = useCallback(async (userId: string, newPassword: string, forceChange: boolean = true) => {
        try {
            await usersService.resetPassword(userId, { newPassword, forcePasswordChange: forceChange });
            Notify.success('Password reset successfully');
            await loadUsers();
        } catch (error: any) {
            console.error('Error resetting password:', error);
            Notify.failure(getErrorMessage(error, 'Failed to reset password'));
        }
    }, [loadUsers]);

    const refreshUsers = useCallback(async () => {
        await loadUsers();
    }, [loadUsers]);

    return {
        users,
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
        handlePageChange,
        handlePerRowsChange,
        deleteUser,
        updateUserStatus,
        resetPassword,
        refreshUsers,
        clearFilters,
    };
};