import { Confirm, Notify } from 'notiflix';
import { RefreshCw, Printer } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineQueueList, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { FunctionComponent, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { useIsMobile } from '../../hooks/useMediaQuery';
import printerService from '../../services/printer.service';
import { usePrintAgent } from '../../hooks/usePrintAgent';

import { getJobsTableColumns } from './partials/JobsTableColumns';
import { PrintAgentCard } from './partials/PrintAgentCard';
import { JobsFilters } from './partials/JobsFilters';
import { SetupModal } from './partials/SetupModal';
import { PrintJobMobileList } from './partials/PrintJobMobileCard';
import PrintJobSummaryCards, { getDefaultPrintJobSummaryCards } from './partials/PrintJobSummaryCards';

type JobStatusFilter = 'ALL' | PrintJobStatus;
type JobTypeFilter = 'ALL' | PrintJobType;

const PrintJobsManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('ALL');
    const [typeFilter, setTypeFilter] = useState<JobTypeFilter>('ALL');
    const [selectedPrinterId, setSelectedPrinterId] = useState<string>('ALL');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [cleanupDays, setCleanupDays] = useState(30);
    const [showSetupModal, setShowSetupModal] = useState(false);

    const {
        agentStatus, permissions, setupInstructions,
        isLoading: agentLoading, isStarting, isStopping,
        startAgent, stopAgent, refreshStatus: refreshAgentStatus, loadSetupInstructions
    } = usePrintAgent({ autoRefresh: true, refreshInterval: 5000 });

    const loadPrintJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            setPrintJobs(await printerService.getPendingJobs());
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load print jobs');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadPrinters = useCallback(async () => {
        try { setPrinters(await printerService.getAll()); } catch { /* ignore */ }
    }, []);

    const loadJobsForPrinter = useCallback(async (printerId: string) => {
        if (printerId === 'ALL') { await loadPrintJobs(); return; }
        setIsLoading(true);
        try {
            setPrintJobs(await printerService.getJobHistory(printerId));
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load job history');
        } finally {
            setIsLoading(false);
        }
    }, [loadPrintJobs]);

    useEffect(() => { loadPrintJobs(); loadPrinters(); }, [loadPrintJobs, loadPrinters]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await (selectedPrinterId === 'ALL' ? loadPrintJobs() : loadJobsForPrinter(selectedPrinterId));
            await refreshAgentStatus();
            Notify.success('Print jobs refreshed');
        } finally { setIsRefreshing(false); }
    };

    const handlePrinterChange = async (printerId: string) => {
        setSelectedPrinterId(printerId);
        setPage(1);
        await loadJobsForPrinter(printerId);
    };

    const handleCancelJob = (jobId: string, jobTitle: string) => {
        Confirm.show('Cancel Print Job', `Cancel "${jobTitle}"?`, 'Yes', 'No',
            async () => {
                try { await printerService.cancelJob(jobId); Notify.success('Job cancelled'); await handleRefresh(); }
                catch (e: any) { Notify.failure(e?.response?.data?.message || 'Failed to cancel'); }
            }, () => { }, { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    const handleRetryJob = async (jobId: string, jobTitle: string) => {
        try { await printerService.retryJob(jobId); Notify.success(`Retrying "${jobTitle}"`); await handleRefresh(); }
        catch (e: any) { Notify.failure(e?.response?.data?.message || 'Failed to retry'); }
    };

    const handleRetryAllFailed = () => {
        const count = printJobs.filter(j => j.status === 'FAILED').length;
        if (count === 0) { Notify.info('No failed jobs'); return; }
        Confirm.show('Retry All Failed', `Retry ${count} failed job(s)?`, 'Yes', 'Cancel',
            async () => {
                try { const r = await printerService.retryAllFailedJobs(); Notify.success(r.message || `Retrying ${r.affected}`); await handleRefresh(); }
                catch (e: any) { Notify.failure(e?.response?.data?.message || 'Failed'); }
            }, () => { }, { titleColor: '#f59e0b', okButtonBackground: '#f59e0b' }
        );
    };

    const handleClearQueue = () => {
        Confirm.show('Clear Queue', 'Cancel all pending/failed jobs?', 'Yes', 'Cancel',
            async () => {
                try { const r = await printerService.clearQueue(); Notify.success(r.message || `Cleared ${r.affected}`); await handleRefresh(); }
                catch (e: any) { Notify.failure(e?.response?.data?.message || 'Failed'); }
            }, () => { }, { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    const handleCleanupJobs = () => {
        Confirm.show('Cleanup Jobs', `Delete jobs older than ${cleanupDays} days?`, 'Yes', 'Cancel',
            async () => {
                try { const r = await printerService.cleanupJobs(cleanupDays); Notify.success(`Cleaned ${r.deletedCount} job(s)`); await handleRefresh(); }
                catch (e: any) { Notify.failure(e?.response?.data?.message || 'Failed'); }
            }, () => { }, { titleColor: '#f59e0b', okButtonBackground: '#f59e0b' }
        );
    };

    const handleShowSetup = async () => { await loadSetupInstructions(); setShowSetupModal(true); };

    const getPrinterName = (printerId: string) => printers.find(p => p.printerId === printerId)?.printerName || 'Unknown';

    const filteredJobs = useMemo(() => printJobs.filter(job => {
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            if (![job.jobTitle, job.printJobId, job.referenceId, getPrinterName(job.printerId)].some(v => v?.toLowerCase().includes(s))) return false;
        }
        if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
        if (typeFilter !== 'ALL' && job.jobType !== typeFilter) return false;
        return true;
    }), [printJobs, searchTerm, statusFilter, typeFilter, printers]);

    const paginatedJobs = useMemo(() => filteredJobs.slice((page - 1) * perPage, page * perPage), [filteredJobs, page, perPage]);

    const pendingCount = printJobs.filter(j => j.status === 'PENDING').length;
    const printingCount = printJobs.filter(j => j.status === 'PRINTING').length;
    const completedCount = printJobs.filter(j => j.status === 'COMPLETED').length;
    const failedCount = printJobs.filter(j => j.status === 'FAILED').length;
    const cancelledCount = printJobs.filter(j => j.status === 'CANCELLED').length;

    const summaryCards = useMemo(() => getDefaultPrintJobSummaryCards(
        printJobs.length,
        pendingCount,
        printingCount,
        completedCount,
        failedCount,
        cancelledCount
    ), [printJobs.length, pendingCount, printingCount, completedCount, failedCount, cancelledCount]);

    const columns = getJobsTableColumns(getPrinterName, handleCancelJob, handleRetryJob);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title="Print Jobs"
                    description="Monitor and manage print job queue"
                    icon={<HiOutlineQueueList className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <div className="flex items-center gap-2">
                            {!isMobile && <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search jobs..." />}
                            <Button onClick={handleRefresh} icon={RefreshCw} layout="outline" theme="primary" disabled={isRefreshing}>
                                {!isMobile && (isRefreshing ? 'Refreshing...' : 'Refresh')}
                            </Button>
                        </div>
                    }
                >
                    {isMobile && <div className="m-4 mt-0"><SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search jobs..." /></div>}
                </PageHeader>

                <PrintAgentCard
                    agentStatus={agentStatus} permissions={permissions}
                    isStarting={isStarting} isStopping={isStopping} agentLoading={agentLoading} isMobile={isMobile}
                    onStart={startAgent} onStop={stopAgent} onShowSetup={handleShowSetup}
                />

                <JobsFilters
                    statusFilter={statusFilter} typeFilter={typeFilter} selectedPrinterId={selectedPrinterId}
                    printers={printers} cleanupDays={cleanupDays}
                    totalCount={printJobs.length} pendingCount={pendingCount} printingCount={printingCount}
                    completedCount={completedCount} failedCount={failedCount} cancelledCount={cancelledCount}
                    onStatusChange={(s) => { setStatusFilter(s); setPage(1); }}
                    onTypeChange={(t) => { setTypeFilter(t); setPage(1); }}
                    onPrinterChange={handlePrinterChange}
                    onCleanupDaysChange={setCleanupDays}
                    onCleanup={handleCleanupJobs} onRetryAllFailed={handleRetryAllFailed} onClearQueue={handleClearQueue}
                />

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Summary Cards */}
                    <PrintJobSummaryCards cards={summaryCards} isLoading={isLoading} />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <PrintJobMobileList
                                    jobs={[]}
                                    getPrinterName={getPrinterName}
                                    onCancel={handleCancelJob}
                                    onRetry={handleRetryJob}
                                    isLoading={true}
                                />
                            ) : filteredJobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineQueueList className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'No jobs match filters' : 'No print jobs'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                                            ? "Try adjusting your filters to find jobs."
                                            : selectedPrinterId === 'ALL' ? "No pending jobs in the queue." : "No job history for this printer."}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <PrintJobMobileList
                                        jobs={paginatedJobs}
                                        getPrinterName={getPrinterName}
                                        onCancel={handleCancelJob}
                                        onRetry={handleRetryJob}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {filteredJobs.length} total
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(Math.max(1, page - 1))}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {page} / {Math.ceil(filteredJobs.length / perPage) || 1}
                                            </span>
                                            <button
                                                onClick={() => setPage(Math.min(Math.ceil(filteredJobs.length / perPage), page + 1))}
                                                disabled={page >= Math.ceil(filteredJobs.length / perPage)}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
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
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50]}
                                onChangeRowsPerPage={(n, p) => { setPage(p); setPerPage(n); }}
                                onChangePage={setPage}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 550px)"
                                customStyles={getTableStyles(mode)}
                                noDataComponent={
                                    <div className="text-center py-12 dark:bg-gray-800">
                                        <HiOutlineQueueList className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                                            {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'No jobs match filters.' : selectedPrinterId === 'ALL' ? 'No pending jobs.' : 'No job history.'}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            <SetupModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} setupInstructions={setupInstructions} />
        </AppLayout>
    );
};

export default PrintJobsManagement;
