import { useMemo } from 'react';
import { useAuth } from '../context/AuthProvider';
import { hasPermission } from '../utils';

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
}

/**
 * Hook to determine branch management permissions based on the user's granted permissions
 *
 * Permission levels:
 * - branches.edit / branches.delete / branches.status.manage: tenant-wide (admin tier)
 * - branches.edit.own: only the branch assigned to the user (branch-manager/manager tier)
 * - branches.view: view branch list/details
 */
export const useBranchPermissions = (): BranchPermissions => {
    const { user } = useAuth();

    return useMemo(() => {
        const userBranchId = user?.branchId || user?.currentBranchId || null;
        const userTenantId = user?.tenantId || null;

        const canViewAllBranches = hasPermission(user, 'branches.view');
        const canCreateBranch = hasPermission(user, 'branches.create');
        const canEditAnyBranch = hasPermission(user, 'branches.edit');
        const canEditOwnBranch = hasPermission(user, 'branches.edit.own');

        const canEditBranch = (branchId: string): boolean => {
            if (branchId === '-1') return false; // Default branch cannot be edited
            if (canEditAnyBranch) return true;
            if (canEditOwnBranch) return branchId === userBranchId;
            return false;
        };

        const canDeleteBranch = (branchId: string): boolean => {
            if (branchId === '-1') return false; // Default branch cannot be deleted
            return hasPermission(user, 'branches.delete');
        };

        const canToggleStatus = (branchId: string): boolean => {
            if (branchId === '-1') return false;
            return hasPermission(user, 'branches.status.manage');
        };

        const canViewTenantInfo = hasPermission(user, 'system.admin');
        const canViewFinancials = hasPermission(user, 'reports.financial');
        const canManageMraApproval = hasPermission(user, 'system.admin');

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
        };
    }, [user]);
};

export default useBranchPermissions;
