import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Fragment, FunctionComponent, memo, useContext, useState } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import { Monitor, Wifi, WifiOff, CheckCircle, Clock, XCircle, Shield, Ban, RefreshCw, Copy, Check, KeyRound } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
import { Notify, Confirm } from 'notiflix';
import terminalService from '../../../../services/terminal.service';
import { getErrorMessage } from '../../../../utils/api-error-handler';

interface TerminalsTabProps {
    terminals: Terminal[];
    loading: boolean;
    tenantId?: string;
    onRefresh?: () => void;
}

const getActivationStatusColor = (status: TerminalActivationStatus | undefined): string => {
    switch (status) {
        case 'ACTIVATED':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'DEACTIVATED':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
        case 'SUSPENDED':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'BLOCKED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
    }
};

const getActivationStatusIcon = (status: TerminalActivationStatus | undefined) => {
    switch (status) {
        case 'ACTIVATED':
            return <CheckCircle className="w-3.5 h-3.5" />;
        case 'PENDING':
            return <Clock className="w-3.5 h-3.5" />;
        case 'BLOCKED':
            return <Ban className="w-3.5 h-3.5" />;
        case 'SUSPENDED':
            return <Shield className="w-3.5 h-3.5" />;
        default:
            return <XCircle className="w-3.5 h-3.5" />;
    }
};

const getMraStatusBadge = (status: TerminalMraStatus | undefined) => {
    const colors: Record<string, string> = {
        APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status || ''] || 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>
            {status?.toLowerCase() || 'n/a'}
        </span>
    );
};


const isRecentlyActive = (lastSeen: string | Date | null | undefined): boolean => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastSeen).getTime() > fiveMinutesAgo;
};

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

const getTerminalColumns = (
    onRegenerateCode?: (terminal: Terminal) => void,
    actionLoading?: string | null
): TableColumn<Terminal>[] => [
        {
            name: 'Terminal',
            cell: (row) => (
                <div className="flex items-center py-2">
                    <div className="ml-3 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {row.terminalLabel}
                            </span>
                            {row.isPrimary && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                    Primary
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Code: {row.terminalCode}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            sortField: 'terminalLabel',
        },
        {
            name: 'Device Info',
            cell: (row) => (
                <div className="py-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {row.osName || 'Unknown OS'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {row.osVersion ? `v${row.osVersion}` : ''}
                        {row.deviceId && (
                            <span className="truncate block" title={row.deviceId}>
                                Device: {row.deviceId}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            name: 'MRA Status',
            cell: (row) => getMraStatusBadge(row.mraApplicationStatus),
            center: true,
        },
        {
            name: 'Online',
            cell: (row) => {
                const lastSeen = row.lastSeenAt || row.lastActivity;
                const active = isRecentlyActive(lastSeen);
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            {active ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={`text-xs ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {active ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        {lastSeen && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                {dayjs(lastSeen).fromNow()}
                            </span>
                        )}
                    </div>
                );
            },
            minWidth: '100px',
        },
        {
            name: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivationStatusColor(row.activationStatus)}`}>
                    {getActivationStatusIcon(row.activationStatus)}
                    {row.activationStatus?.charAt(0) + row.activationStatus?.slice(1).toLowerCase()}
                </span>
            ),
            width: '120px',
        },
        {
            name: 'Activation Code',
            cell: (row) => <ActivationCodeCell code={row.activationCode} />,
            minWidth: '180px',
            omit: false,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    {row.activationStatus !== 'ACTIVATED' && onRegenerateCode && (
                        <button
                            onClick={() => onRegenerateCode(row)}
                            disabled={actionLoading === row.terminalId}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Regenerate activation code"
                        >
                            {actionLoading === row.terminalId ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <KeyRound className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            ),
            right: true,
        },
    ];

const TerminalsTab: FunctionComponent<TerminalsTabProps> = memo(({ terminals, loading, tenantId, onRefresh }) => {
    const { mode } = useContext(ZonseThemeContext);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleRegenerateCode = async (terminal: Terminal) => {
        Confirm.show(
            'Regenerate Activation Code',
            `This will generate a new activation code for "${terminal.terminalLabel}" and reset its status to PENDING. Continue?`,
            'Yes, Regenerate',
            'Cancel',
            async () => {
                try {
                    setActionLoading(terminal.terminalId);
                    const result = await terminalService.regenerateActivationCode(terminal.terminalId);
                    Notify.success(`Activation code regenerated: ${result.activationCode}`);
                    onRefresh?.();
                } catch (error: any) {
                    console.error('Error regenerating activation code:', error);
                    const message = getErrorMessage(error, 'Failed to regenerate activation code');
                    Notify.failure(message);
                } finally {
                    setActionLoading(null);
                }
            },
            () => {
                // cancelled
            },
            {
                titleColor: '#0ea5e9',
                okButtonBackground: '#0ea5e9',
            }
        );
    };

    if (loading) {
        return <TableSkeleton rows={5} columns={5} showCheckbox={false} showActions={false} />;
    }

    return (
        <Fragment>
            <DataTable
                columns={getTerminalColumns(handleRegenerateCode, actionLoading)}
                data={terminals}
                theme={mode as string}
                highlightOnHover
                striped
                responsive
                noDataComponent={
                    <div className="text-center py-12">
                        <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No terminals found for this tenant</p>
                    </div>
                }
                customStyles={getTableStyles(mode)}
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 450px)"
            />
        </Fragment>
    );
});

TerminalsTab.displayName = 'TerminalsTab';

export default TerminalsTab;
