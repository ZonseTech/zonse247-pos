import { ipcMain } from "electron";
import { SecureSettingsService } from "../api/services/secure-settings.service";

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
}