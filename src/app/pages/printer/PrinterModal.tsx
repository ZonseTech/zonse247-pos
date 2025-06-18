import { Notify } from 'notiflix';
import { Modal } from '../../components';
import { HiOutlinePrinter } from 'react-icons/hi';
import { useApp } from '../../context/AppProvider';
import printerService from '../../services/printer.service';
import IconLabelButton from '../../components/IconLabelButton';
import { Fragment, FunctionComponent, useEffect, useState } from 'react';

const PrinterModal: FunctionComponent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const { printerOptions, updatePrinterOptions } = useApp();
    const [printers, setPrinters] = useState<PrinterInfo[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfo | null>(null);

    const loadPrinters = async () => {
        try {
            setIsLoading(true);
            const printers = await printerService.list();
            setPrinters(printers);

            if (printerOptions) {
                setSelectedPrinter(printerOptions);

                const printerExists = printers.some(p => p.name === printerOptions.name);
                if (!printerExists) {
                    Notify.info('Previously selected printer is no longer available');
                }
            }
        } catch (error) {
            Notify.failure('Failed to load printers');
        } finally {
            setIsLoading(false);
        }
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
        return name ? (name.length > 15 ? `${name.substring(0, 15)}...` : name)
            : 'Printer'
    }

    return (
        <Fragment>
            <IconLabelButton
                text={isLoading
                    ? 'Loading'
                    : printerName(printerOptions?.name || 'Select Printer')
                }
                icon={<HiOutlinePrinter className="w-5 h-5" />}
                color="bg-green-400"
                iconColor="bg-green-500"
                onClick={() => setIsOpenForm(true)}
            />
            <Modal
                title="Printer"
                isOpen={isOpenForm}
                onClose={() => setIsOpenForm(false)}
                className="max-w-sm bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300"
            >
                <div className="flex flex-col gap-4">
                    {printers.length > 0 &&
                        printers.map((printer, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                                onClick={() => handlePrinterSelect(printer)}
                            >
                                <span className="text-sm font-semibold">{printer.name}</span>
                                <input
                                    type="radio"
                                    checked={selectedPrinter && selectedPrinter.name === printer.name}
                                    onChange={() => {/* Handled by onClick */ }}
                                    className="h-4 w-4 text-green-500 focus:ring-green-400"
                                />
                            </div>
                        ))}
                    {printers.length === 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">No printers available</span>
                            <input type="radio" disabled />
                        </div>
                    )}
                </div>
                {selectedPrinter && (
                    <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm font-medium text-green-600">Default printer: {selectedPrinter.name}</p>
                    </div>
                )}
            </Modal>
        </Fragment>
    );
};

export default PrinterModal;