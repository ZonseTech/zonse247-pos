import { Confirm, Notify } from 'notiflix';
import { Check, Printer, Radar, Wifi, Usb, Bluetooth, Cable, RefreshCw, Layers, ListTodo } from 'lucide-react';
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
import CustomModal from '../../components/Modal';
import printerService from '../../services/printer.service';

type DiscoveryFilterType = 'ALL' | PrinterConnectionType;

const CONNECTION_TYPE_OPTIONS: { value: DiscoveryFilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'ALL', label: 'All', icon: <Layers className="w-4 h-4" /> },
    { value: 'USB', label: 'USB', icon: <Usb className="w-4 h-4" /> },
    { value: 'NETWORK', label: 'Network', icon: <Wifi className="w-4 h-4" /> },
    { value: 'SERIAL', label: 'Serial', icon: <Cable className="w-4 h-4" /> },
    { value: 'BLUETOOTH', label: 'Bluetooth', icon: <Bluetooth className="w-4 h-4" /> },
];

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
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        setPage,
        setPerPage,
        getPaginatedData,
        deletePrinter,
        setDefault,
        activatePrinter,
        deactivatePrinter,
        testConnection,
        printTestPage,
        discoverPrinters,
        refreshPrinters
    } = usePrinters();

    const getConnectionIcon = (connectionType: PrinterConnectionType) => {
        switch (connectionType) {
            case 'NETWORK':
            case 'WIFI':
                return <Wifi className="w-5 h-5" />;
            case 'USB':
                return <Usb className="w-5 h-5" />;
            case 'BLUETOOTH':
                return <Bluetooth className="w-5 h-5" />;
            case 'SERIAL':
                return <Cable className="w-5 h-5" />;
            default:
                return <Printer className="w-5 h-5" />;
        }
    };

    const handleDiscoverPrinters = async (connectionType?: DiscoveryFilterType) => {
        setIsDiscovering(true);
        setShowDiscoveryModal(true);
        setDiscoveredPrinters([]);
        setSelectedPrinter(null);

        const filterType = connectionType || selectedConnectionType;
        setDiscoveryFilter(filterType);

        try {
            const typeToDiscover = filterType === 'ALL' ? undefined : filterType as PrinterConnectionType;
            const discovered = await discoverPrinters(typeToDiscover);
            setDiscoveredPrinters(discovered);
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleConnectionTypeChange = async (type: DiscoveryFilterType) => {
        setSelectedConnectionType(type);
        if (showDiscoveryModal) {
            await handleDiscoverPrinters(type);
        }
    };

    const handleRefreshDiscovery = async () => {
        await handleDiscoverPrinters(selectedConnectionType);
    };

    const handleSelectPrinter = (printer: DiscoveredPrinter) => {
        setSelectedPrinter(printer);
    };

    const handleSaveSelectedPrinter = async () => {
        if (!selectedPrinter) {
            Notify.warning('Please select a printer first');
            return;
        }

        setIsSaving(true);
        try {
            const printerData: CreatePrinterRequest = {
                printerName: selectedPrinter.name,
                printerModel: selectedPrinter.model || selectedPrinter.manufacturer || undefined,
                printerType: selectedPrinter.type || 'THERMAL',
                connectionType: selectedPrinter.connectionType,
                connectionAddress: selectedPrinter.address || undefined,
                port: selectedPrinter.port || undefined,
                vendorId: selectedPrinter.vendorId || undefined,
                productId: selectedPrinter.productId || undefined,
                serialNumber: selectedPrinter.serialNumber || undefined,
                isDefault: false,
                isReceiptPrinter: true,
                isLabelPrinter: false,
                isKitchenPrinter: false,
                isReportPrinter: false,
            };

            await printerService.create(printerData);
            Notify.success(`Printer "${selectedPrinter.name}" added successfully`);
            setShowDiscoveryModal(false);
            setSelectedPrinter(null);
            setDiscoveredPrinters([]);
            await refreshPrinters();
        } catch (error: any) {
            console.error('Error saving printer:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to save printer';
            Notify.failure(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowDiscoveryModal(false);
        setSelectedPrinter(null);
        setDiscoveredPrinters([]);
        setSelectedConnectionType('ALL');
        setDiscoveryFilter('ALL');
    };

    const handleEdit = (printer: Printer) => {
        navigate(ROUTES.PRINTER_FORM, { state: { printerId: printer.printerId } });
    };

    const handleDelete = (printerId: string, printerName: string) => {
        Confirm.show(
            'Delete Printer',
            `Are you sure you want to delete the printer "${printerName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deletePrinter(printerId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleSetDefault = (printerId: string) => {
        Confirm.show(
            'Set Default Printer',
            'Are you sure you want to set this as the default printer?',
            'Yes, Set Default',
            'Cancel',
            async () => {
                await setDefault(printerId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#eab308',
                okButtonBackground: '#eab308',
            }
        );
    };

    const handleToggleActive = (printerId: string, isActive: boolean) => {
        if (isActive) {
            Confirm.show(
                'Deactivate Printer',
                'Are you sure you want to deactivate this printer?',
                'Yes, Deactivate',
                'Cancel',
                async () => {
                    await deactivatePrinter(printerId);
                },
                () => {
                    // do nothing
                },
                {
                    titleColor: '#ef4444',
                    okButtonBackground: '#ef4444',
                }
            );
        } else {
            Confirm.show(
                'Activate Printer',
                'Are you sure you want to activate this printer?',
                'Yes, Activate',
                'Cancel',
                async () => {
                    await activatePrinter(printerId);
                },
                () => {
                    // do nothing
                },
                {
                    titleColor: '#22c55e',
                    okButtonBackground: '#22c55e',
                }
            );
        }
    };

    const handleTestConnection = async (printerId: string) => {
        await testConnection(printerId);
    };

    const handlePrintTestPage = (printerId: string) => {
        Confirm.show(
            'Print Test Page',
            'Are you sure you want to print a test page?',
            'Yes, Print',
            'Cancel',
            async () => {
                await printTestPage(printerId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#8b5cf6',
                okButtonBackground: '#8b5cf6',
            }
        );
    };

    const columns = getPrinterColumns(
        handleEdit,
        handleDelete,
        handleSetDefault,
        handleToggleActive,
        handleTestConnection,
        handlePrintTestPage
    );

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Printers'
                    description='Manage your printer devices and print settings'
                    icon={<HiOutlinePrinter className="w-8 h-8 text-sky-600 dark:text-sky-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {
                                !isMobile && (
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                    />
                                )}

                            <Button
                                onClick={() => navigate(ROUTES.PRINT_JOBS)}
                                icon={ListTodo}
                                layout="outline"
                                theme='neutral'
                            >
                                {!isMobile && <span className='hidden md:block'>Print Jobs</span>}
                            </Button>

                            <Button
                                onClick={() => handleDiscoverPrinters()}
                                icon={Radar}
                                layout={isMobile ? 'outline' : 'primary'}
                                theme='primary'
                                disabled={isDiscovering}
                            >
                                {!isMobile && <span className='hidden md:block'>
                                    {isDiscovering ? 'Discovering...' : 'Discover Printers'}
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {
                        isMobile && (
                            <div className='m-4 mt-0'>
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            </div>
                        )
                    }
                </PageHeader>
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
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setPage(page);
                        setPerPage(newPerPage);
                    }}
                    onChangePage={setPage}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <Printer className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No printer(s) found matching your search.' : 'No printers found.'}
                            </p>
                        </div>
                    }
                />
            </div>

            {/* Discovered Printers Modal */}
            <CustomModal
                isOpen={showDiscoveryModal}
                onClose={handleCloseModal}
                title="Discover Printers"
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    {/* Connection Type Filter Tabs */}
                    <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-600">
                        {CONNECTION_TYPE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleConnectionTypeChange(option.value)}
                                disabled={isDiscovering}
                                className={`
                                    inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${selectedConnectionType === option.value
                                        ? 'bg-sky-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }
                                `}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                        <button
                            onClick={handleRefreshDiscovery}
                            disabled={isDiscovering}
                            className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh discovery"
                        >
                            <RefreshCw className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
                            {!isMobile && 'Refresh'}
                        </button>
                    </div>

                    {/* Discovery Status */}
                    {isDiscovering ? (
                        <div className="text-center py-12">
                            <Radar className="w-12 h-12 text-sky-500 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Discovering {discoveryFilter === 'ALL' ? 'all' : discoveryFilter.toLowerCase()} printers...
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                This may take a few seconds
                            </p>
                        </div>
                    ) : discoveredPrinters.length === 0 ? (
                        <div className="text-center py-8">
                            <Radar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No {discoveryFilter === 'ALL' ? '' : discoveryFilter.toLowerCase() + ' '}printers discovered.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Make sure your printers are turned on and connected.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Found {discoveredPrinters.length} {discoveryFilter === 'ALL' ? '' : discoveryFilter.toLowerCase() + ' '}printer(s). Select one to add.
                            </p>
                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {discoveredPrinters.map((printer, index) => (
                                    <div
                                        key={`${printer.name}-${index}`}
                                        onClick={() => handleSelectPrinter(printer)}
                                        className={`
                                            flex items-center justify-between p-4 rounded-lg border cursor-pointer
                                            transition-all duration-200
                                            ${selectedPrinter?.name === printer.name && selectedPrinter?.address === printer.address
                                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-500'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                p-2 rounded-full
                                                ${printer.isOnline
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                }
                                            `}>
                                                {getConnectionIcon(printer.connectionType)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {printer.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {printer.address && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {printer.address}{printer.port ? `:${printer.port}` : ''}
                                                        </span>
                                                    )}
                                                    {printer.manufacturer && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            • {printer.manufacturer}
                                                        </span>
                                                    )}
                                                    {printer.model && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            • {printer.model}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`
                                                        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                        ${printer.connectionType === 'USB'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                            : printer.connectionType === 'NETWORK' || printer.connectionType === 'WIFI'
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : printer.connectionType === 'BLUETOOTH'
                                                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }
                                                    `}>
                                                        {printer.connectionType}
                                                    </span>
                                                    {printer.type && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                            {printer.type}
                                                        </span>
                                                    )}
                                                    <span className={`
                                                        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                        ${printer.isOnline
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        }
                                                    `}>
                                                        {printer.isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedPrinter?.name === printer.name && selectedPrinter?.address === printer.address && (
                                            <div className="flex-shrink-0">
                                                <Check className="w-6 h-6 text-sky-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <Button
                                    onClick={handleCloseModal}
                                    layout="outline"
                                    theme="neutral"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveSelectedPrinter}
                                    theme="primary"
                                    disabled={!selectedPrinter || isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Add Printer'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </CustomModal>
        </AppLayout>
    );
};

export default PrinterManagement;
