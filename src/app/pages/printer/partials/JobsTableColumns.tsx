import { TableColumn } from 'react-data-table-component';
import { Printer, X, RotateCcw, AlertCircle, Clock, Loader2, CheckCircle, XCircle, Receipt, FileText, FileBarChart, Tag, ChefHat, TestTube } from 'lucide-react';
import { Notify } from 'notiflix';
import { formatDistanceToNow, format } from 'date-fns';

const JOB_TYPE_ICONS: Record<PrintJobType, React.ReactNode> = {
    RECEIPT: <Receipt className="w-4 h-4" />,
    INVOICE: <FileText className="w-4 h-4" />,
    REPORT: <FileBarChart className="w-4 h-4" />,
    LABEL: <Tag className="w-4 h-4" />,
    BARCODE: <Tag className="w-4 h-4" />,
    KITCHEN_ORDER: <ChefHat className="w-4 h-4" />,
    TEST_PAGE: <TestTube className="w-4 h-4" />,
};

const STATUS_CONFIG: Record<PrintJobStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: <Clock className="w-3 h-3" /> },
    PRINTING: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: <CheckCircle className="w-3 h-3" /> },
    FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: <XCircle className="w-3 h-3" /> },
    CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', icon: <X className="w-3 h-3" /> },
};

export const getJobsTableColumns = (
    getPrinterName: (printerId: string) => string,
    onCancel: (jobId: string, jobTitle: string) => void,
    onRetry: (jobId: string, jobTitle: string) => void
): TableColumn<PrintJob>[] => [
        {
            name: 'Job Title',
            selector: row => row.jobTitle,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-2 py-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {JOB_TYPE_ICONS[row.jobType] || <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{row.jobTitle}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.printJobId.slice(0, 8)}...</div>
                    </div>
                </div>
            ),
            minWidth: '200px',
        },
        {
            name: 'Type',
            selector: row => row.jobType,
            sortable: true,
            cell: row => (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {row.jobType.replace('_', ' ')}
                </span>
            ),
            minWidth: '120px',
        },
        {
            name: 'Printer',
            selector: row => getPrinterName(row.printerId),
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{getPrinterName(row.printerId)}</span>
                </div>
            ),
            minWidth: '150px',
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => {
                const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.PENDING;
                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.icon}
                        {row.status}
                    </span>
                );
            },
            minWidth: '130px',
        },
        {
            name: 'Copies',
            selector: row => row.copies || 1,
            sortable: true,
            center: true,
            width: '80px',
        },
        {
            name: 'Created',
            selector: row => row.createdAt?.toString() || '',
            sortable: true,
            cell: row => row.createdAt ? (
                <div className="text-sm">
                    <div className="text-gray-900 dark:text-gray-100">{formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(row.createdAt), 'MMM dd, HH:mm')}</div>
                </div>
            ) : <span className="text-gray-400">-</span>,
            minWidth: '140px',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex items-center gap-2">
                    {row.status === 'PENDING' && (
                        <button onClick={() => onCancel(row.printJobId, row.jobTitle)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Cancel">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {row.status === 'FAILED' && (
                        <>
                            <button onClick={() => onRetry(row.printJobId, row.jobTitle)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Retry">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            {row.errorMessage && (
                                <button onClick={() => Notify.info(row.errorMessage || 'Unknown error')} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20" title="View Error">
                                    <AlertCircle className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            ),
            width: '120px',
            right: true,
        },
    ];
