import { Fragment, FunctionComponent } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, Monitor, Star, Shield, ShieldOff, RefreshCw, Copy, Check } from 'lucide-react';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';
import { useState } from 'react';
import { Notify } from 'notiflix';

interface TerminalActionsProps {
    terminal: Terminal;
    onEdit: (terminal: Terminal) => void;
    onDelete: (terminalId: string, terminalLabel: string) => void;
    onToggleBlock: (terminalId: string, isBlocked: boolean) => void;
    onSetPrimary: (terminalId: string, branchId: string) => void;
    onSync: (terminalId: string) => void;
}

const TerminalActions: FunctionComponent<TerminalActionsProps> = ({
    terminal,
    onEdit,
    onDelete,
    onToggleBlock,
    onSetPrimary,
    onSync
}) => {
    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={() => onSync(terminal.terminalId)}
                className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                title="Sync terminal"
            >
                <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
            </button>

            <button
                onClick={() => onSetPrimary(terminal.terminalId, terminal.branchId)}
                className={`group p-2 rounded-lg transition-all duration-200 ${terminal.isPrimary
                    ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                title={terminal.isPrimary ? 'Remove as primary' : 'Set as primary'}
            >
                <Star className={`w-4 h-4 transition-transform group-hover:scale-110 ${terminal.isPrimary ? 'fill-current' : ''}`} />
            </button>

            <button
                onClick={() => onToggleBlock(terminal.terminalId, terminal.isBlocked || false)}
                className={`group p-2 rounded-lg transition-all duration-200 ${terminal.isBlocked
                    ? 'text-red-500 dark:text-red-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                title={terminal.isBlocked ? 'Unblock terminal' : 'Block terminal'}
            >
                {terminal.isBlocked ? (
                    <ShieldOff className="w-4 h-4 transition-transform group-hover:scale-110" />
                ) : (
                    <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
                )}
            </button>

            <button
                onClick={() => onEdit(terminal)}
                className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                title="Edit terminal"
            >
                <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            <button
                onClick={() => onDelete(terminal.terminalId, terminal.terminalLabel)}
                className="group p-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                title="Delete terminal"
            >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
        </div>
    );
};

export const getActivationStatusColor = (status?: TerminalActivationStatus): string => {
    switch (status) {
        case 'ACTIVATED':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
        case 'PENDING':
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
        case 'DEACTIVATED':
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        case 'SUSPENDED':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
        case 'BLOCKED':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
};

const getStatusDotColor = (status?: TerminalActivationStatus): string => {
    switch (status) {
        case 'ACTIVATED':
            return 'bg-green-400 dark:bg-green-300';
        case 'PENDING':
            return 'bg-yellow-400 dark:bg-yellow-300';
        case 'DEACTIVATED':
            return 'bg-gray-400 dark:bg-gray-500';
        case 'SUSPENDED':
            return 'bg-orange-400 dark:bg-orange-300';
        case 'BLOCKED':
            return 'bg-red-400 dark:bg-red-300';
        default:
            return 'bg-gray-400 dark:bg-gray-500';
    }
};

const formatDate = (date?: string | Date | null): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Component to display activation code with copy button - Compact style for table column
const ActivationCodeCell: FunctionComponent<{ code: string | null | undefined }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    if (!code) {
        return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>;
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            Notify.success('Activation code copied');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <code className="px-2 py-1 text-xs font-mono bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700 truncate max-w-[120px]" title={code}>
                {code}
            </code>
            <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-all ${copied
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600'
                    }`}
                title={copied ? 'Copied!' : 'Copy code'}
            >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
    );
};

export const getTerminalColumns = (
    onEdit: (terminal: Terminal) => void,
    onToggleBlock: (terminalId: string, isBlocked: boolean) => void,
    onDelete: (terminalId: string, terminalLabel: string) => void,
    onSetPrimary: (terminalId: string, branchId: string) => void,
    onSync: (terminalId: string) => void
): Array<TableColumn<Terminal>> => {
    return [
        {
            name: 'Terminal',
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="relative w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                            <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            {row.isPrimary && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-white fill-current" />
                                </div>
                            )}
                            {row.isBlocked && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center">
                                    <ShieldOff className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center flex-wrap gap-2">
                                <span className="truncate">{row.terminalLabel}</span>
                                {row.isPrimary && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                                        Primary
                                    </span>
                                )}
                                {row.isBlocked && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700">
                                        Blocked
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center">
                                    {row.terminalCode}
                                    {row.deviceId && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span className="truncate">{row.deviceId}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                            {row.macAddress && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 dark:bg-green-500 rounded-full mr-1.5"></span>
                                    {row.macAddress}
                                </div>
                            )}
                        </div>
                    </div>
                </Fragment>
            ),
            grow: 2
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivationStatusColor(row.activationStatus)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(row.activationStatus)}`} />
                        {row.activationStatus}
                    </span>
                </Fragment>
            )
        },
        {
            name: 'Activation Code',
            cell: (row) => <ActivationCodeCell code={row.activationCode} />,
            minWidth: '180px'
        },
        {
            name: 'Position',
            cell: (row) => (
                <span className="text-sm text-gray-900 dark:text-gray-100">
                    {row.terminalPosition || '-'}
                </span>
            ),
            width: '100px'
        },
        {
            name: 'Last Activity',
            cell: (row) => (
                <Fragment>
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatDate(row.lastActivity)}
                        </div>
                        {row.lastSync && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1 text-sky-500 dark:text-sky-400" />
                                Synced: {formatDate(row.lastSync)}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            width: '280px',
            name: <HiOutlineMenuAlt4 className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
            cell: (row) => (
                <TerminalActions
                    terminal={row}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleBlock={onToggleBlock}
                    onSetPrimary={onSetPrimary}
                    onSync={onSync}
                />
            )
        }
    ];
};
