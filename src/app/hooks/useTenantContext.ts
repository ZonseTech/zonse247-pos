import { useMemo } from 'react';
import { useAuth } from '../context/AuthProvider';

/**
 * Hook to provide tenant context for creating tenant-scoped resources.
 * Ensures customers, loyalty programs, and other resources are properly
 * associated with the authenticated user's tenant.
 */
interface TenantContext {
    tenantId: string;
    branchId: string;
    userId: string;
    isReady: boolean;
}

export const useTenantContext = (): TenantContext => {
    const { user, activeBranchId } = useAuth();

    const context = useMemo<TenantContext>(() => ({
        tenantId: user?.tenantId || '',
        branchId: activeBranchId || user?.branchId || '',
        userId: user?.userId || '',
        isReady: !!(user?.tenantId && (activeBranchId || user?.branchId) && user?.userId),
    }), [user, activeBranchId]);

    return context;
};

/**
 * Helper to create initial values for tenant-scoped resources
 */
export const useCustomerDefaults = () => {
    const { tenantId, branchId, userId, isReady } = useTenantContext();

    const getCustomerDefaults = useMemo(() => ({
        tenantId,
        branchId,
        userId,
    }), [tenantId, branchId, userId]);

    return { defaults: getCustomerDefaults, isReady };
};

export default useTenantContext;
