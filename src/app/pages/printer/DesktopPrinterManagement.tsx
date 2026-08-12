import { Confirm, Notify } from 'notiflix';
import { Radar, ListTodo } from 'lucide-react';
import { Box, Button, Card, Flex } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePrinter } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import { usePrinters } from '../../hooks/usePrinters';
import { FunctionComponent, useState } from 'react';
import PageHeader from '../../components/page/PageHeader';
import { PrinterTable } from './partials/PrinterTable';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import printerService from '../../services/printer.service';
import { DiscoveryModal, DiscoveryFilterType } from './partials/DiscoveryModal';
import EditPrinterModal from './partials/EditPrinterModal';
import { getErrorMessage } from '../../utils/api-error-handler';

const DesktopPrinterManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
    const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<DiscoveredPrinter | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedConnectionType, setSelectedConnectionType] = useState<DiscoveryFilterType>('USB');
    const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilterType>('USB');
    const [showEditModal, setShowEditModal] = useState(false);
    const [printerToEdit, setPrinterToEdit] = useState<Printer | null>(null);

    const {
        printers, isLoading, searchTerm, setSearchTerm, page, totalRows, perPage,
        handlePageChange, handlePerRowsChange,
        deletePrinter, setDefault, testConnection, printTestPage,
        discoverPrinters, refreshPrinters,
    } = usePrinters();

    const handleDiscoverPrinters = async (connectionType?: DiscoveryFilterType) => {
        setIsDiscovering(true);
        setShowDiscoveryModal(true);
        setDiscoveredPrinters([]);
        setSelectedPrinter(null);
        const filterType = connectionType || selectedConnectionType;
        setDiscoveryFilter(filterType);
        try {
            const discovered = await discoverPrinters(filterType as PrinterConnectionType);
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
        } catch (e: any) {
            const errorMessage = getErrorMessage(e, 'Failed to save printer');
            Notify.failure(errorMessage);
        }
        finally { setIsSaving(false); }
    };

    const handleCloseModal = () => {
        setShowDiscoveryModal(false);
        setSelectedPrinter(null);
        setDiscoveredPrinters([]);
    };

    const handleEdit = (printer: Printer) => {
        setPrinterToEdit(printer);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setPrinterToEdit(null);
    };

    const handleSaveEditModal = async () => {
        await refreshPrinters();
    };

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

    const handlePrintTestPage = (printerId: string) => {
        Confirm.show('Print Test Page', 'Print a test page?', 'Yes', 'Cancel',
            async () => { await printTestPage(printerId); }, () => { },
            { titleColor: '#8b5cf6', okButtonBackground: '#8b5cf6' }
        );
    };

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    title='Printers'
                    description='Manage your printer devices and print settings'
                    icon={<HiOutlinePrinter className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Flex align="center" justify="between" gap="2">
                            <SearchBar value={searchTerm} onChange={setSearchTerm} />
                            <Button onClick={() => navigate(ROUTES.PRINT_JOBS)} variant="outline" color="gray" size="2">
                                <ListTodo className="w-4 h-4" />
                                <span className='hidden md:block'>Print Jobs</span>
                            </Button>
                            <Button onClick={() => handleDiscoverPrinters()} size="2" disabled={isDiscovering}>
                                <Radar className="w-4 h-4" />
                                <span className='hidden md:block'>{isDiscovering ? 'Discovering...' : 'Discover Printers'}</span>
                            </Button>
                        </Flex>
                    }
                />

                <PrinterTable
                    printers={printers}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onPerPageChange={(newPerPage) => handlePerRowsChange(newPerPage, 1)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                    onTestConnection={testConnection}
                    onPrintTestPage={handlePrintTestPage}
                />

                <EditPrinterModal
                    isOpen={showEditModal}
                    printer={printerToEdit}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveEditModal}
                    onDelete={deletePrinter}
                />
            </Box>

            <DiscoveryModal
                isOpen={showDiscoveryModal} isDiscovering={isDiscovering}
                selectedConnectionType={selectedConnectionType} discoveryFilter={discoveryFilter}
                discoveredPrinters={discoveredPrinters} selectedPrinter={selectedPrinter}
                isSaving={isSaving} isMobile={false}
                onClose={handleCloseModal} onConnectionTypeChange={handleConnectionTypeChange}
                onRefresh={() => handleDiscoverPrinters(selectedConnectionType)}
                onSelect={setSelectedPrinter} onSave={handleSaveSelectedPrinter}
            />
        </AppLayout>
    );
};

export default DesktopPrinterManagement;
