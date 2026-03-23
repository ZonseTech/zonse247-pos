import { FunctionComponent, ReactNode } from 'react';
import { Badge, Card, Flex, Separator, Skeleton, Text } from '@radix-ui/themes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    FileText,
    Printer,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    X,
    RotateCcw
} from 'lucide-react';

dayjs.extend(relativeTime);

interface PrintJobMobileCardProps {
    job: PrintJob;
    getPrinterName: (printerId: string) => string;
    onCancel: (jobId: string, jobTitle: string) => void;
    onRetry: (jobId: string, jobTitle: string) => void;
}

const PrintJobMobileCard: FunctionComponent<PrintJobMobileCardProps> = ({
    job,
    getPrinterName,
    onCancel,
    onRetry
}) => {
    const getStatusBadgeColor = (status: PrintJobStatus): 'yellow' | 'blue' | 'green' | 'red' | 'gray' => {
        const colors: Record<PrintJobStatus, 'yellow' | 'blue' | 'green' | 'red' | 'gray'> = {
            'PENDING': 'yellow',
            'PRINTING': 'blue',
            'COMPLETED': 'green',
            'FAILED': 'red',
            'CANCELLED': 'gray',
        };
        return colors[status] || 'gray';
    };

    const getStatusConfig = (status: PrintJobStatus) => {
        const configs: Record<PrintJobStatus, { color: string; bgColor: string; icon: ReactNode; label: string }> = {
            'PENDING': {
                color: 'text-yellow-600 dark:text-yellow-400',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                icon: <Clock className="w-3.5 h-3.5" />,
                label: 'Pending'
            },
            'PRINTING': {
                color: 'text-sky-500 dark:text-sky-400',
                bgColor: 'bg-sky-100 dark:bg-sky-900/30',
                icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
                label: 'Printing'
            },
            'COMPLETED': {
                color: 'text-green-500 dark:text-green-400',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
                label: 'Completed'
            },
            'FAILED': {
                color: 'text-red-500 dark:text-red-400',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                icon: <XCircle className="w-3.5 h-3.5" />,
                label: 'Failed'
            },
            'CANCELLED': {
                color: 'text-gray-600 dark:text-gray-400',
                bgColor: 'bg-gray-100 dark:bg-gray-700',
                icon: <X className="w-3.5 h-3.5" />,
                label: 'Cancelled'
            }
        };
        return configs[status] || configs['PENDING'];
    };

    const getJobTypeConfig = (type: PrintJobType) => {
        const configs: Record<PrintJobType, { color: string; label: string }> = {
            'RECEIPT': { color: 'text-sky-500 dark:text-sky-400', label: 'Receipt' },
            'INVOICE': { color: 'text-purple-600 dark:text-purple-400', label: 'Invoice' },
            'REPORT': { color: 'text-indigo-600 dark:text-indigo-400', label: 'Report' },
            'LABEL': { color: 'text-teal-600 dark:text-teal-400', label: 'Label' },
            'BARCODE': { color: 'text-cyan-600 dark:text-cyan-400', label: 'Barcode' },
            'KITCHEN_ORDER': { color: 'text-orange-600 dark:text-orange-400', label: 'Kitchen' },
            'TEST_PAGE': { color: 'text-gray-600 dark:text-gray-400', label: 'Test' }
        };
        return configs[type] || { color: 'text-gray-600', label: type };
    };

    const statusConfig = getStatusConfig(job.status);
    const jobTypeConfig = getJobTypeConfig(job.jobType);
    const canCancel = ['PENDING', 'FAILED'].includes(job.status);
    const canRetry = job.status === 'FAILED';

    return (
        <Card size="2">
            {/* Header */}
            <Flex align="start" justify="between" mb="3">
                <Flex align="center" gap="3" className="flex-1 min-w-0">
                    <Flex align="center" justify="center" className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                        <FileText className={`w-5 h-5 ${statusConfig.color}`} />
                    </Flex>
                    <Flex direction="column" gap="1" className="flex-1 min-w-0">
                        <Text size="2" weight="medium" truncate>
                            {job.jobTitle}
                        </Text>
                        <Text size="1" color="gray" className="font-mono" truncate>
                            {job.printJobId.slice(0, 8)}...
                        </Text>
                    </Flex>
                </Flex>
                <Badge color={getStatusBadgeColor(job.status)} variant="soft" size="1">
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                </Badge>
            </Flex>

            {/* Details */}
            <Flex direction="column" gap="2" mb="3">
                <Flex align="center" justify="between">
                    <Text size="2" color="gray">Type</Text>
                    <Text size="2" weight="medium" className={jobTypeConfig.color}>
                        {jobTypeConfig.label}
                    </Text>
                </Flex>
                <Flex align="center" justify="between">
                    <Text size="2" color="gray">Printer</Text>
                    <Flex align="center" gap="1">
                        <Printer className="w-3.5 h-3.5 text-gray-400" />
                        <Text size="2" truncate className="max-w-[150px]">{getPrinterName(job.printerId)}</Text>
                    </Flex>
                </Flex>
                {job.copies && job.copies > 1 && (
                    <Flex align="center" justify="between">
                        <Text size="2" color="gray">Copies</Text>
                        <Text size="2">{job.copies}</Text>
                    </Flex>
                )}
                {job.referenceId && (
                    <Flex align="center" justify="between">
                        <Text size="2" color="gray">Reference</Text>
                        <Text size="1" color="gray" className="font-mono" truncate>
                            {job.referenceId}
                        </Text>
                    </Flex>
                )}
            </Flex>

            {/* Error Message */}
            {job.status === 'FAILED' && job.errorMessage && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Flex align="start" gap="2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <Text size="1" color="red" className="line-clamp-2">
                            {job.errorMessage}
                        </Text>
                    </Flex>
                </div>
            )}

            {/* Timestamps & Actions */}
            <Separator size="4" mb="3" />
            <Flex align="center" justify="between">
                <Text size="1" color="gray">
                    {job.createdAt && dayjs(job.createdAt).fromNow()}
                </Text>
                <Flex align="center" gap="2">
                    {canRetry && (
                        <button
                            onClick={() => onRetry(job.printJobId, job.jobTitle)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Retry
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={() => onCancel(job.printJobId, job.jobTitle)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                    )}
                </Flex>
            </Flex>
        </Card>
    );
};

// Skeleton loader
export const PrintJobMobileCardSkeleton: FunctionComponent = () => (
    <Card size="2">
        <Flex align="start" justify="between" mb="3">
            <Flex align="center" gap="3">
                <Skeleton width="40px" height="40px" className="rounded-lg" />
                <Flex direction="column" gap="1">
                    <Skeleton width="128px" height="16px" />
                    <Skeleton width="80px" height="12px" />
                </Flex>
            </Flex>
            <Skeleton width="80px" height="24px" className="rounded-full" />
        </Flex>
        <Flex direction="column" gap="2" mb="3">
            <Flex justify="between">
                <Skeleton width="48px" height="16px" />
                <Skeleton width="64px" height="16px" />
            </Flex>
            <Flex justify="between">
                <Skeleton width="56px" height="16px" />
                <Skeleton width="96px" height="16px" />
            </Flex>
        </Flex>
        <Separator size="4" mb="3" />
        <Flex justify="between">
            <Skeleton width="80px" height="16px" />
            <Flex gap="2">
                <Skeleton width="64px" height="28px" className="rounded-lg" />
            </Flex>
        </Flex>
    </Card>
);

// Mobile List Component
interface PrintJobMobileListProps {
    jobs: PrintJob[];
    getPrinterName: (printerId: string) => string;
    onCancel: (jobId: string, jobTitle: string) => void;
    onRetry: (jobId: string, jobTitle: string) => void;
    isLoading: boolean;
}

export const PrintJobMobileList: FunctionComponent<PrintJobMobileListProps> = ({
    jobs,
    getPrinterName,
    onCancel,
    onRetry,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[...Array(3)].map((_, i) => (
                    <PrintJobMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {jobs.map((job) => (
                <PrintJobMobileCard
                    key={job.printJobId}
                    job={job}
                    getPrinterName={getPrinterName}
                    onCancel={onCancel}
                    onRetry={onRetry}
                />
            ))}
        </div>
    );
};

export default PrintJobMobileCard;
