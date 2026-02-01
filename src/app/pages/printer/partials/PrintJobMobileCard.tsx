import { FunctionComponent, ReactNode } from 'react';
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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                        <FileText className={`w-5 h-5 ${statusConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {job.jobTitle}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                            {job.printJobId.slice(0, 8)}...
                        </p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                    <span className={`font-medium ${jobTypeConfig.color}`}>
                        {jobTypeConfig.label}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Printer</span>
                    <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                        <Printer className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate max-w-[150px]">{getPrinterName(job.printerId)}</span>
                    </div>
                </div>
                {job.copies && job.copies > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Copies</span>
                        <span className="text-gray-900 dark:text-white">{job.copies}</span>
                    </div>
                )}
                {job.referenceId && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Reference</span>
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-xs truncate max-w-[150px]">
                            {job.referenceId}
                        </span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {job.status === 'FAILED' && job.errorMessage && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-500 dark:text-red-400 line-clamp-2">
                            {job.errorMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Timestamps & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {job.createdAt && (
                        <span>{dayjs(job.createdAt).fromNow()}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
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
                </div>
            </div>
        </div>
    );
};

// Skeleton loader
export const PrintJobMobileCardSkeleton: FunctionComponent = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-2 mb-3">
            <div className="flex justify-between">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex justify-between">
                <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
                <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
        </div>
    </div>
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
