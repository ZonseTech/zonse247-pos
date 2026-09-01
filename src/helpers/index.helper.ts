declare global {
    interface Window {
        electronAPI: {
            session: {
                setToken: (token: string | null) => Promise<ApiResponse<void>>;
                getToken: () => Promise<ApiResponse<string | null>>;
                set: (data: { token?: string; userId?: string; tenantId?: string; branchId?: string }) => Promise<ApiResponse<void>>;
                get: () => Promise<ApiResponse<{ token: string | null; userId: string | null; tenantId: string | null; branchId: string | null }>>;
                clear: () => Promise<ApiResponse<void>>;
            };
            settings: {
                clearSetup: () => Promise<ApiResponse<void>>;
                hasSetup: () => Promise<ApiResponse<boolean>>;
                getSetup: () => Promise<ApiResponse<SetupData>>;
                getSignature: () => Promise<ApiResponse<string>>;
                getActiveBranch: () => Promise<ApiResponse<{
                    branchId: string;
                    tenantId: string;
                    terminalId: string;
                    branch: Branch | null;
                } | null>>;
                setActiveBranch: (branchId: string) => Promise<ApiResponse<{
                    branchId: string;
                    tenantId: string;
                    terminalId: string;
                    branch: Branch | null;
                }>>;
                getAvailableBranches: () => Promise<ApiResponse<Branch[]>>;
                saveSetup: (setupData: SetupData) => Promise<ApiResponse<void>>;
                updateSetup: (updates: Partial<SetupData>) => Promise<ApiResponse<void>>;
            };
            database: {
                getStatus: () => Promise<{
                    initialized: boolean;
                    version: string | null;
                    targetVersion: string;
                    dbPath: string;
                    backupsPath: string;
                } | null>;
            };
            menu: {
                rebuild: (user: User | null, businessType?: BusinessType | null, hiddenNavItemIds?: string[]) => void;
                onLogout: (callback: () => void) => () => void;
                onCheckUpdates: (callback: () => void) => () => void;
                onNavigate: (callback: (route: string) => void) => () => void;
                onOpenModal: (callback: (modalName: string) => void) => () => void;
                onRestoreDatabase: (callback: (filePath: string) => void) => () => void;
            };
            onOnboardingStatus: (callback: (status: any) => void) => void;
        };
    }
}

export function isElectron() {
    return !!(
        (typeof process !== 'undefined' && process.versions && process.versions.electron) ||
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Electron'))
    );
}