import { Notify } from 'notiflix';
import { Modal } from '../../components';
import { HiOutlinePrinter, HiOutlineCheckCircle, HiOutlineRefresh } from 'react-icons/hi';
import { HiOutlineExclamationCircle, HiOutlineWifi } from 'react-icons/hi2';
import { useApp } from '../../context/AppProvider';
import printerService from '../../services/printer.service';
import IconLabelButton from '../../components/IconLabelButton';
import { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { FaWifi } from 'react-icons/fa';


const PrinterModal: FunctionComponent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { printerOptions, updatePrinterOptions } = useApp();
    const [printers, setPrinters] = useState<PrinterInfo[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfo | null>(null);

    const loadPrinters = async (showRefreshNotification = false) => {
        try {
            setIsLoading(true);
            const printers = await printerService.list();
            setPrinters(printers);

            if (printerOptions) {
                setSelectedPrinter(printerOptions);

                const printerExists = printers.some(p => p.name === printerOptions.name);
                if (!printerExists) {
                    // Notify.info('Previously selected printer is no longer available');
                }
            }

            if (showRefreshNotification) {
                // Notify.success('Printer list refreshed');
            }
        } catch (error) {
            // Notify.failure('Failed to load printers');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPrinters = async () => {
        setIsRefreshing(true);
        await loadPrinters(true);
        setIsRefreshing(false);
    };

    useEffect(() => {
        loadPrinters();
    }, []);

    const handlePrinterSelect = (printer: PrinterInfo) => {
        setSelectedPrinter(printer);
        updatePrinterOptions(printer);
        Notify.success(`${printer.name} set as default printer`);
    };

    const printerName = (name: string) => {
        return name ? (name.length > 20 ? `${name.substring(0, 20)}...` : name)
            : 'Select Printer'
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'online':
                return <HiOutlineWifi className="w-4 h-4 text-emerald-500" />;
            case 'offline':
                return <FaWifi className="w-4 h-4 text-gray-400" />;
            case 'busy':
                return <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />;
            case 'error':
                return <HiOutlineExclamationCircle className="w-4 h-4 text-red-500" />;
            default:
                return <HiOutlinePrinter className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'online':
                return 'Ready';
            case 'offline':
                return 'Offline';
            case 'busy':
                return 'Busy';
            case 'error':
                return 'Error';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'online':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'offline':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            case 'busy':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'network':
                return '🌐';
            case 'usb':
                return '🔌';
            case 'bluetooth':
                return '📶';
            default:
                return '🖨️';
        }
    };

    return (
        <Fragment>
            <IconLabelButton
                text={isLoading
                    ? 'Loading Printers...'
                    : printerName(printerOptions?.name || 'Select Printer')
                }
                icon={<HiOutlinePrinter className="w-5 h-5" />}
                color="bg-gradient-to-r from-emerald-400 to-green-500"
                iconColor="bg-emerald-600"
                onClick={() => setIsOpenForm(true)}
            />

            <Modal
                title="Printer Configuration"
                isOpen={isOpenForm}
                onClose={() => setIsOpenForm(false)}
                className="max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                                <HiOutlinePrinter className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Available Printers
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Select your default printer
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={refreshPrinters}
                            disabled={isRefreshing}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Refresh printer list"
                        >
                            <HiOutlineRefresh className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Printer List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading printers...</span>
                            </div>
                        ) : printers.length > 0 ? (
                            printers.map((printer, index) => (
                                <div
                                    key={index}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedPrinter && selectedPrinter.name === printer.name
                                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                                        }`}
                                    onClick={() => handlePrinterSelect(printer)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="text-2xl mt-1">
                                                {getTypeIcon(printer.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {printer.name}
                                                    </h4>
                                                    {selectedPrinter && selectedPrinter.name === printer.name && (
                                                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                    )}
                                                </div>

                                                {printer.model && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                        {printer.model}
                                                    </p>
                                                )}

                                                {printer.location && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        📍 {printer.location}
                                                    </p>
                                                )}

                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(printer.status)}
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(printer.status)}`}>
                                                        {getStatusText(printer.status)}
                                                    </span>
                                                    {printer.type && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                                                            {printer.type.charAt(0).toUpperCase() + printer.type.slice(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 ml-3">
                                            <input
                                                type="radio"
                                                checked={selectedPrinter && selectedPrinter.name === printer.name}
                                                onChange={() => {/* Handled by onClick */ }}
                                                className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                                    <HiOutlinePrinter className="w-full h-full" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No Printers Found
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Make sure your printers are connected and try refreshing the list.
                                </p>
                                <button
                                    onClick={refreshPrinters}
                                    disabled={isRefreshing}
                                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                >
                                    <HiOutlineRefresh className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh List
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Selected Printer Summary */}
                    {selectedPrinter && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                        Default Printer Set
                                    </p>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                        {selectedPrinter.name} is now your default printer
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => setIsOpenForm(false)}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                            Close
                        </button>
                        {selectedPrinter && (
                            <button
                                onClick={() => {
                                    setIsOpenForm(false);
                                    Notify.success(`Using ${selectedPrinter.name} as default printer`);
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Confirm Selection
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </Fragment>
    );
};

export default PrinterModal;