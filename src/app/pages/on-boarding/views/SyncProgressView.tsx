import { FunctionComponent, useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import { Badge, Box, Button as RadixButton, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import {
    XCircle,
    Loader2,
    AlertTriangle,
    Download,
    Database,
    Cloud,
    HardDrive,
    SkipForward,
    ChevronDown,
    ChevronUp,
    Check,
    RefreshCw,
} from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import type { SyncProgressViewProps } from '../types';
import { camelCaseToReadable } from '../../../utils';

/**
 * Get icon and styles for table sync status
 */
const getStatusDisplay = (status: SyncTableStatus) => {
    switch (status) {
        case 'fetching':
            return {
                icon: <Cloud className="w-4 h-4 animate-pulse" />,
                text: 'Fetching...',
                textColor: 'text-blue-600 dark:text-blue-400',
            };
        case 'saving':
            return {
                icon: <HardDrive className="w-4 h-4 animate-pulse" />,
                text: 'Saving...',
                textColor: 'text-amber-600 dark:text-amber-400',
            };
        case 'completed':
            return {
                icon: <Check className="w-4 h-4" />,
                text: 'Completed',
                textColor: 'text-green-600 dark:text-green-400',
            };
        case 'failed':
            return {
                icon: <XCircle className="w-4 h-4" />,
                text: 'Failed',
                textColor: 'text-red-600 dark:text-red-400',
            };
        case 'skipped':
            return {
                icon: <SkipForward className="w-4 h-4" />,
                text: 'Skipped',
                textColor: 'text-slate-500 dark:text-slate-400',
            };
        case 'pending':
        default:
            return {
                icon: <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />,
                text: 'Pending',
                textColor: 'text-slate-500 dark:text-slate-400',
            };
    }
};

const TableProgressItem: FunctionComponent<{
    table: SyncTableProgress;
}> = ({ table }) => {
    const display = getStatusDisplay(table.status);
    const progressText = table.status === 'completed' || table.status === 'failed'
        ? `${table.savedCount} of ${table.totalCount} saved`
        : table.status === 'fetching'
            ? `${table.fetchedCount} of ${table.totalCount} fetched`
            : table.status === 'saving'
                ? `${table.savedCount} of ${table.fetchedCount} saving`
                : table.totalCount > 0
                    ? `${table.totalCount} records`
                    : '';

    return (
        <Flex align="center" gap="2" className="rounded-lg border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
            <span className={display.textColor}>{display.icon}</span>
            <Text size="2" className="flex-1 truncate">
                {table.label}
            </Text>
            {table.error ? (
                <Text size="1" color="red" className="truncate max-w-[120px]">
                    {table.error}
                </Text>
            ) : progressText ? (
                <Text size="1" color="gray" className="whitespace-nowrap">
                    {progressText}
                </Text>
            ) : null}
        </Flex>
    );
};

/**
 * Main sync progress view
 * Shows users what data is being loaded from cloud and saved locally
 */
const SyncProgressView: FunctionComponent<SyncProgressViewProps> = ({
    terminal,
    progress,
    onComplete,
    onRetry,
}) => {
    const progressPercentage = progress.totalTables > 0
        ? Math.round((progress.completedTables / progress.totalTables) * 100)
        : 0;

    const recordsPercentage = progress.totalRecords > 0
        ? Math.round((progress.savedRecords / progress.totalRecords) * 100)
        : 0;

    const isComplete = progress.status === 'completed';
    const hasFailed = progress.status === 'failed';
    const isInProgress = progress.status === 'counting' || progress.status === 'fetching' || progress.status === 'saving';

    const [showDetails, setShowDetails] = useState(false);

    return (
        <AuthLayout className="w-full max-w-2xl">
            <Card size="2" className="border border-slate-200/80 bg-[color:var(--color-panel)] shadow-sm">
                <Flex direction="column" gap="4">
                    <Box className="text-center">
                        <Flex align="center" justify="center" gap="2" mb="2">
                            {isInProgress ? (
                                <Loader2 className="w-6 h-6 text-[#102f4f] animate-spin" />
                            ) : isComplete ? (
                                <Check className="w-6 h-6 text-green-600" />
                            ) : hasFailed ? (
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            ) : (
                                <Database className="w-6 h-6 text-[#102f4f]" />
                            )}
                            <Heading as="h2" size="4">
                                {isComplete ? 'Setup complete' : hasFailed ? 'Setup needs attention' : 'Setting up your terminal'}
                            </Heading>
                        </Flex>
                        <Text size="2" color="gray" align="center">
                            {isComplete
                                ? 'All data has been synchronized successfully.'
                                : hasFailed
                                    ? 'Some data failed to sync. You can retry or continue.'
                                    : 'Synchronizing data from the cloud to your device.'}
                        </Text>
                    </Box>

                    <Box className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:bg-slate-900/30">
                        <Flex justify="between" gap="3" wrap="wrap">
                            <Box>
                                <Text size="1" color="gray">Terminal</Text>
                                <Text size="2" weight="medium">
                                    {terminal.terminalLabel}
                                </Text>
                            </Box>
                            <Box>
                                <Text size="1" color="gray">Branch</Text>
                                <Text size="2" weight="medium">
                                    {terminal.branch?.branchName || 'N/A'}
                                </Text>
                            </Box>
                            <Box>
                                <Text size="1" color="gray">Status</Text>
                                <Badge color={hasFailed ? 'red' : isComplete ? 'green' : 'blue'}>
                                    {isComplete ? 'Ready' : hasFailed ? 'Needs review' : 'Syncing'}
                                </Badge>
                            </Box>
                        </Flex>
                    </Box>

                    <Box>
                        <Flex justify="between" align="center" mb="2">
                            <Text size="2" color="gray">
                                {progress.status === 'counting' && (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Counting records...
                                    </span>
                                )}
                                {progress.status === 'fetching' && (
                                    <span className="flex items-center gap-1">
                                        <Download className="w-4 h-4" />
                                        Fetching {progress.currentTable ? camelCaseToReadable(progress.currentTable) : 'data'}...
                                    </span>
                                )}
                                {progress.status === 'saving' && (
                                    <span className="flex items-center gap-1">
                                        <Database className="w-4 h-4" />
                                        Saving to local database...
                                    </span>
                                )}
                                {progress.status === 'completed' && (
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <Check className="w-4 h-4" />
                                        Sync completed
                                    </span>
                                )}
                                {progress.status === 'idle' && 'Ready to sync'}
                                {progress.status === 'failed' && (
                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                        <XCircle className="w-4 h-4" />
                                        Sync failed
                                    </span>
                                )}
                            </Text>
                            <Text size="2" weight="medium">
                                {progressPercentage}%
                            </Text>
                        </Flex>
                        <Progress.Root value={progressPercentage} max={100} className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <Progress.Indicator
                                className={`h-full rounded-full transition-all duration-500 ${hasFailed ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-[#102f4f]'}`}
                                style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
                            />
                        </Progress.Root>
                        <Flex justify="between" mt="2">
                            <Text size="1" color="gray">
                                {progress.completedTables} of {progress.totalTables} tables
                            </Text>
                            <Text size="1" color="gray">
                                {progress.savedRecords.toLocaleString()} of {progress.totalRecords.toLocaleString()} records ({recordsPercentage}%)
                            </Text>
                        </Flex>
                    </Box>

                    {(hasFailed || isComplete) && (
                        <Flex gap="2" wrap="wrap">
                            {hasFailed && (
                                <RadixButton variant="soft" onClick={onRetry}>
                                    <Flex align="center" gap="2">
                                        <RefreshCw className="w-4 h-4" />
                                        Retry sync
                                    </Flex>
                                </RadixButton>
                            )}
                            {isComplete && (
                                <RadixButton color="green" onClick={onComplete}>
                                    Continue to finish setup
                                </RadixButton>
                            )}
                        </Flex>
                    )}

                    <Separator size="4" />

                    <Box>
                        <RadixButton variant="ghost" size="1" onClick={() => setShowDetails(!showDetails)} className="px-0">
                            <Flex align="center" gap="2">
                                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {showDetails ? 'Hide details' : 'Show details'}
                            </Flex>
                        </RadixButton>
                        {showDetails && (
                            <Flex direction="column" gap="2" className="mt-2 max-h-[300px] overflow-y-auto">
                                {progress.tables.map((table) => (
                                    <TableProgressItem key={table.table} table={table} />
                                ))}
                            </Flex>
                        )}
                    </Box>
                </Flex>
            </Card>
        </AuthLayout>
    );
};

export default SyncProgressView;
