import api from './http.service';
import { isElectron } from '../utils';

/**
 * Branch Service for frontend branch operations
 * Interfaces with zonse247-pos-api branch endpoints:
 * - POST /auth/switch-branch - Switch to a different branch
 * - GET /auth/accessible-branches - Get user's accessible branches
 * - GET /branches/all - Get all branches (for management)
 */

const endpoints = {
    switchBranch: 'auth/switch-branch',
    accessibleBranches: 'auth/accessible-branches',
    all: 'branches/all',
    store: 'branches/post',
    update: 'branches/update',
    show: 'branches',
    delete: 'branches',
};

export interface SwitchBranchResult {
    user: User;
    token: string;
    branch: Branch;
}

const branchSwitchService = {
    endpoints,

    /**
     * Switch to a different branch
     * Uses POST /auth/switch-branch from zonse247-pos-api
     * 
     * @remarks
     * The backend AuthService.switchBranch validates:
     * - User has access to target branch (via BranchMiddleware.userHasBranchAccess)
     * - Branch exists and is active
     * - Branch belongs to user's tenant
     * 
     * @param branchId - The branch ID to switch to
     * @returns Updated user, new token, and branch details
     */
    async switchBranch(branchId: string): Promise<SwitchBranchResult> {
        try {
            const response = await api.post<ApiResponse<SwitchBranchResult>>(
                endpoints.switchBranch,
                { branchId } as any
            );

            const result = response.data.data;
            if (!result) {
                throw new Error('Invalid response from server');
            }

            this.updateSessionAfterSwitch(result);

            return result;
        } catch (err) {
            console.error('Error switching branch:', err);
            throw err;
        }
    },

    /**
     * Get all branches the current user can access
     * Uses GET /auth/accessible-branches from zonse247-pos-api
     * 
     * @remarks
     * The backend AuthService.getUserAccessibleBranches returns:
     * - All tenant branches if user has wildcard access ('*')
     * - Otherwise, user's default branch + accessibleBranches list
     */
    async getAccessibleBranches(): Promise<Branch[]> {
        try {
            const response = await api.get<ApiResponse<Branch[]>>(endpoints.accessibleBranches);
            return response.data.data || [];
        } catch (err) {
            console.error('Error fetching accessible branches:', err);
            throw err;
        }
    },

    /**
     * Check if user has access to a specific branch
     * Mirrors BranchMiddleware.userHasBranchAccess logic
     * 
     * @param user - The user object
     * @param branchId - The branch ID to check
     */
    userHasBranchAccess(user: User | null, branchId: string): boolean {
        if (!user) return false;

        if (user.accessibleBranches?.includes('*')) {
            return true;
        }

        if (user.branchId === branchId) {
            return true;
        }

        return user.accessibleBranches?.includes(branchId) || false;
    },

    /**
     * Get the effective branch ID for the current user
     * Mirrors BranchMiddleware.getEffectiveBranchId logic
     */
    getEffectiveBranchId(user: User | null): string | null {
        if (!user) return null;
        return user.currentBranchId || user.branchId || null;
    },

    /**
     * Update session storage after branch switch
     * @internal
     */
    updateSessionAfterSwitch(result: SwitchBranchResult): void {
        sessionStorage.setItem('user', JSON.stringify(result.user));
        sessionStorage.setItem('token', JSON.stringify(result.token));
    },

    /**
     * Listen for branch switch events
     * Use this to react to branch changes in components
     * 
     * @example
     * ```tsx
     * useEffect(() => {
     *   const unsubscribe = branchSwitchService.onBranchSwitch((detail) => {
     *     console.log('Switched to:', detail.branch.branchName);
     *     // Refresh data for new branch
     *   });
     *   return unsubscribe;
     * }, []);
     * ```
     */
    onBranchSwitch(
        callback: (detail: { branchId: string; branch: Branch; user: User }) => void
    ): () => void {
        const handler = (event: CustomEvent) => {
            callback(event.detail);
        };
        window.addEventListener('branch-switched', handler as EventListener);
        return () => window.removeEventListener('branch-switched', handler as EventListener);
    },

    /**
     * Dispatch branch switched event
     * Called after successful branch switch to notify other parts of the app
     */
    dispatchBranchSwitched(branchId: string, branch: Branch, user: User): void {
        window.dispatchEvent(new CustomEvent('branch-switched', {
            detail: { branchId, branch, user }
        }));
    }
};

export default branchSwitchService;
