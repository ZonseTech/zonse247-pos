import { Clock, Loader2, XCircle, CheckCircle, Filter, X } from 'lucide-react';
import { Badge, Card, Flex, Select, Separator, Text } from '@radix-ui/themes';
import { Button } from '../../../components';
import { Trash2, RotateCcw } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

type JobStatusFilter = 'ALL' | PrintJobStatus;
type JobTypeFilter = 'ALL' | PrintJobType;

const TYPE_OPTIONS: { value: JobTypeFilter; label: string }[] = [
    { value: 'ALL', label: 'All Types' },
    { value: 'RECEIPT', label: 'Receipt' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'REPORT', label: 'Report' },
    { value: 'LABEL', label: 'Label' },
    { value: 'KITCHEN_ORDER', label: 'Kitchen Order' },
];

const getStatusIcon = (status: JobStatusFilter) => {
    const icons: Record<string, React.ReactNode> = {
        ALL: <Filter className="w-3.5 h-3.5" />,
        PENDING: <Clock className="w-3.5 h-3.5" />,
        PRINTING: <Loader2 className="w-3.5 h-3.5" />,
        COMPLETED: <CheckCircle className="w-3.5 h-3.5" />,
        FAILED: <XCircle className="w-3.5 h-3.5" />,
        CANCELLED: <X className="w-3.5 h-3.5" />,
    };
    return icons[status] || icons.ALL;
};

interface JobsFiltersProps {
    statusFilter: JobStatusFilter;
    typeFilter: JobTypeFilter;
    selectedPrinterId: string;
    printers: Printer[];
    cleanupDays: number;
    // Stats
    totalCount: number;
    pendingCount: number;
    printingCount: number;
    completedCount: number;
    failedCount: number;
    cancelledCount: number;
    // Handlers
    onStatusChange: (status: JobStatusFilter) => void;
    onTypeChange: (type: JobTypeFilter) => void;
    onPrinterChange: (printerId: string) => void;
    onCleanupDaysChange: (days: number) => void;
    onCleanup: () => void;
    onRetryAllFailed: () => void;
    onClearQueue: () => void;
}

export const JobsFilters = ({
    statusFilter, typeFilter, selectedPrinterId, printers, cleanupDays,
    totalCount, pendingCount, printingCount, completedCount, failedCount, cancelledCount,
    onStatusChange, onTypeChange, onPrinterChange, onCleanupDaysChange, onCleanup, onRetryAllFailed, onClearQueue
}: JobsFiltersProps) => {
    const isMobile = useIsMobile();

    const statusOptions: { value: JobStatusFilter; label: string; count: number }[] = [
        { value: 'ALL', label: 'All Jobs', count: totalCount },
        { value: 'PENDING', label: 'Pending', count: pendingCount },
        { value: 'PRINTING', label: 'Printing', count: printingCount },
        { value: 'COMPLETED', label: 'Completed', count: completedCount },
        { value: 'FAILED', label: 'Failed', count: failedCount },
        { value: 'CANCELLED', label: 'Cancelled', count: cancelledCount },
    ];

    if (isMobile) {
        const ActiveIcon = () => getStatusIcon(statusFilter);
        return (
            <Card size="2" className="mb-4 mx-4">
                <Flex direction="column" gap="3">
                    {/* Status Filter */}
                    <Select.Root value={statusFilter} onValueChange={(val) => onStatusChange(val as JobStatusFilter)}>
                        <Select.Trigger placeholder="Filter by status" />
                        <Select.Content>
                            {statusOptions.map(opt => (
                                <Select.Item key={opt.value} value={opt.value}>
                                    {opt.label} ({opt.count})
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>

                    <Flex gap="2">
                        {/* Printer Filter */}
                        <Select.Root value={selectedPrinterId} onValueChange={onPrinterChange}>
                            <Select.Trigger placeholder="All Printers" className="flex-1" />
                            <Select.Content>
                                <Select.Item value="ALL">All Printers</Select.Item>
                                {printers.map(p => (
                                    <Select.Item key={p.printerId} value={p.printerId}>{p.printerName}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>

                        {/* Type Filter */}
                        <Select.Root value={typeFilter} onValueChange={(val) => onTypeChange(val as JobTypeFilter)}>
                            <Select.Trigger placeholder="All Types" className="flex-1" />
                            <Select.Content>
                                {TYPE_OPTIONS.map(opt => (
                                    <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                    {/* Actions */}
                    {(failedCount > 0 || pendingCount > 0) && (
                        <>
                            <Separator size="4" />
                            <Flex align="center" gap="2">
                                {failedCount > 0 && <Button onClick={onRetryAllFailed} layout="outline" theme="primary" size="small" icon={RotateCcw} className="flex-1">Retry ({failedCount})</Button>}
                                {(pendingCount > 0 || failedCount > 0) && <Button onClick={onClearQueue} layout="outline" theme="danger" size="small" icon={Trash2} className="flex-1">Clear</Button>}
                            </Flex>
                        </>
                    )}
                </Flex>
            </Card>
        );
    }

    return (
        <Card size="2" className="mb-4 mx-4 md:mx-0">
            <Flex wrap="wrap" align="center" justify="between" gap="4" pb="4" className="border-b border-gray-200 dark:border-gray-600">
                <Flex wrap="wrap" align="center" gap="2">
                    {statusOptions.map(opt => {
                        const isActive = statusFilter === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => onStatusChange(opt.value)}
                                className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 border
                                    ${isActive
                                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-200 dark:border-sky-800'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {getStatusIcon(opt.value)}
                                <span>{opt.label}</span>
                                <Badge
                                    color={isActive ? 'blue' : 'gray'}
                                    variant="soft"
                                    size="1"
                                >
                                    {opt.count}
                                </Badge>
                            </button>
                        );
                    })}
                </Flex>

                <Flex align="center" gap="3">
                    <Select.Root value={selectedPrinterId} onValueChange={onPrinterChange}>
                        <Select.Trigger placeholder="All Printers" />
                        <Select.Content>
                            <Select.Item value="ALL">All Printers</Select.Item>
                            {printers.map(p => (
                                <Select.Item key={p.printerId} value={p.printerId}>{p.printerName}</Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>

                    <Select.Root value={typeFilter} onValueChange={(val) => onTypeChange(val as JobTypeFilter)}>
                        <Select.Trigger placeholder="All Types" />
                        <Select.Content>
                            {TYPE_OPTIONS.map(opt => (
                                <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </Flex>
            </Flex>

            <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }} justify="between" gap="3" mt="4">
                <Flex wrap="wrap" align="center" gap="2">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                    <Text size="2" color="gray">Cleanup older than</Text>
                    <input
                        type="number" min="1" max="365" value={cleanupDays}
                        onChange={(e) => onCleanupDaysChange(parseInt(e.target.value) || 30)}
                        className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                    <Text size="2" color="gray">days</Text>
                    <Button onClick={onCleanup} layout="outline" theme="warning" size="small" icon={Trash2}>Cleanup</Button>
                </Flex>
                <Flex align="center" gap="2">
                    {failedCount > 0 && <Button onClick={onRetryAllFailed} layout="outline" theme="primary" size="small" icon={RotateCcw}>Retry Failed ({failedCount})</Button>}
                    {(pendingCount > 0 || failedCount > 0) && <Button onClick={onClearQueue} layout="outline" theme="danger" size="small" icon={Trash2}>Clear Queue</Button>}
                </Flex>
            </Flex>
        </Card>
    );
};
