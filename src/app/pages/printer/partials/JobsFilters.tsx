import { Clock, Loader2, XCircle, CheckCircle, Filter, X } from 'lucide-react';
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4">
                <div className="flex flex-col gap-3">
                    <div className="relative w-full">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ActiveIcon />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusChange(e.target.value as JobStatusFilter)}
                            className="w-full h-10 pl-10 pr-4 appearance-none cursor-pointer rounded-md text-sm font-medium
                                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600
                                focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label} ({opt.count})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={selectedPrinterId}
                            onChange={(e) => onPrinterChange(e.target.value)}
                            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        >
                            <option value="ALL">All Printers</option>
                            {printers.map(p => <option key={p.printerId} value={p.printerId}>{p.printerName}</option>)}
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => onTypeChange(e.target.value as JobTypeFilter)}
                            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        >
                            {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        {failedCount > 0 && <Button onClick={onRetryAllFailed} layout="outline" theme="primary" size="small" icon={RotateCcw} className="flex-1">Retry ({failedCount})</Button>}
                        {(pendingCount > 0 || failedCount > 0) && <Button onClick={onClearQueue} layout="outline" theme="danger" size="small" icon={Trash2} className="flex-1">Clear</Button>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4 md:mx-0">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap items-center gap-2">
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
                                <span className={`px-1.5 rounded text-xs font-medium
                                    ${isActive
                                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-100'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {opt.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedPrinterId}
                        onChange={(e) => onPrinterChange(e.target.value)}
                        className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="ALL">All Printers</option>
                        {printers.map(p => <option key={p.printerId} value={p.printerId}>{p.printerName}</option>)}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => onTypeChange(e.target.value as JobTypeFilter)}
                        className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                        {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cleanup older than</span>
                    <input
                        type="number" min="1" max="365" value={cleanupDays}
                        onChange={(e) => onCleanupDaysChange(parseInt(e.target.value) || 30)}
                        className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                    <Button onClick={onCleanup} layout="outline" theme="warning" size="small" icon={Trash2}>Cleanup</Button>
                </div>
                <div className="flex items-center gap-2">
                    {failedCount > 0 && <Button onClick={onRetryAllFailed} layout="outline" theme="primary" size="small" icon={RotateCcw}>Retry Failed ({failedCount})</Button>}
                    {(pendingCount > 0 || failedCount > 0) && <Button onClick={onClearQueue} layout="outline" theme="danger" size="small" icon={Trash2}>Clear Queue</Button>}
                </div>
            </div>
        </div>
    );
};
