declare global {
    interface Window {
        electronAPI: {
            settings: {
                clearSetup: () => Promise<ApiResponse<void>>;
                hasSetup: () => Promise<ApiResponse<boolean>>;
                getSetup: () => Promise<ApiResponse<SetupData>>;
                getSignature: () => Promise<ApiResponse<string>>;
                saveSetup: (setupData: SetupData) => Promise<ApiResponse<void>>;
                updateSetup: (updates: Partial<SetupData>) => Promise<ApiResponse<void>>;
            };
            menu: {
                rebuild: (user: User) => void;
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