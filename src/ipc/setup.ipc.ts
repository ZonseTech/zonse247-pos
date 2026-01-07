import { ipcMain } from "electron";

// Get SecureSettingsService dynamically to avoid loading the module before DATABASE_URL is set
const getSecureSettingsService = async () => {
    const { SecureSettingsService } = await import("zonse247-pos-api");
    return SecureSettingsService;
};

export function setupIPC() {

    ipcMain.handle('settings:save-setup', async (event, setupData) => {
        try {
            const SecureSettingsService = await getSecureSettingsService();
            await SecureSettingsService.saveAppSetup(setupData);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to save setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-setup', async () => {
        try {
            const SecureSettingsService = await getSecureSettingsService();
            const setup = await SecureSettingsService.getAppSetup();
            return { success: true, data: setup };
        } catch (error: any) {
            console.error('Failed to get setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:has-setup', async () => {
        try {
            const SecureSettingsService = await getSecureSettingsService();
            const hasSetup = await SecureSettingsService.hasAppSetup();
            return { success: true, data: hasSetup };
        } catch (error: any) {
            console.error('Failed to check setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-tenant-signature', async () => {
        try {
            const SecureSettingsService = await getSecureSettingsService();
            const verificationToken = await SecureSettingsService.getTenantSignature();
            return { success: true, data: verificationToken };
        } catch (error: any) {
            console.error('Failed to get verificationToken:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:update-setup', async (event, updates) => {
        try {
            const SecureSettingsService = await getSecureSettingsService();
            await SecureSettingsService.updateAppSetup(updates);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to update setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:clear-setup', async () => {
        try {
            const SecureSettingsService = await getSecureSettingsService();
            await SecureSettingsService.clearAppSetup();
            return { success: true };
        } catch (error: any) {
            console.error('Failed to clear setup:', error);
            return { success: false, error: error.message };
        }
    });
}