import { FunctionComponent, memo, useContext } from 'react';
import { ZonseThemeContext } from '../../../components';
import { getTableStyles } from '../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import { Monitor, Wifi, WifiOff, CheckCircle, Clock, XCircle, Shield, Ban } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface TerminalsTabProps {
    terminals: Terminal[];
    loading: boolean;
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

const getTerminalColumns = (): TableColumn<Terminal>[] => [
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
];

const AccountTerminalsTab: FunctionComponent<TerminalsTabProps> = memo(({ terminals, loading }) => {
    const { mode } = useContext(ZonseThemeContext);

    if (loading) {
        return <TableSkeleton rows={5} columns={5} showCheckbox={false} showActions={false} />;
    }

    return (
        <DataTable
            columns={getTerminalColumns()}
            data={terminals}
            theme={mode as string}
            highlightOnHover
            striped
            responsive
            noDataComponent={
                <div className="text-center py-12">
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No terminals found</p>
                </div>
            }
            customStyles={getTableStyles(mode)}
        />
    );
});

AccountTerminalsTab.displayName = 'AccountTerminalsTab';

export default AccountTerminalsTab;
