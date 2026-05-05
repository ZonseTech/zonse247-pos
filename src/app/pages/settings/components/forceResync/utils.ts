import { formatDate as formatDateBase } from '../../../../utils';

/** "Never" if null, otherwise the localized date. */
export const formatLastRun = (iso: string | null): string => {
    if (!iso) return 'Never';
    try {
        return formatDateBase(iso);
    } catch {
        return iso;
    }
};

/** Compact human duration like "1m 32s". */
export const formatDuration = (
    start: string | null,
    end: string | null
): string => {
    if (!start) return '—';
    const from = new Date(start).getTime();
    const to = (end ? new Date(end).getTime() : Date.now()) || from;
    const seconds = Math.max(0, Math.floor((to - from) / 1000));
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/** 0..100 progress derived from completed-vs-total tables. */
export const calcCompletionPercent = (
    tables: ForceResyncTableProgress[]
): number => {
    if (!tables.length) return 0;
    const done = tables.filter(
        (t) => t.status === 'done' || t.status === 'failed' || t.status === 'deferred'
    ).length;
    return Math.min(100, Math.round((done / tables.length) * 100));
};

export const buildSupportPayload = (progress: ForceResyncProgress) => ({
    startedAt: progress.startedAt,
    finishedAt: progress.finishedAt,
    mode: progress.mode,
    totals: {
        processed: progress.totalProcessed,
        accepted: progress.totalAccepted,
        rejected: progress.totalRejected,
        deferred: progress.totalDeferred,
    },
    tables: progress.tables,
    error: progress.error,
});
