import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type PropsWithChildren
} from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import { useAuth } from './AuthProvider';
import api from '../services/http.service';
import { isElectron } from '../utils';
import BranchSwitchingLoader from '../components/loader/BranchSwitchingLoader';

interface BranchContextType {
    currentBranch: Branch | null;
    activeBranchId: string | null;
    accessibleBranches: Branch[];
    isLoading: boolean;
    isSwitching: boolean;
    switchingToBranch: Branch | null;
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
    const [isSwitching, setIsSwitching] = useState(false);
    const [switchingToBranch, setSwitchingToBranch] = useState<Branch | null>(null);
    const [showSwitchLoader, setShowSwitchLoader] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
    const [accessibleBranches, setAccessibleBranches] = useState<Branch[]>([]);
    const [pendingSwitch, setPendingSwitch] = useState<{ success: boolean; branch: Branch } | null>(null);

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

        const targetBranch = accessibleBranches.find(b => b.branchId === branchId);
        if (targetBranch && targetBranch.status !== 'active') {
            const statusMessage = targetBranch.status === 'inactive'
                ? 'This branch is inactive'
                : 'This branch is suspended';
            Notify.failure(`Cannot switch to ${targetBranch.branchName}. ${statusMessage}.`);
            return false;
        }

        // Start switching animation
        setSwitchingToBranch(targetBranch || null);
        setIsSwitching(true);
        setShowSwitchLoader(true);
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

            // Update Electron session storage if running in Electron
            if (isElectron() && window.electronAPI?.session?.setToken) {
                try {
                    await window.electronAPI.session.setToken(result.token);
                } catch (err) {
                    console.warn('Failed to update Electron session token:', err);
                }
            }

            // Store pending switch data - will be applied when loader completes
            setPendingSwitch({ success: true, branch: result.branch });

            window.dispatchEvent(new CustomEvent('branch-switched', {
                detail: {
                    branchId,
                    branch: result.branch,
                    user: result.user
                }
            }));

            return true;
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to switch branch');

            console.error('Error switching branch:', err);
            setError(errorMessage);
            setShowSwitchLoader(false);
            setIsSwitching(false);
            setSwitchingToBranch(null);
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

    /**
     * Handle loader completion - finalize the branch switch
     */
    const handleSwitchLoaderComplete = useCallback(() => {
        if (pendingSwitch?.success) {
            setCurrentBranch(pendingSwitch.branch);
            Notify.success(`Switched to ${pendingSwitch.branch.branchName}`);

            // Reset all switching states
            setShowSwitchLoader(false);
            setIsSwitching(false);
            setSwitchingToBranch(null);
            setPendingSwitch(null);

            // Full page reload to ensure all data is fresh for the new branch
            // This is the most reliable way to ensure all pages show correct data
            window.location.reload();
        } else {
            // Reset all switching states on failure
            setShowSwitchLoader(false);
            setIsSwitching(false);
            setSwitchingToBranch(null);
            setPendingSwitch(null);
        }
    }, [pendingSwitch]);

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
            if (branch && !isSwitching) {
                setCurrentBranch(branch);
            }
        };

        window.addEventListener('branch-switched', handleBranchSwitch as EventListener);
        return () => {
            window.removeEventListener('branch-switched', handleBranchSwitch as EventListener);
        };
    }, [isSwitching]);

    const value: BranchContextType = {
        currentBranch,
        activeBranchId,
        accessibleBranches,
        isLoading,
        isSwitching,
        switchingToBranch,
        error,
        switchBranch,
        refreshBranches,
        hasAccessToBranch
    };

    return (
        <BranchContext.Provider value={value}>
            {children}
            <BranchSwitchingLoader
                isVisible={showSwitchLoader}
                fromBranch={currentBranch}
                toBranch={switchingToBranch}
                onComplete={handleSwitchLoaderComplete}
            />
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
