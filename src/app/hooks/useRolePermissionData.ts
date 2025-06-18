import { useState, useEffect } from 'react';
import roleService from '../services/role.service';
import permissionService from '../services/permission.service';
import { PermissionScope } from '../utils/constants';

export const useRolePermissionData = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [scopes, setScopes] = useState<PermissionScope[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const [rolesData, permissionsData, categoriesData, scopesData] = await Promise.all([
                roleService.getAll(),
                permissionService.getAll(),
                permissionService.getCategories(),
                permissionService.getScopes(),
            ]);

            setRoles(rolesData);
            setPermissions(permissionsData);
            setCategories(categoriesData.map((item: any) => item.category || item));
            setScopes(Object.values(PermissionScope));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
            setError(errorMessage);
            console.error('Data loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        roles,
        permissions,
        categories,
        scopes,
        loading,
        error,
        setError,
        refetchData: loadData,
    };
};