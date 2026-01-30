import type { FunctionComponent } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import classNames from 'classnames';
import { useSync } from '../../hooks/useSync';
import { useIsEBN } from '../../hooks/useMediaQuery';
import type { SyncButtonProps } from './types';

const SyncButton: FunctionComponent<SyncButtonProps> = ({ isCompact = false }) => {
    const { isSyncing, pendingCount, startSync } = useSync();
    const isEBN = useIsEBN();

    return (
        <button
            onClick={() => startSync()}
            disabled={isSyncing}
            className={classNames(
                "relative flex items-center gap-2 rounded-xl transition-all duration-200",
                isEBN ? "p-1.5" : "p-2.5",
                isSyncing
                    ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 cursor-wait"
                    : pendingCount > 0
                        ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                        : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            )}
            aria-label={isSyncing ? "Syncing..." : `${pendingCount} documents pending sync`}
            title={isSyncing ? "Syncing in progress..." : pendingCount > 0 ? `${pendingCount} documents need syncing` : "All synced"}
        >
            {isSyncing ? (
                <RefreshCw size={isEBN ? 14 : 20} className="animate-spin" />
            ) : (
                <>
                    <FileText size={isEBN ? 14 : 20} />
                    {pendingCount > 0 && (
                        <span className={classNames(
                            "absolute flex items-center justify-center font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-1",
                            isEBN ? "-top-0.5 -right-0.5 min-w-[14px] h-[14px] text-[8px]" : "-top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px]"
                        )}>
                            {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

export default SyncButton;
