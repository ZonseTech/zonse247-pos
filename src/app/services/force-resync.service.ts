/**
 * force-resync.service.ts
 *
 * Stateless helpers + a Runner class that orchestrates the chunked, cancellable,
 * resumable force-resync flow described in
 * docs/FORCE_DATA_SYNC_FRONTEND_GUIDE.md.
 *
 * Kept separate from `sync.service.ts` (which is a thin HTTP wrapper) so the
 * orchestration code can be unit-tested without React/hooks.
 */

import {
    FORCE_RESYNC_LIMITS,
    FORCE_RESYNC_TABLE_ORDER,
    syncService,
    withRetry,
    sleep,
    extractApiErrorMessage,
} from './sync.service';

// ─── Local persistence keys ─────────────────────────────────────────────────
export const FORCE_RESYNC_STORAGE_KEYS = Object.freeze({
    LOCK: 'zonse.forceResync.lock',
    LAST_RUN: 'zonse.forceResync.lastRunAt',
    CURSORS: 'zonse.forceResync.cursors',
});

const STALE_LOCK_MS = 5 * 60_000;

export const forceResyncStorage = {
    getLastRun(): string | null {
        try {
            return localStorage.getItem(FORCE_RESYNC_STORAGE_KEYS.LAST_RUN);
        } catch {
            return null;
        }
    },
    setLastRun(iso: string): void {
        try {
            localStorage.setItem(FORCE_RESYNC_STORAGE_KEYS.LAST_RUN, iso);
        } catch {
            /* quota / privacy mode */
        }
    },
    readCursors(): Partial<Record<ForceResyncTable, string | null>> {
        try {
            const raw = localStorage.getItem(FORCE_RESYNC_STORAGE_KEYS.CURSORS);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    },
    writeCursors(cursors: Partial<Record<ForceResyncTable, string | null>>): void {
        try {
            localStorage.setItem(
                FORCE_RESYNC_STORAGE_KEYS.CURSORS,
                JSON.stringify(cursors)
            );
        } catch {
            /* noop */
        }
    },
    clearCursors(): void {
        try {
            localStorage.removeItem(FORCE_RESYNC_STORAGE_KEYS.CURSORS);
        } catch {
            /* noop */
        }
    },
    tryAcquireLock(): boolean {
        try {
            const existing = localStorage.getItem(FORCE_RESYNC_STORAGE_KEYS.LOCK);
            if (existing) {
                const ts = Number(existing);
                if (!Number.isFinite(ts) || Date.now() - ts > STALE_LOCK_MS) {
                    localStorage.removeItem(FORCE_RESYNC_STORAGE_KEYS.LOCK);
                } else {
                    return false;
                }
            }
            localStorage.setItem(
                FORCE_RESYNC_STORAGE_KEYS.LOCK,
                String(Date.now())
            );
            return true;
        } catch {
            return true; // best-effort
        }
    },
    releaseLock(): void {
        try {
            localStorage.removeItem(FORCE_RESYNC_STORAGE_KEYS.LOCK);
        } catch {
            /* noop */
        }
    },
    isLocked(): boolean {
        try {
            return Boolean(localStorage.getItem(FORCE_RESYNC_STORAGE_KEYS.LOCK));
        } catch {
            return false;
        }
    },
};

// ─── Optional desktop bridge for push-side operations ───────────────────────
export interface ForceResyncBridge {
    fetchPendingChunk?: (
        table: ForceResyncTable,
        cursor: string | null,
        limit: number
    ) => Promise<{ records: any[]; nextCursor: string | null }>;
    markSynced?: (table: ForceResyncTable, ids: string[]) => Promise<void>;
    applyPulledRecords?: (
        payload: Partial<Record<ForceResyncTable, { records: any[] }>>
    ) => Promise<void>;
    resetWatermark?: () => Promise<void>;
}

export function getForceResyncBridge(): ForceResyncBridge | undefined {
    const w = window as any;
    return w?.electronAPI?.sync as ForceResyncBridge | undefined;
}

// ─── Adaptive chunk-size policy (§5) ────────────────────────────────────────
export function adaptChunkSize(currentLimit: number, elapsedMs: number): number {
    if (elapsedMs > 10_000) {
        return Math.max(
            FORCE_RESYNC_LIMITS.MIN_CHUNK_SIZE,
            Math.floor(currentLimit / 2)
        );
    }
    if (elapsedMs < 1_000) {
        return Math.min(FORCE_RESYNC_LIMITS.MAX_CHUNK_SIZE, currentLimit * 2);
    }
    return currentLimit;
}

// ─── Runner ─────────────────────────────────────────────────────────────────
export interface RunnerOptions {
    mode: ForceResyncMode;
    tables: ForceResyncTable[];
    chunkSize: number;
    resume: boolean;
    signal: AbortSignal;
    bridge?: ForceResyncBridge;
}

export interface TableEvent {
    table: ForceResyncTable;
    patch?: Partial<ForceResyncTableProgress>;
    deltas?: {
        processed?: number;
        accepted?: number;
        rejected?: number;
        deferred?: number;
    };
}

export type RunnerListener = (event: TableEvent) => void;

/**
 * Run the pull-side of the force resync (server → desktop).
 */
export async function runPullForce(
    opts: RunnerOptions,
    emit: RunnerListener
): Promise<void> {
    const { tables, signal, bridge } = opts;
    let limit = opts.chunkSize;

    for (const table of tables) {
        if (signal.aborted) return;
        emit({ table, patch: { status: 'running' } });
        let since: string | null = null; // force = ignore watermark

        while (!signal.aborted) {
            const start = Date.now();
            try {
                const data = await withRetry(
                    () => syncService.pullChanges({ since, tables: [table], limit }, signal),
                    { signal }
                );

                const tablePayload = (data as any)[table] as
                    | ForceResyncOperationResult
                    | undefined;
                const records = tablePayload?.records ?? [];
                const errors = tablePayload?.errors ?? [];

                if (records.length === 0) {
                    emit({ table, patch: { status: 'done' } });
                    break;
                }

                if (bridge?.applyPulledRecords) {
                    try {
                        await bridge.applyPulledRecords({ [table]: { records } } as any);
                    } catch (err: any) {
                        emit({
                            table,
                            patch: { errors: [`apply failed: ${err?.message ?? err}`] },
                        });
                    }
                }

                since = data.serverTime ?? new Date().toISOString();
                emit({
                    table,
                    patch: errors.length
                        ? { errors: errors.map((e) => e.message) }
                        : undefined,
                    deltas: {
                        processed: records.length,
                        accepted: records.length - errors.length,
                        rejected: errors.length,
                    },
                });

                limit = adaptChunkSize(limit, Date.now() - start);
                await sleep(0, signal);
            } catch (err: any) {
                const inner = err?.error ?? err;
                if (inner?.name === 'AbortError' || inner?.name === 'CanceledError') return;
                emit({
                    table,
                    patch: {
                        status: 'deferred',
                        errors: [extractApiErrorMessage(err)],
                    },
                    deltas: { deferred: 1 },
                });
                break;
            }
        }
    }
}

/**
 * Run the push-side of the force resync (desktop → server). Requires the
 * optional Electron bridge to read local SQLite chunks.
 */
export async function runPushForce(
    opts: RunnerOptions,
    emit: RunnerListener
): Promise<void> {
    const { tables, signal, bridge } = opts;
    if (!bridge?.fetchPendingChunk) {
        throw new Error(
            'Push-side force resync requires the desktop bridge (window.electronAPI.sync). Run from the Electron desktop app.'
        );
    }

    const cursors = forceResyncStorage.readCursors();
    let limit = opts.chunkSize;

    for (const table of tables) {
        if (signal.aborted) return;
        emit({ table, patch: { status: 'running' } });
        let cursor: string | null = cursors[table] ?? null;

        while (!signal.aborted) {
            let chunk: { records: any[]; nextCursor: string | null };
            try {
                chunk = await bridge.fetchPendingChunk(table, cursor, limit);
            } catch (err: any) {
                emit({
                    table,
                    patch: {
                        status: 'failed',
                        errors: [`local read failed: ${err?.message ?? err}`],
                    },
                });
                break;
            }

            if (!chunk.records.length) {
                emit({ table, patch: { status: 'done' } });
                cursors[table] = null;
                forceResyncStorage.writeCursors(cursors);
                break;
            }

            const start = Date.now();
            try {
                const result = await withRetry(
                    () => syncService.pushTableRecords(table, chunk.records, signal),
                    { signal }
                );
                const accepted = result.accepted ?? chunk.records.length;
                const rejected = result.rejected ?? result.errors?.length ?? 0;

                if (bridge.markSynced) {
                    const ids = chunk.records.map((r: any) => r.id).filter(Boolean);
                    if (ids.length) await bridge.markSynced(table, ids).catch(() => { });
                }

                emit({
                    table,
                    patch: rejected
                        ? { errors: (result.errors ?? []).map((e) => e.message) }
                        : undefined,
                    deltas: {
                        processed: chunk.records.length,
                        accepted,
                        rejected,
                    },
                });

                cursor = chunk.nextCursor;
                cursors[table] = cursor;
                forceResyncStorage.writeCursors(cursors);

                limit = adaptChunkSize(limit, Date.now() - start);
                await sleep(0, signal);
            } catch (err: any) {
                const inner = err?.error ?? err;
                if (inner?.name === 'AbortError' || inner?.name === 'CanceledError') return;
                emit({
                    table,
                    patch: {
                        status: 'deferred',
                        errors: [extractApiErrorMessage(err)],
                    },
                    deltas: { deferred: chunk.records.length },
                });
                break;
            }
        }
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
export function buildInitialProgress(
    mode: ForceResyncMode,
    tables: ForceResyncTable[]
): ForceResyncProgress {
    return {
        status: 'idle',
        mode,
        startedAt: null,
        finishedAt: null,
        currentTable: null,
        totalProcessed: 0,
        totalAccepted: 0,
        totalRejected: 0,
        totalDeferred: 0,
        tables: tables.map((t) => ({
            table: t,
            processed: 0,
            accepted: 0,
            rejected: 0,
            deferred: 0,
            status: 'pending',
            errors: [],
        })),
    };
}

export function clampChunkSize(value: number | undefined): number {
    const v = value ?? FORCE_RESYNC_LIMITS.DEFAULT_CHUNK_SIZE;
    return Math.min(
        FORCE_RESYNC_LIMITS.MAX_CHUNK_SIZE,
        Math.max(FORCE_RESYNC_LIMITS.MIN_CHUNK_SIZE, v)
    );
}

export const DEFAULT_FORCE_RESYNC_TABLES = FORCE_RESYNC_TABLE_ORDER;
