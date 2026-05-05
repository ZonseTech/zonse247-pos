/**
 * useForceResync — orchestrates a chunked, cancellable, retried force resync
 * against the zonse247 POS sync API.
 *
 * UI rules implemented (see docs/FORCE_DATA_SYNC_FRONTEND_GUIDE.md):
 *   • single-flight (cross-window lock)
 *   • cancel between chunks (AbortController)
 *   • progress, ETA, totals
 *   • resumable cursors
 *   • non-blocking (yields between chunks)
 *
 * Push-side / bidirectional modes require the Electron bridge
 * (`window.electronAPI.sync`); pull-side is fully self-contained against the
 * server and is the safe default.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Notify } from 'notiflix';
import {
    DEFAULT_FORCE_RESYNC_TABLES,
    buildInitialProgress,
    clampChunkSize,
    forceResyncStorage,
    getForceResyncBridge,
    runPullForce,
    runPushForce,
    type TableEvent,
} from '../services/force-resync.service';
import { extractApiErrorMessage } from '../services/sync.service';

interface ForceResyncOptions {
    mode?: ForceResyncMode;
    tables?: ForceResyncTable[];
    chunkSize?: number;
    resume?: boolean;
}

type Action =
    | { type: 'START'; mode: ForceResyncMode; tables: ForceResyncTable[]; startedAt: string }
    | { type: 'TABLE_EVENT'; event: TableEvent }
    | { type: 'CANCELLING' }
    | { type: 'COMPLETE'; finishedAt: string }
    | { type: 'FAIL'; finishedAt: string; error?: string };

const MAX_TABLE_ERRORS = 50;

const reducer = (state: ForceResyncProgress, action: Action): ForceResyncProgress => {
    switch (action.type) {
        case 'START':
            return {
                ...buildInitialProgress(action.mode, action.tables),
                status: 'running',
                startedAt: action.startedAt,
            };

        case 'TABLE_EVENT': {
            const { table, patch, deltas } = action.event;
            const tables = state.tables.map((t) => {
                if (t.table !== table) return t;
                const merged: ForceResyncTableProgress = {
                    ...t,
                    ...patch,
                    processed: t.processed + (deltas?.processed ?? 0),
                    accepted: t.accepted + (deltas?.accepted ?? 0),
                    rejected: t.rejected + (deltas?.rejected ?? 0),
                    deferred: t.deferred + (deltas?.deferred ?? 0),
                    errors: patch?.errors
                        ? [...t.errors, ...patch.errors].slice(-MAX_TABLE_ERRORS)
                        : t.errors,
                };
                return merged;
            });
            return {
                ...state,
                tables,
                currentTable: patch?.status === 'running' ? table : state.currentTable,
                totalProcessed: state.totalProcessed + (deltas?.processed ?? 0),
                totalAccepted: state.totalAccepted + (deltas?.accepted ?? 0),
                totalRejected: state.totalRejected + (deltas?.rejected ?? 0),
                totalDeferred: state.totalDeferred + (deltas?.deferred ?? 0),
            };
        }

        case 'CANCELLING':
            return { ...state, status: 'cancelling' };

        case 'COMPLETE':
            return {
                ...state,
                status: 'completed',
                currentTable: null,
                finishedAt: action.finishedAt,
                error: undefined,
            };

        case 'FAIL':
            return {
                ...state,
                status: 'failed',
                currentTable: null,
                finishedAt: action.finishedAt,
                error: action.error,
            };

        default:
            return state;
    }
};

export const useForceResync = () => {
    const [progress, dispatch] = useReducer(
        reducer,
        buildInitialProgress('pull', DEFAULT_FORCE_RESYNC_TABLES)
    );
    const [lastRunAt, setLastRunAt] = useState<string | null>(() =>
        forceResyncStorage.getLastRun()
    );
    const ctrlRef = useRef<AbortController | null>(null);
    const isRunningRef = useRef(false);

    // Abort the in-flight run if the user reloads the window.
    useEffect(() => {
        const onUnload = () => {
            if (isRunningRef.current) ctrlRef.current?.abort();
        };
        window.addEventListener('beforeunload', onUnload);
        return () => window.removeEventListener('beforeunload', onUnload);
    }, []);

    const cancel = useCallback(() => {
        if (!isRunningRef.current) return;
        dispatch({ type: 'CANCELLING' });
        ctrlRef.current?.abort();
    }, []);

    const start = useCallback(async (options: ForceResyncOptions = {}) => {
        if (isRunningRef.current) return;
        if (!forceResyncStorage.tryAcquireLock()) {
            Notify.warning('Another force resync is already running.');
            return;
        }

        const mode = options.mode ?? 'pull';
        const tables = options.tables ?? DEFAULT_FORCE_RESYNC_TABLES;
        const chunkSize = clampChunkSize(options.chunkSize);

        if (!options.resume) forceResyncStorage.clearCursors();

        const startedAt = new Date().toISOString();
        ctrlRef.current = new AbortController();
        isRunningRef.current = true;
        dispatch({ type: 'START', mode, tables, startedAt });

        const emit = (event: TableEvent) => dispatch({ type: 'TABLE_EVENT', event });
        const bridge = getForceResyncBridge();

        try {
            if (mode !== 'pull' && bridge?.resetWatermark) {
                await bridge.resetWatermark().catch(() => { });
            }

            const runnerOpts = {
                mode,
                tables,
                chunkSize,
                resume: options.resume ?? false,
                signal: ctrlRef.current.signal,
                bridge,
            };

            if (mode === 'pull') {
                await runPullForce(runnerOpts, emit);
            } else if (mode === 'push') {
                await runPushForce(runnerOpts, emit);
            } else {
                await runPushForce(runnerOpts, emit);
                if (!ctrlRef.current.signal.aborted) {
                    await runPullForce(runnerOpts, emit);
                }
            }

            const finishedAt = new Date().toISOString();
            if (ctrlRef.current.signal.aborted) {
                dispatch({ type: 'FAIL', finishedAt, error: 'Cancelled by user' });
                Notify.info('Force resync cancelled.');
            } else {
                dispatch({ type: 'COMPLETE', finishedAt });
                forceResyncStorage.setLastRun(finishedAt);
                setLastRunAt(finishedAt);
                Notify.success('Force resync complete.');
            }
        } catch (err: any) {
            const finishedAt = new Date().toISOString();
            const message =
                err?.response?.data?.message ?? err?.message ?? 'Force resync failed';
            dispatch({ type: 'FAIL', finishedAt, error: message });
            Notify.failure(`Force resync failed: ${message}`);
        } finally {
            isRunningRef.current = false;
            ctrlRef.current = null;
            forceResyncStorage.releaseLock();
        }
    }, []);

    const isRunning =
        progress.status === 'running' || progress.status === 'cancelling';

    return {
        progress,
        lastRunAt,
        isRunning,
        isLocked: forceResyncStorage.isLocked,
        bridgeAvailable: Boolean(getForceResyncBridge()?.fetchPendingChunk),
        start,
        cancel,
    };
};

export default useForceResync;
