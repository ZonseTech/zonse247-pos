import { Confirm, Notify } from 'notiflix';
import {
    Printer,
    RefreshCw,
    X,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Trash2,
    FileText,
    Receipt,
    Tag,
    ChefHat,
    FileBarChart,
    TestTube,
    Filter,
    Play,
    Square,
    RotateCcw,
    Settings,
    Zap,
    Activity,
    ExternalLink
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineQueueList } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FunctionComponent, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { useIsMobile } from '../../hooks/useMediaQuery';
import printerService from '../../services/printer.service';
import { usePrintAgent } from '../../hooks/usePrintAgent';
import { formatDistanceToNow, format } from 'date-fns';
import CustomModal from '../../components/Modal';

type JobStatusFilter = 'ALL' | PrintJobStatus;
type JobTypeFilter = 'ALL' | PrintJobType;

const STATUS_OPTIONS: { value: JobStatusFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'ALL', label: 'All', icon: <Filter className="w-4 h-4" /> },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { value: 'PRINTING', label: 'Printing', icon: <Loader2 className="w-4 h-4" /> },
    { value: 'COMPLETED', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'FAILED', label: 'Failed', icon: <XCircle className="w-4 h-4" /> },
    { value: 'CANCELLED', label: 'Cancelled', icon: <X className="w-4 h-4" /> },
];

const TYPE_OPTIONS: { value: JobTypeFilter; label: string }[] = [
    { value: 'ALL', label: 'All Types' },
    { value: 'RECEIPT', label: 'Receipt' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'REPORT', label: 'Report' },
    { value: 'LABEL', label: 'Label' },
    { value: 'BARCODE', label: 'Barcode' },
    { value: 'KITCHEN_ORDER', label: 'Kitchen Order' },
    { value: 'TEST_PAGE', label: 'Test Page' },
];

const PrintJobsManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [queueStatus, setQueueStatus] = useState<PrintQueueStatus | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('ALL');
    const [typeFilter, setTypeFilter] = useState<JobTypeFilter>('ALL');
    const [selectedPrinterId, setSelectedPrinterId] = useState<string>('ALL');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [cleanupDays, setCleanupDays] = useState(30);
    const [showSetupModal, setShowSetupModal] = useState(false);

    // Print Agent hook
    const {
        agentStatus,
        permissions,
        setupInstructions,
        isLoading: agentLoading,
        isStarting,
        isStopping,
        startAgent,
        stopAgent,
        refreshStatus: refreshAgentStatus,
        loadSetupInstructions,
    } = usePrintAgent({ autoRefresh: true, refreshInterval: 5000 });

    const loadPrintJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const pendingJobs = await printerService.getPendingJobs();
            setPrintJobs(pendingJobs);
        } catch (error: any) {
            console.error('Error loading print jobs:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load print jobs';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadQueueStatus = useCallback(async () => {
        try {
            const status = await printerService.getQueueStatus();
            setQueueStatus(status);
        } catch (error: any) {
            console.error('Error loading queue status:', error);
        }
    }, []);

    const loadPrinters = useCallback(async () => {
        try {
            const printersData = await printerService.getAll();
            setPrinters(printersData);
        } catch (error: any) {
            console.error('Error loading printers:', error);
        }
    }, []);

    const loadJobsForPrinter = useCallback(async (printerId: string) => {
        if (printerId === 'ALL') {
            await loadPrintJobs();
            return;
        }

        setIsLoading(true);
        try {
            const jobs = await printerService.getJobHistory(printerId);
            setPrintJobs(jobs);
        } catch (error: any) {
            console.error('Error loading job history:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load job history';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [loadPrintJobs]);

    useEffect(() => {
        loadPrintJobs();
        loadPrinters();
        loadQueueStatus();
    }, [loadPrintJobs, loadPrinters, loadQueueStatus]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (selectedPrinterId === 'ALL') {
                await loadPrintJobs();
            } else {
                await loadJobsForPrinter(selectedPrinterId);
            }
            await loadQueueStatus();
            await refreshAgentStatus();
            Notify.success('Print jobs refreshed');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handlePrinterChange = async (printerId: string) => {
        setSelectedPrinterId(printerId);
        setPage(1);
        await loadJobsForPrinter(printerId);
    };

    const handleCancelJob = (jobId: string, jobTitle: string) => {
        Confirm.show(
            'Cancel Print Job',
            `Are you sure you want to cancel "${jobTitle}"?`,
            'Yes, Cancel',
            'No',
            async () => {
                try {
                    await printerService.cancelJob(jobId);
                    Notify.success('Print job cancelled successfully');
                    await handleRefresh();
                } catch (error: any) {
                    console.error('Error cancelling print job:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to cancel print job';
                    Notify.failure(errorMessage);
                }
            },
            () => { },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleRetryJob = async (jobId: string, jobTitle: string) => {
        try {
            await printerService.retryJob(jobId);
            Notify.success(`Retrying "${jobTitle}"`);
            await handleRefresh();
        } catch (error: any) {
            console.error('Error retrying print job:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to retry print job';
            Notify.failure(errorMessage);
        }
    };

    const handleRetryAllFailed = () => {
        const failedJobsCount = queueStatus?.failedJobs || failedCount;
        if (failedJobsCount === 0) {
            Notify.info('No failed jobs to retry');
            return;
        }

        Confirm.show(
            'Retry All Failed Jobs',
            `Are you sure you want to retry all ${failedJobsCount} failed job(s)?`,
            'Yes, Retry All',
            'Cancel',
            async () => {
                try {
                    const result = await printerService.retryAllFailedJobs();
                    Notify.success(result.message || `Retrying ${result.affected} job(s)`);
                    await handleRefresh();
                } catch (error: any) {
                    console.error('Error retrying all failed jobs:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to retry jobs';
                    Notify.failure(errorMessage);
                }
            },
            () => { },
            {
                titleColor: '#f59e0b',
                okButtonBackground: '#f59e0b',
            }
        );
    };

    const handleClearQueue = () => {
        Confirm.show(
            'Clear Print Queue',
            'This will cancel all pending and failed jobs in the queue. Are you sure?',
            'Yes, Clear Queue',
            'Cancel',
            async () => {
                try {
                    const result = await printerService.clearQueue();
                    Notify.success(result.message || `Cleared ${result.affected} job(s)`);
                    await handleRefresh();
                } catch (error: any) {
                    console.error('Error clearing queue:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to clear queue';
                    Notify.failure(errorMessage);
                }
            },
            () => { },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleShowSetup = async () => {
        await loadSetupInstructions();
        setShowSetupModal(true);
    };

    const handleCleanupJobs = () => {
        Confirm.show(
            'Cleanup Old Print Jobs',
            `This will permanently delete all print jobs older than ${cleanupDays} days. Are you sure?`,
            'Yes, Cleanup',
            'Cancel',
            async () => {
                try {
                    const result = await printerService.cleanupJobs(cleanupDays);
                    Notify.success(`Cleaned up ${result.deletedCount} old print job(s)`);
                    await handleRefresh();
                } catch (error: any) {
                    console.error('Error cleaning up print jobs:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to cleanup print jobs';
                    Notify.failure(errorMessage);
                }
            },
            () => { },
            {
                titleColor: '#f59e0b',
                okButtonBackground: '#f59e0b',
            }
        );
    };

    const getJobTypeIcon = (jobType: PrintJobType) => {
        switch (jobType) {
            case 'RECEIPT':
                return <Receipt className="w-4 h-4" />;
            case 'INVOICE':
                return <FileText className="w-4 h-4" />;
            case 'REPORT':
                return <FileBarChart className="w-4 h-4" />;
            case 'LABEL':
            case 'BARCODE':
                return <Tag className="w-4 h-4" />;
            case 'KITCHEN_ORDER':
                return <ChefHat className="w-4 h-4" />;
            case 'TEST_PAGE':
                return <TestTube className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status: PrintJobStatus) => {
        const statusConfig: Record<PrintJobStatus, { bg: string; text: string; icon: React.ReactNode }> = {
            PENDING: {
                bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                text: 'text-yellow-800 dark:text-yellow-300',
                icon: <Clock className="w-3 h-3" />
            },
            PRINTING: {
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-800 dark:text-blue-300',
                icon: <Loader2 className="w-3 h-3 animate-spin" />
            },
            COMPLETED: {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-800 dark:text-green-300',
                icon: <CheckCircle className="w-3 h-3" />
            },
            FAILED: {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-800 dark:text-red-300',
                icon: <XCircle className="w-3 h-3" />
            },
            CANCELLED: {
                bg: 'bg-gray-100 dark:bg-gray-700',
                text: 'text-gray-800 dark:text-gray-300',
                icon: <X className="w-3 h-3" />
            }
        };

        const config = statusConfig[status] || statusConfig.PENDING;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.icon}
                {status}
            </span>
        );
    };

    const getPrinterName = (printerId: string): string => {
        const printer = printers.find(p => p.printerId === printerId);
        return printer?.printerName || 'Unknown Printer';
    };

    const filteredJobs = useMemo(() => {
        return printJobs.filter(job => {
            // Search filter
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                const matchesSearch =
                    job.jobTitle?.toLowerCase().includes(lowerSearch) ||
                    job.printJobId?.toLowerCase().includes(lowerSearch) ||
                    job.referenceId?.toLowerCase().includes(lowerSearch) ||
                    getPrinterName(job.printerId)?.toLowerCase().includes(lowerSearch);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (statusFilter !== 'ALL' && job.status !== statusFilter) {
                return false;
            }

            // Type filter
            if (typeFilter !== 'ALL' && job.jobType !== typeFilter) {
                return false;
            }

            return true;
        });
    }, [printJobs, searchTerm, statusFilter, typeFilter, printers]);

    const paginatedJobs = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredJobs.slice(startIndex, startIndex + perPage);
    }, [filteredJobs, page, perPage]);

    const columns: TableColumn<PrintJob>[] = [
        {
            name: 'Job Title',
            selector: row => row.jobTitle,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-2 py-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {getJobTypeIcon(row.jobType)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            {row.jobTitle}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {row.printJobId.slice(0, 8)}...
                        </div>
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
                    <span className="text-gray-700 dark:text-gray-300">
                        {getPrinterName(row.printerId)}
                    </span>
                </div>
            ),
            minWidth: '150px',
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => getStatusBadge(row.status),
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
            name: 'Reference',
            selector: row => row.referenceId || '-',
            sortable: true,
            cell: row => (
                <div className="text-sm">
                    {row.referenceId ? (
                        <div>
                            <span className="text-gray-900 dark:text-gray-100">
                                {row.referenceId.slice(0, 8)}...
                            </span>
                            {row.referenceType && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {row.referenceType}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
            minWidth: '120px',
        },
        {
            name: 'Created',
            selector: row => row.createdAt?.toString() || '',
            sortable: true,
            cell: row => (
                <div className="text-sm">
                    {row.createdAt ? (
                        <div>
                            <div className="text-gray-900 dark:text-gray-100">
                                {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(row.createdAt), 'MMM dd, HH:mm')}
                            </div>
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
            minWidth: '140px',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex items-center gap-2">
                    {row.status === 'PENDING' && (
                        <button
                            onClick={() => handleCancelJob(row.printJobId, row.jobTitle)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Cancel Job"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {row.status === 'FAILED' && (
                        <>
                            <button
                                onClick={() => handleRetryJob(row.printJobId, row.jobTitle)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Retry Job"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            {row.errorMessage && (
                                <button
                                    onClick={() => Notify.info(row.errorMessage || 'Unknown error')}
                                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                    title="View Error"
                                >
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

    const pendingCount = printJobs.filter(j => j.status === 'PENDING').length;
    const printingCount = printJobs.filter(j => j.status === 'PRINTING').length;
    const failedCount = printJobs.filter(j => j.status === 'FAILED').length;

    const getAgentStatusColor = () => {
        if (!agentStatus) return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
        switch (agentStatus.status) {
            case 'RUNNING':
                return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' };
            case 'STOPPED':
                return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
            case 'ERROR':
                return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
            case 'STARTING':
            case 'STOPPING':
                return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' };
            default:
                return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
        }
    };

    const agentColors = getAgentStatusColor();

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title="Print Jobs"
                    description="Monitor and manage print job queue"
                    icon={<HiOutlineQueueList className="w-8 h-8 text-sky-600 dark:text-sky-400" />}
                    action={
                        <div className="flex items-center gap-2">
                            {!isMobile && (
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search jobs..."
                                />
                            )}
                            <Button
                                onClick={handleRefresh}
                                icon={RefreshCw}
                                layout="outline"
                                theme="primary"
                                disabled={isRefreshing}
                            >
                                {!isMobile && (isRefreshing ? 'Refreshing...' : 'Refresh')}
                            </Button>
                        </div>
                    }
                >
                    {isMobile && (
                        <div className="m-4 mt-0">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search jobs..."
                            />
                        </div>
                    )}
                </PageHeader>

                {/* Print Agent Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4 md:mx-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${agentColors.bg}`}>
                                <Activity className={`w-6 h-6 ${agentColors.text}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Print Agent</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${agentColors.bg} ${agentColors.text}`}>
                                        {agentStatus?.status || 'UNKNOWN'}
                                    </span>
                                    {agentStatus?.isRunning && (
                                        <>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                • {agentStatus.connectedPrinters} printer(s) connected
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                • {agentStatus.processedJobs} processed
                                            </span>
                                        </>
                                    )}
                                    {agentStatus?.lastError && (
                                        <span className="text-xs text-red-500" title={agentStatus.lastError}>
                                            • Error occurred
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!agentStatus?.isRunning ? (
                                <Button
                                    onClick={startAgent}
                                    icon={Play}
                                    theme="success"
                                    size="small"
                                    disabled={isStarting || agentLoading}
                                >
                                    {isStarting ? 'Starting...' : 'Start Agent'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopAgent}
                                    icon={Square}
                                    theme="danger"
                                    layout="outline"
                                    size="small"
                                    disabled={isStopping || agentLoading}
                                >
                                    {isStopping ? 'Stopping...' : 'Stop Agent'}
                                </Button>
                            )}
                            <Button
                                onClick={handleShowSetup}
                                icon={Settings}
                                layout="outline"
                                theme="neutral"
                                size="small"
                            >
                                {!isMobile && 'Setup'}
                            </Button>
                        </div>
                    </div>

                    {/* Permissions Warning */}
                    {permissions && permissions.missingPermissions && permissions.missingPermissions.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Missing Permissions
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        {permissions.missingPermissions.join(', ')}
                                    </p>
                                    {permissions.instructions && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            {permissions.instructions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-4 md:px-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {pendingCount}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {printingCount}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Printing</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {failedCount}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Failed</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {printJobs.length}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4 md:mx-0">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setStatusFilter(option.value);
                                            setPage(1);
                                        }}
                                        className={`
                                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                            transition-all duration-200
                                            ${statusFilter === option.value
                                                ? 'bg-sky-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }
                                        `}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Printer Filter */}
                        <div className="w-full lg:w-64">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Printer
                            </label>
                            <select
                                value={selectedPrinterId}
                                onChange={(e) => handlePrinterChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="ALL">All Printers (Pending)</option>
                                {printers.map(printer => (
                                    <option key={printer.printerId} value={printer.printerId}>
                                        {printer.printerName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="w-full lg:w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Job Type
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as JobTypeFilter);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            >
                                {TYPE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cleanup Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Cleanup jobs older than
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={cleanupDays}
                                    onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
                                    className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                                <Button
                                    onClick={handleCleanupJobs}
                                    layout="outline"
                                    theme="warning"
                                    size="small"
                                    icon={Trash2}
                                >
                                    Cleanup
                                </Button>
                            </div>
                        </div>

                        {/* Queue Actions */}
                        <div className="flex items-center gap-2">
                            {failedCount > 0 && (
                                <Button
                                    onClick={handleRetryAllFailed}
                                    layout="outline"
                                    theme="primary"
                                    size="small"
                                    icon={RotateCcw}
                                >
                                    Retry Failed ({failedCount})
                                </Button>
                            )}
                            {(pendingCount > 0 || failedCount > 0) && (
                                <Button
                                    onClick={handleClearQueue}
                                    layout="outline"
                                    theme="danger"
                                    size="small"
                                    icon={Trash2}
                                >
                                    Clear Queue
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={paginatedJobs}
                    theme={mode as string}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={filteredJobs.length}
                    onChangeRowsPerPage={(newPerPage, newPage) => {
                        setPage(newPage);
                        setPerPage(newPerPage);
                    }}
                    onChangePage={setPage}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 550px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-12">
                            <HiOutlineQueueList className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                                    ? 'No print jobs found matching your filters.'
                                    : selectedPrinterId === 'ALL'
                                        ? 'No pending print jobs.'
                                        : 'No print job history for this printer.'}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {selectedPrinterId === 'ALL'
                                    ? 'Print jobs will appear here when sent to printers.'
                                    : 'Select a different printer or check pending jobs.'}
                            </p>
                        </div>
                    }
                />
            </div>

            {/* Setup Instructions Modal */}
            <CustomModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                title="Print Agent Setup Instructions"
            >
                {setupInstructions ? (
                    <div className="space-y-6">
                        {/* Platform Info */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Platform Information
                            </h4>
                            <div className="text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Operating System:</span>
                                <span className="ml-2 text-gray-900 dark:text-gray-100 capitalize">
                                    {setupInstructions.os}
                                </span>
                            </div>
                        </div>

                        {/* Setup Instructions */}
                        {setupInstructions.instructions && setupInstructions.instructions.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Setup Steps
                                </h4>
                                <ol className="space-y-3">
                                    {setupInstructions.instructions.map((step, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 
                                                text-primary-600 dark:text-primary-400 text-sm font-medium 
                                                flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {step}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Commands */}
                        {setupInstructions.commands && setupInstructions.commands.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Commands
                                </h4>
                                <div className="space-y-2">
                                    {setupInstructions.commands.map((command, index) => (
                                        <div key={index} className="p-3 bg-gray-800 dark:bg-gray-900 rounded-lg">
                                            <code className="text-sm text-green-400 font-mono break-all">
                                                {command}
                                            </code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        {setupInstructions.links && setupInstructions.links.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Helpful Links
                                </h4>
                                <ul className="space-y-2">
                                    {setupInstructions.links.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 dark:text-primary-400 hover:underline 
                                                    flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                            <Button
                                onClick={() => setShowSetupModal(false)}
                                layout="outline"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent 
                            rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading setup instructions...
                        </p>
                    </div>
                )}
            </CustomModal>
        </AppLayout>
    );
};

export default PrintJobsManagement;
