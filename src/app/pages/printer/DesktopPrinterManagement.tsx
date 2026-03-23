import { Confirm, Notify } from 'notiflix';
import { Printer, Radar, ListTodo } from 'lucide-react';
import { Box, Card, Flex, Text } from '@radix-ui/themes';
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
import printerService from '../../services/printer.service';
import { DiscoveryModal, DiscoveryFilterType } from './partials/DiscoveryModal';
import EditPrinterModal from './partials/EditPrinterModal';
import { getErrorMessage } from '../../utils/api-error-handler';

const DesktopPrinterManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
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
        printers, isLoading, searchTerm, setSearchTerm, totalRows, perPage,
        handlePageChange, handlePerRowsChange,
        deletePrinter, setDefault, activatePrinter, deactivatePrinter, testConnection, printTestPage,
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
            <Box className="max-w-full">
                <PageHeader
                    title='Printers'
                    description='Manage your printer devices and print settings'
                    icon={<HiOutlinePrinter className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Flex align="center" justify="between" gap="2">
                            <SearchBar value={searchTerm} onChange={setSearchTerm} />
                            <Button onClick={() => navigate(ROUTES.PRINT_JOBS)} icon={ListTodo} layout="outline" theme='neutral'>
                                <span className='hidden md:block'>Print Jobs</span>
                            </Button>
                            <Button onClick={() => handleDiscoverPrinters()} icon={Radar} layout="primary" theme='primary' disabled={isDiscovering}>
                                <span className='hidden md:block'>{isDiscovering ? 'Discovering...' : 'Discover Printers'}</span>
                            </Button>
                        </Flex>
                    }
                />

                <Card size="2" className="overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={printers}
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
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        fixedHeader
                        customStyles={getTableStyles(mode)}
                        noDataComponent={
                            <Flex direction="column" align="center" py="9" className="dark:bg-gray-800">
                                <Printer className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                                <Text size="2" color="gray" weight="medium">
                                    {searchTerm ? 'No printers found.' : 'No printers.'}
                                </Text>
                            </Flex>
                        }
                    />

                    <EditPrinterModal
                        isOpen={showEditModal}
                        printer={printerToEdit}
                        onClose={handleCloseEditModal}
                        onSave={handleSaveEditModal}
                        onDelete={deletePrinter}
                    />
                </Card>
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
