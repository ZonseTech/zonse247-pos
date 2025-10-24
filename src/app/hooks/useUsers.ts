import { Notify } from 'notiflix';
import { useState, useEffect } from 'react';
import usersService from '../services/users.service';

export const useUsers = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data: Array<User> = await usersService.list();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            Notify.failure('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredUsers = () => {
        let filtered = users;

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.roleUuid === roleFilter);
        }

        return filtered;
    };

    const getPaginatedData = () => {
        const filtered = getFilteredUsers();
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filtered.slice(startIndex, endIndex);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const saveUsers = (updatedUsers: User[]) => {
        setUsers(updatedUsers);
        setPage(1);
    };

    return {
        users,
        isLoading,
        page,
        perPage,
        searchTerm,
        statusFilter,
        roleFilter,
        setSearchTerm,
        setStatusFilter,
        setRoleFilter,
        getPaginatedData,
        handlePageChange,
        handlePerRowsChange,
        loadUsers,
        saveUsers,
        getFilteredUsers,
        totalRows: getFilteredUsers().length,
        filteredUsers: getFilteredUsers()
    };
};