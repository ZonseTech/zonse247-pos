import { Notify } from 'notiflix';
import { Printer, Plus } from 'lucide-react';
import { Box, Flex, IconButton, Text } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { usePrinters } from '../../hooks/usePrinters';
import { FunctionComponent, useState } from 'react';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { ComponentLoader } from '../../components';
import PrinterMobileCard from './partials/PrinterMobileCard';
import printerService from '../../services/printer.service';
import { DiscoveryModal, DiscoveryFilterType } from './partials/DiscoveryModal';
import AddPrinterTypeModal from './partials/AddPrinterTypeModal';
import PrinterDetailModal from './partials/PrinterDetailModal';
import { getErrorMessage } from '../../utils/api-error-handler';

const MobilePrinterManagement: FunctionComponent = () => {
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
    const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailPrinter, setSelectedDetailPrinter] = useState<Printer | null>(null);
    const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<DiscoveredPrinter | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedConnectionType, setSelectedConnectionType] = useState<DiscoveryFilterType>('USB');
    const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilterType>('USB');

    const {
        printers,
        isLoading,
        totalRows,
        setPage,
        discoverPrinters,
        refreshPrinters,
        deletePrinter,
        page,
        perPage,
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

    const handleOpenDetail = (printer: Printer) => {
        setSelectedDetailPrinter(printer);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDetailPrinter(null);
    };

    const handleDeletePrinter = async (printerId: string) => {
        await deletePrinter(printerId);
        handleCloseDetailModal();
    };

    const handleSelectConnectionType = (connectionType: PrinterConnectionType) => {
        setShowAddPrinterModal(false);
        setSelectedConnectionType(connectionType);
        handleDiscoverPrinters(connectionType);
    };

    return (
        <AppLayout>
            <MobilePageHeader title="Printers" theme='sky' />

            <Box className="max-w-full">
                {isLoading ? (
                    <ComponentLoader loading={true} />
                ) : printers.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py="9" px="4">
                        <Flex
                            align="center" justify="center"
                            className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                        >
                            <Printer className="w-8 h-8 text-gray-400" />
                        </Flex>
                        <Text size="4" weight="medium" align="center" mb="2">
                            No printers yet
                        </Text>
                        <Text size="2" color="gray" align="center" className="max-w-sm">
                            Discover or add printers to get started.
                        </Text>
                    </Flex>
                ) : (
                    <>
                        <Flex direction="column" gap="3" p="2">
                            {printers.map((printer) => (
                                <PrinterMobileCard
                                    key={printer.printerId}
                                    printer={printer}
                                    onEdit={handleOpenDetail}
                                />
                            ))}
                        </Flex>

                        {totalRows >= 10 && (
                            <Flex align="center" justify="between" px="4" py="3" className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <Text size="1" color="gray">
                                    {totalRows} total
                                </Text>
                                <Flex align="center" gap="2">
                                    <IconButton
                                        variant="ghost"
                                        color="gray"
                                        size="2"
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page <= 1}
                                    >
                                        <HiOutlineChevronLeft className="w-5 h-5" />
                                    </IconButton>
                                    <Text size="2" color="gray">
                                        {page} / {Math.ceil(totalRows / perPage) || 1}
                                    </Text>
                                    <IconButton
                                        variant="ghost"
                                        color="gray"
                                        size="2"
                                        onClick={() => setPage(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                                        disabled={page >= Math.ceil(totalRows / perPage)}
                                    >
                                        <HiOutlineChevronRight className="w-5 h-5" />
                                    </IconButton>
                                </Flex>
                            </Flex>
                        )}
                    </>
                )}
            </Box>

            <DiscoveryModal
                isOpen={showDiscoveryModal} isDiscovering={isDiscovering}
                selectedConnectionType={selectedConnectionType} discoveryFilter={discoveryFilter}
                discoveredPrinters={discoveredPrinters} selectedPrinter={selectedPrinter}
                isSaving={isSaving} isMobile={true}
                onClose={handleCloseModal} onConnectionTypeChange={handleConnectionTypeChange}
                onRefresh={() => handleDiscoverPrinters(selectedConnectionType)}
                onSelect={setSelectedPrinter} onSave={handleSaveSelectedPrinter}
            />

            <AddPrinterTypeModal
                isOpen={showAddPrinterModal}
                onClose={() => setShowAddPrinterModal(false)}
                onSelect={handleSelectConnectionType}
            />

            <PrinterDetailModal
                isOpen={showDetailModal}
                printer={selectedDetailPrinter}
                onClose={handleCloseDetailModal}
                onSave={refreshPrinters}
                onDelete={handleDeletePrinter}
            />

            <div className="fixed bottom-20 right-4 z-40">
                <button
                    onClick={() => setShowAddPrinterModal(true)}
                    className="rounded-full shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 px-4 h-12 bg-sky-500 text-white active:bg-sky-700"
                >
                    <Plus className="w-5 h-5" />
                    <Text size="2" weight="medium" className="whitespace-nowrap text-white">ADD NEW PRINTER</Text>
                </button>
            </div>
        </AppLayout>
    );
};

export default MobilePrinterManagement;
