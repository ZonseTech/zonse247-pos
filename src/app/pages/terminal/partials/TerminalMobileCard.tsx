import { FC } from 'react';
import { Edit2, Trash2, Monitor, Star, Shield, ShieldOff, RefreshCw, Clock } from 'lucide-react';

interface TerminalMobileCardProps {
    terminal: Terminal;
    onEdit: (terminal: Terminal) => void;
    onDelete: (terminalId: string, terminalLabel: string) => void;
    onToggleBlock: (terminalId: string, isBlocked: boolean) => void;
    onSetPrimary: (terminalId: string, branchId: string) => void;
    onSync: (terminalId: string) => void;
}

const getActivationStatusColor = (status?: string) => {
    switch (status) {
        case 'ACTIVATED':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'DEACTIVATED':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'SUSPENDED':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'BLOCKED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const TerminalMobileCard: FC<TerminalMobileCardProps> = ({
    terminal,
    onEdit,
    onDelete,
    onToggleBlock,
    onSetPrimary,
    onSync,
}) => {
    const statusColorClass = getActivationStatusColor(terminal.activationStatus);

    const formatDate = (date?: string | Date | null): string => {
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
                {/* Terminal Icon */}
                <div className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600 flex-shrink-0">
                    <Monitor className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    {terminal.isPrimary && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                    )}
                    {terminal.isBlocked && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center">
                            <ShieldOff className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Terminal Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                    {terminal.terminalLabel}
                                </h3>
                                {terminal.isPrimary && (
                                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                        Primary
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {terminal.terminalCode}
                                {terminal.deviceId && ` • ${terminal.deviceId}`}
                            </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClass} flex-shrink-0`}>
                            {terminal.activationStatus || 'Unknown'}
                        </span>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-1 mt-2">
                        {terminal.macAddress && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-green-400 dark:bg-green-500 rounded-full" />
                                <span className="truncate font-mono text-xs">{terminal.macAddress}</span>
                            </div>
                        )}
                        {terminal.lastSync && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Last sync: {formatDate(terminal.lastSync)}</span>
                            </div>
                        )}
                        {terminal.isBlocked && terminal.blockingReason && (
                            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                Blocked: {terminal.blockingReason}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex-wrap">
                        <button
                            onClick={() => onSync(terminal.terminalId)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Sync</span>
                        </button>
                        <button
                            onClick={() => onSetPrimary(terminal.terminalId, terminal.branchId)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${terminal.isPrimary
                                    ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                }`}
                        >
                            <Star className={`w-4 h-4 ${terminal.isPrimary ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={() => onToggleBlock(terminal.terminalId, terminal.isBlocked || false)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${terminal.isBlocked
                                    ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                        >
                            {terminal.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                            <span>{terminal.isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>
                        <button
                            onClick={() => onEdit(terminal)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(terminal.terminalId, terminal.terminalLabel)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TerminalMobileListProps {
    terminals: Terminal[];
    onEdit: (terminal: Terminal) => void;
    onDelete: (terminalId: string, terminalLabel: string) => void;
    onToggleBlock: (terminalId: string, isBlocked: boolean) => void;
    onSetPrimary: (terminalId: string, branchId: string) => void;
    onSync: (terminalId: string) => void;
    isLoading?: boolean;
}

export const TerminalMobileList: FC<TerminalMobileListProps> = ({
    terminals,
    onEdit,
    onDelete,
    onToggleBlock,
    onSetPrimary,
    onSync,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {terminals.map((terminal) => (
                <TerminalMobileCard
                    key={terminal.terminalId}
                    terminal={terminal}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleBlock={onToggleBlock}
                    onSetPrimary={onSetPrimary}
                    onSync={onSync}
                />
            ))}
        </div>
    );
};

export default TerminalMobileCard;
