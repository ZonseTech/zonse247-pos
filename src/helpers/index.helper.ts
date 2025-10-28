declare global {
    interface Window {
        electronAPI: {
            settings: {
                saveSetup: (setupData: SetupData) => Promise<ApiResponse<void>>;
                getSetup: () => Promise<ApiResponse<SetupData>>;
                hasSetup: () => Promise<ApiResponse<boolean>>;
                getSignature: () => Promise<ApiResponse<string>>;
                updateSetup: (updates: Partial<SetupData>) => Promise<ApiResponse<void>>;
                clearSetup: () => Promise<ApiResponse<void>>;
            };
            menu: {
                onNavigate: (callback: (route: string) => void) => () => void;
                onOpenModal: (callback: (modalName: string) => void) => () => void;
                onLogout: (callback: () => void) => () => void;
                onRestoreDatabase: (callback: (filePath: string) => void) => () => void;
                onCheckUpdates: (callback: () => void) => () => void;
            };
            onOnboardingStatus: (callback: (status: any) => void) => void;
        };
    }
}

export const isElectron = (): boolean => {
    return typeof window !== 'undefined' &&
        window.electronAPI !== undefined;
};