import { useMemo } from 'react';
import { useAuth } from '../context/AuthProvider';
import { ROLE_IDS, ROLE_NAMES, isAdminRole, isManagerRole } from '../constants/roles';

export interface BranchPermissions {
    canViewAllBranches: boolean;
    canCreateBranch: boolean;
    canEditBranch: (branchId: string) => boolean;
    canDeleteBranch: (branchId: string) => boolean;
    canToggleStatus: (branchId: string) => boolean;
    canViewTenantInfo: boolean;
    canViewFinancials: boolean;
    canManageMraApproval: boolean;
    userBranchId: string | null;
    userTenantId: string | null;
    isTenantOwner: boolean;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isBranchManager: boolean;
}

/**
 * Hook to determine branch management permissions based on user role
 * 
 * Permission levels:
 * - Super Admin: Full access across all tenants and branches
 * - Tenant Owner: Full access to all branches within their tenant
 * - Admin: Can manage all branches within their tenant
 * - Branch Manager: Can only view/edit their assigned branch
 * - Other roles: View only (if permitted)
 */
export const useBranchPermissions = (): BranchPermissions => {
    const { user } = useAuth();

    return useMemo(() => {
        const roleId = user?.roleId;
        const roleName = user?.roleName;
        const userBranchId = user?.branchId || user?.currentBranchId || null;
        const userTenantId = user?.tenantId || null;

        // Role checks
        const isSuperAdmin = roleId === ROLE_IDS.SUPER_ADMIN || roleName === ROLE_NAMES.SUPER_ADMIN;
        const isTenantOwner = roleId === ROLE_IDS.TENANT_OWNER || roleName === ROLE_NAMES.TENANT_OWNER;
        const isAdmin = roleId === ROLE_IDS.ADMIN || roleName === ROLE_NAMES.ADMIN;
        const isBranchManager = roleId === ROLE_IDS.BRANCH_MANAGER || roleName === ROLE_NAMES.BRANCH_MANAGER;
        const isManager = roleId === ROLE_IDS.MANAGER || roleName === ROLE_NAMES.MANAGER;

        // High-level permission checks
        const hasAdminAccess = isSuperAdmin || isTenantOwner || isAdmin;
        const hasManagerAccess = hasAdminAccess || isBranchManager || isManager;

        // Specific permissions
        const canViewAllBranches = hasAdminAccess;
        const canCreateBranch = isSuperAdmin || isTenantOwner || isAdmin;
        
        const canEditBranch = (branchId: string): boolean => {
            if (branchId === '-1') return false; // Default branch cannot be edited
            if (hasAdminAccess) return true;
            if (isBranchManager || isManager) {
                return branchId === userBranchId;
            }
            return false;
        };

        const canDeleteBranch = (branchId: string): boolean => {
            if (branchId === '-1') return false; // Default branch cannot be deleted
            // Only super admin, tenant owner, and admin can delete branches
            return hasAdminAccess;
        };

        const canToggleStatus = (branchId: string): boolean => {
            if (branchId === '-1') return false;
            return hasAdminAccess;
        };

        const canViewTenantInfo = isSuperAdmin || isTenantOwner;
        const canViewFinancials = hasAdminAccess;
        const canManageMraApproval = isSuperAdmin || isTenantOwner;

        return {
            canViewAllBranches,
            canCreateBranch,
            canEditBranch,
            canDeleteBranch,
            canToggleStatus,
            canViewTenantInfo,
            canViewFinancials,
            canManageMraApproval,
            userBranchId,
            userTenantId,
            isTenantOwner,
            isSuperAdmin,
            isAdmin,
            isBranchManager,
        };
    }, [user]);
};

export default useBranchPermissions;
