import { ipcMain } from "electron";
import { DatabaseInitializer, SecureSettingsService } from "zonse247-pos-api";

export function setupIPC() {

    ipcMain.handle('settings:save-setup', async (event, setupData) => {
        try {
            await SecureSettingsService.saveAppSetup(setupData);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to save setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-setup', async () => {
        try {
            const setup = await SecureSettingsService.getAppSetup();
            return { success: true, data: setup };
        } catch (error: any) {
            console.error('Failed to get setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:has-setup', async () => {
        try {
            const hasSetup = await SecureSettingsService.hasAppSetup();
            return { success: true, data: hasSetup };
        } catch (error: any) {
            console.error('Failed to check setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-tenant-signature', async () => {
        try {
            const verificationToken = await SecureSettingsService.getTenantSignature();
            return { success: true, data: verificationToken };
        } catch (error: any) {
            console.error('Failed to get verificationToken:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-active-branch', async () => {
        try {
            const activeBranch = await SecureSettingsService.getActiveBranch();
            return { success: true, data: activeBranch };
        } catch (error: any) {
            console.error('Failed to get active branch:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:set-active-branch', async (_event, branchId: string) => {
        try {
            const result = await SecureSettingsService.setActiveBranch(branchId);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('Failed to set active branch:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-available-branches', async () => {
        try {
            const branches = await SecureSettingsService.getAvailableBranches();
            return { success: true, data: branches };
        } catch (error: any) {
            console.error('Failed to get available branches:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:update-setup', async (event, updates) => {
        try {
            await SecureSettingsService.updateAppSetup(updates);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to update setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:clear-setup', async () => {
        try {
            await SecureSettingsService.clearAppSetup();
            return { success: true };
        } catch (error: any) {
            console.error('Failed to clear setup:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:status', async () => {
        try {
            return DatabaseInitializer.getStatus();
        } catch (error) {
            console.error('Failed to get database status:', error);
            return null;
        }
    });

    ipcMain.handle('db:run-migrations', async () => {
        try {
            return await DatabaseInitializer.runMigrations();
        } catch (error) {
            console.error('Failed to run migrations:', error);
            return { success: false, error: String(error) };
        }
    });
}