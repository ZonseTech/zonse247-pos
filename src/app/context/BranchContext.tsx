import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type PropsWithChildren
} from 'react';
import { Notify } from 'notiflix';
import { useAuth } from './AuthProvider';
import api from '../services/http.service';

interface BranchContextType {
    currentBranch: Branch | null;
    activeBranchId: string | null;
    accessibleBranches: Branch[];
    isLoading: boolean;
    error: string | null;
    switchBranch: (branchId: string) => Promise<boolean>;
    refreshBranches: () => Promise<void>;
    hasAccessToBranch: (branchId: string) => boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

/**
 * Branch Context Provider
 * 
 * Manages branch context for multi-branch operations.
 * Uses the zonse247-pos-api endpoints:
 * - POST /auth/switch-branch - Switch to a different branch
 * - GET /auth/accessible-branches - Get user's accessible branches
 * 
 * Branch context is passed via X-Branch-Id header in API requests.
 */
export const BranchProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
    const [accessibleBranches, setAccessibleBranches] = useState<Branch[]>([]);

    const activeBranchId = user?.currentBranchId || user?.branchId || null;

    /**
     * Fetch accessible branches for the current user
     */
    const refreshBranches = useCallback(async () => {
        if (!isAuthenticated || !user) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get<ApiResponse<{ branches: Branch[]; currentBranchId: string }>>('auth/accessible-branches');

            const responseData = response.data as any;
            let branches: Branch[] = [];
            let serverCurrentBranchId: string | null = null;

            if (responseData?.data?.branches && Array.isArray(responseData.data.branches)) {
                branches = responseData.data.branches;
                serverCurrentBranchId = responseData.data.currentBranchId || null;
            } else if (responseData?.branches && Array.isArray(responseData.branches)) {
                branches = responseData.branches;
                serverCurrentBranchId = responseData.currentBranchId || null;
            } else if (Array.isArray(responseData?.data)) {
                branches = responseData.data;
            } else if (Array.isArray(responseData)) {
                branches = responseData;
            }

            setAccessibleBranches(branches);

            const branchIdToUse = serverCurrentBranchId || activeBranchId;
            if (branchIdToUse && branches.length > 0) {
                const active = branches.find(b => b.branchId === branchIdToUse);
                if (active) {
                    setCurrentBranch(active);
                }
            }
        } catch (err) {
            console.error('Error fetching accessible branches:', err);
            setError('Failed to load accessible branches');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user, activeBranchId]);

    /**
     * Switch to a different branch
     */
    const switchBranch = useCallback(async (branchId: string): Promise<boolean> => {
        if (!user) {
            Notify.failure('You must be logged in to switch branches');
            return false;
        }

        if (!hasAccessToBranch(branchId)) {
            Notify.failure('You do not have access to this branch');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post<ApiResponse<SwitchBranchResponse>>(
                'auth/switch-branch',
                { branchId } as any
            );

            const result = response.data.data;
            if (!result) {
                throw new Error('Invalid response from server');
            }

            sessionStorage.setItem('token', JSON.stringify(result.token));
            sessionStorage.setItem('user', JSON.stringify(result.user));

            setCurrentBranch(result.branch);

            window.dispatchEvent(new CustomEvent('branch-switched', {
                detail: {
                    branchId,
                    branch: result.branch,
                    user: result.user
                }
            }));

            Notify.success(`Switched to ${result.branch.branchName}`);
            return true;
        } catch (err: any) {
            const errorMessage = err?.error?.response?.data?.message ||
                err?.message ||
                'Failed to switch branch';

            console.error('Error switching branch:', err);
            setError(errorMessage);
            Notify.failure(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Check if user has access to a specific branch
     */
    const hasAccessToBranch = useCallback((branchId: string): boolean => {
        if (!user) return false;

        if (user.accessibleBranches?.includes('*')) {
            return true;
        }

        if (user.branchId === branchId) {
            return true;
        }

        if (user.accessibleBranches?.includes(branchId)) {
            return true;
        }

        return accessibleBranches.some(b => b.branchId === branchId);
    }, [user, accessibleBranches]);

    useEffect(() => {
        if (isAuthenticated && user) {
            refreshBranches();
        } else {
            setCurrentBranch(null);
            setAccessibleBranches([]);
            setError(null);
        }
    }, [isAuthenticated, user?.userId]);

    useEffect(() => {
        const handleBranchSwitch = (event: CustomEvent) => {
            const { branch } = event.detail;
            if (branch) {
                setCurrentBranch(branch);
            }
        };

        window.addEventListener('branch-switched', handleBranchSwitch as EventListener);
        return () => {
            window.removeEventListener('branch-switched', handleBranchSwitch as EventListener);
        };
    }, []);

    const value: BranchContextType = {
        currentBranch,
        activeBranchId,
        accessibleBranches,
        isLoading,
        error,
        switchBranch,
        refreshBranches,
        hasAccessToBranch
    };

    return (
        <BranchContext.Provider value={value}>
            {children}
        </BranchContext.Provider>
    );
};

/**
 * Hook to access branch context
 * @throws Error if used outside of BranchProvider
 */
export const useBranch = (): BranchContextType => {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};

/**
 * Hook to get just the active branch ID
 * Useful for passing to API calls
 */
export const useActiveBranchId = (): string | null => {
    const { activeBranchId } = useBranch();
    return activeBranchId;
};

export default BranchContext;
