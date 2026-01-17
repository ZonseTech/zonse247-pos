import { Confirm, Notify } from 'notiflix';
import { Printer, Radar, ListTodo } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePrinter, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { usePrinters } from '../../hooks/usePrinters';
import { FunctionComponent, useContext, useState, useMemo } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getPrinterColumns } from './partials/PrinterTableColumns';
import { PrinterMobileList } from './partials/PrinterMobileCard';
import PrinterSummaryCards, { getDefaultPrinterSummaryCards } from './partials/PrinterSummaryCards';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import printerService from '../../services/printer.service';
import { DiscoveryModal, DiscoveryFilterType } from './partials/DiscoveryModal';

const PrinterManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
    const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<DiscoveredPrinter | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedConnectionType, setSelectedConnectionType] = useState<DiscoveryFilterType>('ALL');
    const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilterType>('ALL');

    const {
        isLoading, searchTerm, setSearchTerm, totalRows, setPage, setPerPage, getPaginatedData,
        deletePrinter, setDefault, activatePrinter, deactivatePrinter, testConnection, printTestPage,
        discoverPrinters, refreshPrinters, filteredPrinters, page, perPage
    } = usePrinters();

    // Summary card data
    const summaryCards = useMemo(() => {
        const online = filteredPrinters.filter(p => p.status === 'ONLINE').length;
        const offline = filteredPrinters.filter(p => p.status !== 'ONLINE').length;
        const defaultCount = filteredPrinters.filter(p => p.isDefault).length;
        return getDefaultPrinterSummaryCards(totalRows, online, offline, defaultCount);
    }, [filteredPrinters, totalRows]);

    const handleDiscoverPrinters = async (connectionType?: DiscoveryFilterType) => {
        setIsDiscovering(true);
        setShowDiscoveryModal(true);
        setDiscoveredPrinters([]);
        setSelectedPrinter(null);
        const filterType = connectionType || selectedConnectionType;
        setDiscoveryFilter(filterType);
        try {
            const discovered = await discoverPrinters(filterType === 'ALL' ? undefined : filterType as PrinterConnectionType);
            setDiscoveredPrinters(discovered);
        } finally { setIsDiscovering(false); }
    };

    const handleConnectionTypeChange = async (type: DiscoveryFilterType) => {
        setSelectedConnectionType(type);
        if (showDiscoveryModal) await handleDiscoverPrinters(type);
    };

    const handleSaveSelectedPrinter = async () => {
        if (!selectedPrinter) { Notify.warning('Select a printer first'); return; }
        setIsSaving(true);
        try {
            await printerService.create({
                printerName: selectedPrinter.name,
                printerModel: selectedPrinter.model || selectedPrinter.manufacturer || undefined,
                printerType: selectedPrinter.type || 'THERMAL',
                connectionType: selectedPrinter.connectionType,
                connectionAddress: selectedPrinter.address || undefined,
                port: selectedPrinter.port || undefined,
                vendorId: selectedPrinter.vendorId || undefined,
                productId: selectedPrinter.productId || undefined,
                serialNumber: selectedPrinter.serialNumber || undefined,
                isDefault: false, isReceiptPrinter: true, isLabelPrinter: false, isKitchenPrinter: false, isReportPrinter: false,
            });
            Notify.success(`Printer "${selectedPrinter.name}" added`);
            handleCloseModal();
            await refreshPrinters();
        } catch (e: any) { Notify.failure(e?.response?.data?.message || 'Failed to save'); }
        finally { setIsSaving(false); }
    };

    const handleCloseModal = () => {
        setShowDiscoveryModal(false);
        setSelectedPrinter(null);
        setDiscoveredPrinters([]);
        setSelectedConnectionType('ALL');
        setDiscoveryFilter('ALL');
    };

    const handleEdit = (printer: Printer) => navigate(ROUTES.PRINTER_FORM, { state: { printerId: printer.printerId } });

    const handleDelete = (printerId: string, printerName: string) => {
        Confirm.show('Delete Printer', `Delete "${printerName}"?`, 'Yes', 'Cancel',
            async () => { await deletePrinter(printerId); }, () => { },
            { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    const handleSetDefault = (printerId: string) => {
        Confirm.show('Set Default', 'Set as default printer?', 'Yes', 'Cancel',
            async () => { await setDefault(printerId); }, () => { },
            { titleColor: '#eab308', okButtonBackground: '#eab308' }
        );
    };

    const handleToggleActive = (printerId: string, isActive: boolean) => {
        const action = isActive ? 'Deactivate' : 'Activate';
        const color = isActive ? '#ef4444' : '#22c55e';
        Confirm.show(`${action} Printer`, `${action} this printer?`, `Yes, ${action}`, 'Cancel',
            async () => { await (isActive ? deactivatePrinter : activatePrinter)(printerId); }, () => { },
            { titleColor: color, okButtonBackground: color }
        );
    };

    const handlePrintTestPage = (printerId: string) => {
        Confirm.show('Print Test Page', 'Print a test page?', 'Yes', 'Cancel',
            async () => { await printTestPage(printerId); }, () => { },
            { titleColor: '#8b5cf6', okButtonBackground: '#8b5cf6' }
        );
    };

    const columns = getPrinterColumns(handleEdit, handleDelete, handleSetDefault, handleToggleActive, testConnection, handlePrintTestPage);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Printers'
                    description='Manage your printer devices and print settings'
                    icon={<HiOutlinePrinter className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 dark:text-sky-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {!isMobile && <SearchBar value={searchTerm} onChange={setSearchTerm} />}
                            <Button onClick={() => navigate(ROUTES.PRINT_JOBS)} icon={ListTodo} layout="outline" theme='neutral'>
                                {!isMobile && <span className='hidden md:block'>Print Jobs</span>}
                            </Button>
                            <Button onClick={() => handleDiscoverPrinters()} icon={Radar} layout={isMobile ? 'outline' : 'primary'} theme='primary' disabled={isDiscovering}>
                                {!isMobile && <span className='hidden md:block'>{isDiscovering ? 'Discovering...' : 'Discover Printers'}</span>}
                            </Button>
                        </div>
                    }
                >
                    {isMobile && <div className='m-4 mt-0'><SearchBar value={searchTerm} onChange={setSearchTerm} /></div>}
                </PageHeader>

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Summary Cards */}
                    <PrinterSummaryCards cards={summaryCards} isLoading={isLoading} />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <PrinterMobileList
                                    printers={[]}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onSetDefault={handleSetDefault}
                                    onToggleActive={handleToggleActive}
                                    onTestConnection={testConnection}
                                    onPrintTestPage={handlePrintTestPage}
                                    isLoading={true}
                                />
                            ) : filteredPrinters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Printer className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm ? 'No matching printers' : 'No printers yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm
                                            ? "Try adjusting your search to find printers."
                                            : "Discover or add printers to get started."}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <PrinterMobileList
                                        printers={getPaginatedData()}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onSetDefault={handleSetDefault}
                                        onToggleActive={handleToggleActive}
                                        onTestConnection={testConnection}
                                        onPrintTestPage={handlePrintTestPage}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {totalRows} total
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
                                                {page} / {Math.ceil(totalRows / perPage) || 1}
                                            </span>
                                            <button
                                                onClick={() => setPage(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                                                disabled={page >= Math.ceil(totalRows / perPage)}
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
                                data={getPaginatedData()}
                                theme={mode as string}
                                progressPending={isLoading}
                                highlightOnHover
                                striped
                                responsive
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50]}
                                onChangeRowsPerPage={(n, p) => { setPage(p); setPerPage(n); }}
                                onChangePage={setPage}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 450px)"
                                customStyles={getTableStyles(mode)}
                                noDataComponent={
                                    <div className="text-center py-12 dark:bg-gray-800">
                                        <Printer className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                                            {searchTerm ? 'No printers found.' : 'No printers.'}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            <DiscoveryModal
                isOpen={showDiscoveryModal} isDiscovering={isDiscovering}
                selectedConnectionType={selectedConnectionType} discoveryFilter={discoveryFilter}
                discoveredPrinters={discoveredPrinters} selectedPrinter={selectedPrinter}
                isSaving={isSaving} isMobile={isMobile}
                onClose={handleCloseModal} onConnectionTypeChange={handleConnectionTypeChange}
                onRefresh={() => handleDiscoverPrinters(selectedConnectionType)}
                onSelect={setSelectedPrinter} onSave={handleSaveSelectedPrinter}
            />
        </AppLayout>
    );
};

export default PrinterManagement;
