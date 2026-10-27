/**
 * Cloud Backup Service - uploads a snapshot of the local SQLite database
 * to the cloud API (/v1/backups) from the Electron main process.
 *
 * The snapshot uses SQLite's online backup API, so it is consistent even
 * while the POS is running. The gzipped file is sent in fixed-size chunks
 * because the server caps request size and duration.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { app } from 'electron';
import axios, { AxiosError, AxiosInstance } from 'axios';
import Database from 'better-sqlite3';
import { DatabaseInitializer, SecureSettingsService } from 'zonse247-pos-api';
import sessionService from './session.service';

const CHUNK_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 60000;

class CloudBackupService {
    private running = false;

    get isRunning(): boolean {
        return this.running;
    }

    private get serverUrl(): string {
        return import.meta.env.VITE_LIVE_API_URL || 'https://api.zonse247.com/v1';
    }

    private async createClient(): Promise<{ client: AxiosInstance; terminalId: string }> {
        const token = sessionService.getToken();
        const setup = await SecureSettingsService.getAppSetup();

        if (!token) {
            throw new Error('Please log in before backing up.');
        }
        if (!setup?.tenantId || !setup?.branchId || !setup?.terminalId) {
            throw new Error('This terminal is not set up yet.');
        }

        const client = axios.create({
            baseURL: this.serverUrl,
            timeout: REQUEST_TIMEOUT_MS,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            headers: {
                Authorization: `Bearer ${token}`,
                'x-client-type': 'desktop',
                'x-tenant-id': setup.tenantId,
                'x-branch-id': setup.branchId,
                'x-terminal-id': setup.terminalId,
            },
        });

        return { client, terminalId: setup.terminalId };
    }

    private toFriendlyError(error: unknown): Error {
        if (error instanceof AxiosError) {
            if (!error.response) {
                return new Error('Could not reach the server. Check the internet connection and try again.');
            }
            if (error.response.status === 401) {
                return new Error('Your session has expired. Please log in again and retry.');
            }
            const message = (error.response.data as { message?: string } | undefined)?.message;
            return new Error(message || `Server responded with ${error.response.status}`);
        }
        return error instanceof Error ? error : new Error('Backup failed');
    }

    private async sha256(filePath: string): Promise<string> {
        const hash = crypto.createHash('sha256');
        await pipeline(fs.createReadStream(filePath), hash);
        return hash.digest('hex');
    }

    private async putChunk(client: AxiosInstance, uploadId: string, index: number, data: Buffer): Promise<void> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= CHUNK_RETRIES; attempt++) {
            try {
                await client.put(`/backups/uploads/${uploadId}/chunks/${index}`, data, {
                    headers: { 'Content-Type': 'application/octet-stream' },
                });
                return;
            } catch (error) {
                lastError = error;
                const status = error instanceof AxiosError ? error.response?.status : undefined;
                if (status && status >= 400 && status < 500) break;
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw lastError;
    }

    async upload(onProgress: (progress: CloudBackupProgress) => void): Promise<CloudBackupInfo> {
        if (this.running) {
            throw new Error('A backup is already in progress.');
        }
        this.running = true;

        const workDir = path.join(app.getPath('temp'), 'zonse247-backup');
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const snapshotPath = path.join(workDir, `${stamp}.db`);
        const gzipPath = `${snapshotPath}.gz`;

        try {
            const { client, terminalId } = await this.createClient();

            onProgress({ phase: 'preparing', percent: 0 });
            const status = await DatabaseInitializer.getStatus();
            if (!status.initialized || !status.dbPath || !fs.existsSync(status.dbPath)) {
                throw new Error('Local database not found.');
            }

            await fsp.mkdir(workDir, { recursive: true });
            const db = new Database(status.dbPath, { fileMustExist: true });
            try {
                await db.backup(snapshotPath, {
                    progress: ({ totalPages, remainingPages }) => {
                        if (totalPages > 0) {
                            onProgress({ phase: 'preparing', percent: Math.round(((totalPages - remainingPages) / totalPages) * 100) });
                        }
                    },
                });
            } finally {
                db.close();
            }

            onProgress({ phase: 'compressing', percent: 0 });
            await pipeline(fs.createReadStream(snapshotPath), zlib.createGzip({ level: 6 }), fs.createWriteStream(gzipPath));
            const totalSize = (await fsp.stat(gzipPath)).size;
            const sha256 = await this.sha256(gzipPath);
            onProgress({ phase: 'compressing', percent: 100 });

            const chunkSizeHint = 5 * 1024 * 1024;
            const created = await client.post('/backups/uploads', {
                terminalId,
                totalSize,
                totalChunks: Math.ceil(totalSize / chunkSizeHint),
                sha256,
            });
            const { uploadId, chunkSize } = created.data.data as { uploadId: string; chunkSize: number };
            if (chunkSize !== chunkSizeHint) {
                throw new Error('Server backup chunk size changed. Please update the app.');
            }

            const totalChunks = Math.ceil(totalSize / chunkSize);
            const handle = await fsp.open(gzipPath, 'r');
            try {
                for (let index = 0; index < totalChunks; index++) {
                    const length = Math.min(chunkSize, totalSize - index * chunkSize);
                    const buffer = Buffer.alloc(length);
                    await handle.read(buffer, 0, length, index * chunkSize);
                    await this.putChunk(client, uploadId, index, buffer);
                    onProgress({ phase: 'uploading', percent: Math.round(((index + 1) / totalChunks) * 100) });
                }
            } finally {
                await handle.close();
            }

            onProgress({ phase: 'finalizing', percent: 100 });
            const completed = await client.post(`/backups/uploads/${uploadId}/complete`);
            return completed.data.data as CloudBackupInfo;
        } catch (error) {
            throw this.toFriendlyError(error);
        } finally {
            this.running = false;
            await fsp.rm(snapshotPath, { force: true }).catch(() => undefined);
            await fsp.rm(gzipPath, { force: true }).catch(() => undefined);
        }
    }

    async getLatest(): Promise<CloudBackupInfo | null> {
        try {
            const { client, terminalId } = await this.createClient();
            const response = await client.get(`/backups/terminals/${terminalId}/latest`);
            return (response.data.data as CloudBackupInfo | null) ?? null;
        } catch (error) {
            throw this.toFriendlyError(error);
        }
    }
}

const cloudBackupService = new CloudBackupService();
export default cloudBackupService;
