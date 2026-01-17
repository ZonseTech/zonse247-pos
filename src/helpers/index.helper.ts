declare global {
    interface Window {
        electronAPI: {
            settings: {
                clearSetup: () => Promise<ApiResponse<void>>;
                hasSetup: () => Promise<ApiResponse<boolean>>;
                getSetup: () => Promise<ApiResponse<SetupData>>;
                getSignature: () => Promise<ApiResponse<string>>;
                getActiveBranch: () => Promise<ApiResponse<Branch>>;
                saveSetup: (setupData: SetupData) => Promise<ApiResponse<void>>;
                updateSetup: (updates: Partial<SetupData>) => Promise<ApiResponse<void>>;
            };
            database: {
                getStatus: () => Promise<{
                    initialized: boolean;
                    version: string | null;
                    targetVersion: string;
                    needsMigration: boolean;
                    dbPath: string;
                    backupsPath: string;
                } | null>;
                runMigrations: () => Promise<{
                    success: boolean;
                    migrationsApplied: string[];
                    error?: string;
                }>;
            };
            menu: {
                rebuild: (user: User | null, branches?: Branch[], currentBranchId?: string) => void;
                onLogout: (callback: () => void) => () => void;
                onCheckUpdates: (callback: () => void) => () => void;
                onNavigate: (callback: (route: string) => void) => () => void;
                onOpenModal: (callback: (modalName: string) => void) => () => void;
                onSwitchBranch: (callback: (data: { branchId: string; branchName: string }) => void) => () => void;
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