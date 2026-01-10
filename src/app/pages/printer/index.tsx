import { Confirm, Notify } from 'notiflix';
import { Printer, Radar, ListTodo } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePrinter } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { usePrinters } from '../../hooks/usePrinters';
import { FunctionComponent, useContext, useState } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getPrinterColumns } from './partials/PrinterTableColumns';
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
        discoverPrinters, refreshPrinters
    } = usePrinters();

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
            async () => { await deletePrinter(printerId); }, () => {},
            { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    const handleSetDefault = (printerId: string) => {
        Confirm.show('Set Default', 'Set as default printer?', 'Yes', 'Cancel',
            async () => { await setDefault(printerId); }, () => {},
            { titleColor: '#eab308', okButtonBackground: '#eab308' }
        );
    };

    const handleToggleActive = (printerId: string, isActive: boolean) => {
        const action = isActive ? 'Deactivate' : 'Activate';
        const color = isActive ? '#ef4444' : '#22c55e';
        Confirm.show(`${action} Printer`, `${action} this printer?`, `Yes, ${action}`, 'Cancel',
            async () => { await (isActive ? deactivatePrinter : activatePrinter)(printerId); }, () => {},
            { titleColor: color, okButtonBackground: color }
        );
    };

    const handlePrintTestPage = (printerId: string) => {
        Confirm.show('Print Test Page', 'Print a test page?', 'Yes', 'Cancel',
            async () => { await printTestPage(printerId); }, () => {},
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
                    icon={<HiOutlinePrinter className="w-8 h-8 text-sky-600 dark:text-sky-400" />}
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
                <DataTable
                    columns={columns} data={getPaginatedData()} theme={mode as string}
                    progressPending={isLoading} highlightOnHover striped responsive pagination paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={(n, p) => { setPage(p); setPerPage(n); }}
                    onChangePage={setPage} fixedHeader fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <Printer className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">{searchTerm ? 'No printers found.' : 'No printers.'}</p>
                        </div>
                    }
                />
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
