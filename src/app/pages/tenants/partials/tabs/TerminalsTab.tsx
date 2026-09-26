import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FunctionComponent, memo, useContext, useMemo, useState } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import { Building2, Monitor, Wifi, WifiOff, CheckCircle, Clock, XCircle, Shield, Ban, RefreshCw, Copy, Check, KeyRound, QrCode } from 'lucide-react';
import { Badge, Box, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
import { Notify, Confirm } from 'notiflix';
import terminalService from '../../../../services/terminal.service';
import { getErrorMessage } from '../../../../utils/api-error-handler';
import TerminalActivationQrModal from '../TerminalActivationQrModal';

interface TerminalsTabProps {
    terminals: Terminal[];
    branches: Branch[];
    loading: boolean;
    tenantId?: string;
    onRefresh?: () => void;
}

const activationStatusColorMap: Record<string, 'green' | 'amber' | 'gray' | 'orange' | 'red'> = {
    ACTIVATED: 'green',
    PENDING: 'amber',
    DEACTIVATED: 'gray',
    SUSPENDED: 'orange',
    BLOCKED: 'red',
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

const mraStatusColorMap: Record<string, 'blue' | 'green' | 'red'> = {
    APPLIED: 'blue',
    APPROVED: 'green',
    REJECTED: 'red',
};

const getMraStatusBadge = (status: TerminalMraStatus | undefined) => (
    <Badge variant="soft" color={mraStatusColorMap[status || ''] || 'gray'}>
        {status?.toLowerCase() || 'n/a'}
    </Badge>
);

const isRecentlyActive = (lastSeen: string | Date | null | undefined): boolean => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastSeen).getTime() > fiveMinutesAgo;
};

const ActivationCodeCell: FunctionComponent<{ code: string | null | undefined }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    if (!code) {
        return <Text size="1" color="gray">—</Text>;
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
        <Flex align="center" gap="2">
            <Box asChild>
                <code
                    title={code}
                    className="px-2 py-1 text-xs font-mono bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700 truncate max-w-[120px]"
                >
                    {code}
                </code>
            </Box>
            <Tooltip content={copied ? 'Copied!' : 'Copy code'}>
                <IconButton
                    type="button"
                    variant="ghost"
                    color={copied ? 'green' : 'gray'}
                    size="1"
                    onClick={handleCopy}
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </IconButton>
            </Tooltip>
        </Flex>
    );
};

const getTerminalColumns = (
    branchNameById: Map<string, string>,
    onRegenerateCode?: (terminal: Terminal) => void,
    actionLoading?: string | null,
    onShowQrCode?: (terminal: Terminal) => void
): TableColumn<Terminal>[] => [
        {
            name: 'Terminal',
            cell: (row) => (
                <Box py="2">
                    <Flex align="center" gap="2">
                        <Text size="2" weight="medium" className="truncate">{row.terminalLabel}</Text>
                        {row.isPrimary && (
                            <Badge variant="soft" color="amber">Primary</Badge>
                        )}
                    </Flex>
                    <Text as="p" size="1" color="gray">Code: {row.terminalCode}</Text>
                </Box>
            ),
            sortable: true,
            sortField: 'terminalLabel',
        },
        {
            name: 'Branch',
            cell: (row) => (
                <Flex align="center" gap="2">
                    <Flex
                        align="center"
                        justify="center"
                        className="w-6 h-6 rounded-md bg-sky-100 dark:bg-sky-900/30 flex-shrink-0"
                    >
                        <Building2 className="w-3.5 h-3.5 text-sky-500" />
                    </Flex>
                    <Text size="2" className="truncate">
                        {branchNameById.get(row.branchId) || 'Unassigned'}
                    </Text>
                </Flex>
            ),
            sortable: true,
            sortFunction: (a, b) => (branchNameById.get(a.branchId) || '').localeCompare(branchNameById.get(b.branchId) || ''),
        },
        {
            name: 'Device Info',
            cell: (row) => (
                <Box py="2">
                    <Text as="p" size="2">{row.osName || 'Unknown OS'}</Text>
                    <Text as="p" size="1" color="gray">
                        {row.osVersion ? `v${row.osVersion}` : ''}
                        {row.deviceId && (
                            <Text as="span" className="truncate block" title={row.deviceId}>
                                Device: {row.deviceId}
                            </Text>
                        )}
                    </Text>
                </Box>
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
                    <Flex direction="column">
                        <Flex align="center" gap="1">
                            {active ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-gray-400" />
                            )}
                            <Text size="1" color={active ? 'green' : 'gray'}>
                                {active ? 'Online' : 'Offline'}
                            </Text>
                        </Flex>
                        {lastSeen && (
                            <Text size="1" color="gray" mt="1">{dayjs(lastSeen).fromNow()}</Text>
                        )}
                    </Flex>
                );
            },
            minWidth: '100px',
        },
        {
            name: 'Status',
            cell: (row) => (
                <Badge variant="soft" radius="full" color={activationStatusColorMap[row.activationStatus || ''] || 'gray'}>
                    <Flex align="center" gap="1">
                        {getActivationStatusIcon(row.activationStatus)}
                        {row.activationStatus?.charAt(0) + row.activationStatus?.slice(1).toLowerCase()}
                    </Flex>
                </Badge>
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
                <Flex align="center" gap="1">
                    {row.activationStatus !== 'ACTIVATED' && row.activationCode && onShowQrCode && (
                        <Tooltip content="Show activation QR code">
                            <IconButton
                                type="button"
                                variant="ghost"
                                color="sky"
                                size="1"
                                aria-label={`Show activation QR code for ${row.terminalLabel}`}
                                onClick={() => onShowQrCode(row)}
                            >
                                <QrCode className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {row.activationStatus !== 'ACTIVATED' && onRegenerateCode && (
                        <Tooltip content="Regenerate activation code">
                            <IconButton
                                type="button"
                                variant="ghost"
                                color="sky"
                                size="1"
                                disabled={actionLoading === row.terminalId}
                                onClick={() => onRegenerateCode(row)}
                            >
                                {actionLoading === row.terminalId ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <KeyRound className="w-4 h-4" />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            ),
            right: true,
        },
    ];

const TerminalsTab: FunctionComponent<TerminalsTabProps> = memo(({ terminals, branches, loading, tenantId, onRefresh }) => {
    const { mode } = useContext(ZonseThemeContext);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [qrTerminal, setQrTerminal] = useState<Terminal | null>(null);

    const branchNameById = useMemo(() => {
        const map = new Map<string, string>();
        branches.forEach((b) => map.set(b.branchId, b.branchName));
        return map;
    }, [branches]);

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
                    setQrTerminal({ ...terminal, activationCode: result.activationCode, activationStatus: 'PENDING' });
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
        <>
            <DataTable
                columns={getTerminalColumns(branchNameById, handleRegenerateCode, actionLoading, setQrTerminal)}
                data={terminals}
                theme={mode as string}
                highlightOnHover
                striped
                responsive
                noDataComponent={
                    <Flex direction="column" align="center" py="8">
                        <Monitor className="w-12 h-12 text-gray-400 mb-4" />
                        <Text color="gray">No terminals found for this tenant</Text>
                    </Flex>
                }
                customStyles={getTableStyles(mode)}
            />

            <TerminalActivationQrModal
                terminal={qrTerminal}
                branchName={qrTerminal ? branchNameById.get(qrTerminal.branchId) : undefined}
                onClose={() => setQrTerminal(null)}
            />
        </>
    );
});

TerminalsTab.displayName = 'TerminalsTab';

export default TerminalsTab;
