import { useState } from 'react';

export const useFilterState = () => {
    const [filterState, setFilterState] = useState<FilterState>({
        searchTerm: '',
        selectedCategory: 'all',
        selectedScope: 'all',
    });

    const updateSearchTerm = (searchTerm: string): void => {
        setFilterState(prev => ({ ...prev, searchTerm }));
    };

    const updateCategory = (selectedCategory: string): void => {
        setFilterState(prev => ({ ...prev, selectedCategory }));
    };

    const updateScope = (selectedScope: string): void => {
        setFilterState(prev => ({ ...prev, selectedScope }));
    };

    const filterRoles = (roles: Role[]): Role[] => {
        return roles.filter(role =>
            role.name?.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            role.displayName?.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            role.description?.toLowerCase().includes(filterState.searchTerm.toLowerCase())
        );
    };

    const filterPermissions = (permissions: Permission[]): Permission[] => {
        return permissions.filter(permission => {
            const matchesSearch = permission.name?.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
                permission.displayName?.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
                permission.description?.toLowerCase().includes(filterState.searchTerm.toLowerCase());
            const matchesCategory = filterState.selectedCategory === 'all' || permission.category === filterState.selectedCategory;
            const matchesScope = filterState.selectedScope === 'all' || permission.scope === filterState.selectedScope;
            return matchesSearch && matchesCategory && matchesScope;
        });
    };

    return {
        filterState,
        updateSearchTerm,
        updateCategory,
        updateScope,
        filterRoles,
        filterPermissions,
    };
};