import { ipcMain } from "electron";
import { DatabaseInitializer, SecureSettingsService } from "zonse247-pos-api";
import sessionService from "../services/session.service";

export function setupIPC() {

    ipcMain.handle('session:set-token', async (_event, token: string | null) => {
        try {
            sessionService.setToken(token);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('session:get-token', async () => {
        try {
            const token = sessionService.getToken();
            return { success: true, data: token };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('session:set', async (_event, data: { token?: string; userId?: string; tenantId?: string; branchId?: string }) => {
        try {
            sessionService.setSession(data);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('session:clear', async () => {
        try {
            sessionService.clearSession();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('session:get', async () => {
        try {
            const session = sessionService.getSession();
            return { success: true, data: session };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:save-setup', async (event, setupData) => {
        try {
            await SecureSettingsService.saveAppSetup(setupData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-setup', async () => {
        try {
            const setup = await SecureSettingsService.getAppSetup();
            return { success: true, data: setup };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:has-setup', async () => {
        try {
            const hasSetup = await SecureSettingsService.hasAppSetup();
            return { success: true, data: hasSetup };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-tenant-signature', async () => {
        try {
            const verificationToken = await SecureSettingsService.getTenantSignature();
            return { success: true, data: verificationToken };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-active-branch', async () => {
        try {
            const activeBranch = await SecureSettingsService.getActiveBranch();
            return { success: true, data: activeBranch };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:set-active-branch', async (_event, branchId: string) => {
        try {
            const result = await SecureSettingsService.setActiveBranch(branchId);
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:get-available-branches', async () => {
        try {
            const branches = await SecureSettingsService.getAvailableBranches();
            return { success: true, data: branches };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:update-setup', async (event, updates) => {
        try {
            await SecureSettingsService.updateAppSetup(updates);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:clear-setup', async () => {
        try {
            await SecureSettingsService.clearAppSetup();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:status', async () => {
        try {
            return DatabaseInitializer.getStatus();
        } catch (error) {
            return null;
        }
    });
}