import crypto from 'crypto';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { SettingsModel } from '../models/settings.model';

export class SecureSettingsService {
    private static readonly KEY_LENGTH = 32;
    private static readonly IV_LENGTH = 16;
    private static readonly AUTH_TAG_LENGTH = 16;
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static encryptionKey: Buffer | null = null;

    static async initialize(): Promise<void> {
        try {
            const keyPath = path.join(app.getPath('userData'), '.keystore');

            try {
                const existingKey = await fs.readFile(keyPath);
                this.encryptionKey = existingKey;
                console.log('Encryption key loaded from keystore');
                return;
            } catch (error) {
            }

            const machineId = await this.getMachineId();
            const appSalt = 'pos-terminal-app-v1';

            this.encryptionKey = crypto.pbkdf2Sync(
                machineId,
                appSalt,
                100000,
                this.KEY_LENGTH,
                'sha256'
            );

            console.log('====================================');
            console.log(this.encryptionKey);
            console.log('====================================');

            await fs.writeFile(keyPath, this.encryptionKey, { mode: 0o600 });
            console.log('New encryption key generated and stored');
        } catch (error) {
            console.error('Error initializing encryption:', error);
            throw new Error('Failed to initialize encryption');
        }
    }

    private static async getMachineId(): Promise<string> {
        const os = require('os');

        const identifiers = [
            os.hostname(),
            os.platform(),
            os.arch(),
            os.cpus()[0]?.model || 'unknown',
        ].join('|');

        return identifiers;
    }

    private static encrypt(text: string): EncryptionResult {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized. Call initialize() first.');
        }

        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.encryptionKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encrypted: encrypted + authTag.toString('hex'),
            iv: iv.toString('hex'),
        };
    }

    private static decrypt(encrypted: string, ivHex: string): string {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized. Call initialize() first.');
        }

        const iv = Buffer.from(ivHex, 'hex');

        const encryptedData = encrypted.slice(0, -this.AUTH_TAG_LENGTH * 2);
        const authTag = Buffer.from(encrypted.slice(-this.AUTH_TAG_LENGTH * 2), 'hex');

        const decipher = crypto.createDecipheriv(this.ALGORITHM, this.encryptionKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    private static setTenantSignature(settings: CreateSettingRequest): string {
        const dataString = `${settings.tenantId}|${settings.branchId}|${settings.terminalId}`;
        const hmac = crypto.createHmac('sha256', this.encryptionKey || 'fallback');
        hmac.update(dataString);
        return hmac.digest('hex');
    }

    static async store(settingsData: CreateSettingRequest): Promise<TerminalSettings> {
        try {
            if (!this.encryptionKey) {
                await this.initialize();
            }

            const { encrypted, iv } = this.encrypt(settingsData.authKey);

            const dataToStore = {
                ...settingsData,
                encryptedAuthKey: encrypted,
                iv: iv,
                authKey: undefined,
            };

            const settings = await SettingsModel.create(dataToStore);

            settings.tenantSignature = this.setTenantSignature(settingsData);

            return {
                ...settings,
                authKey: settingsData.authKey,
            };
        } catch (error) {
            console.error('Error in settings service - store:', error);
            throw error;
        }
    }

    /**
     * Retrieve settings and decrypt authKey
     */
    static async retrieve(settingsId?: string): Promise<TerminalSettings | null> {
        try {
            if (!this.encryptionKey) {
                await this.initialize();
            }

            // Retrieve from database
            const settings = await SettingsModel.findOne(settingsId);

            if (!settings) {
                return null;
            }

            // Decrypt authKey
            const authKey = this.decrypt(settings.encryptedAuthKey, settings.iv);

            return {
                ...settings,
                authKey,
            };
        } catch (error) {
            console.error('Error in settings service - retrieve:', error);
            throw error;
        }
    }

    /**
     * Verify tenant signature
     */
    static verifySignature(settings: TerminalSettings): boolean {
        const expectedSignature = this.setTenantSignature(settings);
        return crypto.timingSafeEqual(
            Buffer.from(settings.tenantSignature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Update settings
     */
    static async update(
        settingsId: string,
        updateData: Partial<CreateSettingRequest>
    ): Promise<TerminalSettings> {
        try {
            if (!this.encryptionKey) {
                await this.initialize();
            }

            const existing = await this.retrieve(settingsId);
            if (!existing) {
                throw new Error('Settings not found');
            }

            // If authKey is being updated, encrypt it
            let encryptedUpdate = { ...updateData };
            if (updateData.authKey) {
                const { encrypted, iv } = this.encrypt(updateData.authKey);
                encryptedUpdate = {
                    ...updateData,
                    encryptedAuthKey: encrypted,
                    iv: iv,
                    authKey: undefined,
                };
            }

            // Update in database
            const updated = await SettingsModel.update(settingsId, encryptedUpdate);

            // Update signature
            const fullSettings = { ...existing, ...updateData };
            updated.tenantSignature = this.setTenantSignature(fullSettings);

            return this.retrieve(settingsId);
        } catch (error) {
            console.error('Error in settings service - update:', error);
            throw error;
        }
    }

    /**
     * Clear all settings (for logout/reset)
     */
    static async clear(): Promise<void> {
        try {
            await SettingsModel.deleteAll();
            console.log('Settings cleared');
        } catch (error) {
            console.error('Error clearing settings:', error);
            throw error;
        }
    }

    /**
     * Check if settings exist (for onboarding check)
     */
    static async hasSettings(): Promise<boolean> {
        try {
            const settings = await SettingsModel.findOne();
            return settings !== null;
        } catch (error) {
            console.error('Error checking settings:', error);
            return false;
        }
    }
}
