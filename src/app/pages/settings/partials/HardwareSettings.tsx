import { FunctionComponent, useEffect, useState } from 'react';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { Field } from 'formik';
import printerService from '../../../services/printer.service';

interface PrinterOption {
    label: string;
    value: string;
}

const HardwareSettings: FunctionComponent = () => {
    const [printerOptions, setPrinterOptions] = useState<PrinterOption[]>([
        { label: 'No Printer Selected', value: '' }
    ]);
    const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);

    useEffect(() => {
        const loadPrinters = async () => {
            try {
                setIsLoadingPrinters(true);
                const printers = await printerService.list();
                const options: PrinterOption[] = [
                    { label: 'No Printer Selected', value: '' },
                    ...printers.map(printer => ({
                        label: printer.displayName || printer.name,
                        value: printer.name
                    }))
                ];
                setPrinterOptions(options);
            } catch (error) {
                console.error('Failed to load printers:', error);
            } finally {
                setIsLoadingPrinters(false);
            }
        };

        loadPrinters();
    }, []);

    const printerTypeOptions = [
        { label: 'Thermal Printer', value: 'thermal' },
        { label: 'Inkjet Printer', value: 'inkjet' },
        { label: 'Laser Printer', value: 'laser' },
        { label: 'No Printer', value: 'none' }
    ];

    const connectionTypeOptions = [
        { label: 'Bluetooth', value: 'BLUETOOTH' },
        { label: 'USB', value: 'USB' },
        { label: 'Network', value: 'NETWORK' }
    ];

    const paperSizeOptions = [
        { label: '58mm', value: '58mm' },
        { label: '80mm', value: '80mm' },
        { label: 'A4', value: 'A4' }
    ];

    const cardReaderTypeOptions = [
        { label: 'Magnetic Stripe', value: 'stripe' },
        { label: 'Chip Reader', value: 'chip' },
        { label: 'Contactless', value: 'contactless' },
        { label: 'All Types', value: 'all' }
    ];

    const cashDrawerOpenOptions = [
        { label: 'On Sale', value: 'sale' },
        { label: 'On Payment', value: 'payment' },
        { label: 'Manual Only', value: 'manual' }
    ];

    const barcodeScanModeOptions = [
        { label: 'Auto Scan', value: 'AUTO' },
        { label: 'Manual Entry', value: 'MANUAL' },
        { label: 'Both', value: 'BOTH' }
    ];

    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Hardware & Peripherals
            </h2>

            <FormWrapper>
                {/* Printer Configuration */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Printer Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelectBox
                            label="Printer Type"
                            name="printerType"
                            options={printerTypeOptions}
                            required
                        />

                        <FormSelectBox
                            label="Connection Type"
                            name="printerConnectionType"
                            options={connectionTypeOptions}
                            required
                        />

                        <FormSelectBox
                            label="Printer Name"
                            name="printerName"
                            options={printerOptions}
                            disabled={isLoadingPrinters}
                        />

                        <FormSelectBox
                            label="Paper Size"
                            name="paperSize"
                            options={paperSizeOptions}
                            required
                        />

                        <FormInput
                            type="number"
                            name="printerPaperWidth"
                            label="Paper Width (mm)"
                            placeholder="80"
                            min="58"
                            max="216"
                        />

                        <FormInput
                            type="number"
                            name="receiptCopies"
                            label="Receipt Copies"
                            placeholder="1"
                            min="1"
                            max="5"
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Print Receipt
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically print after transaction
                                </p>
                            </div>
                            <Field type="checkbox" name="autoPrintReceipt" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Duplicate Receipt
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow printing duplicate receipts
                                </p>
                            </div>
                            <Field type="checkbox" name="printDuplicateReceipt" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Itemized Receipt
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Show all items on receipt
                                </p>
                            </div>
                            <Field type="checkbox" name="printItemizedReceipt" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Kitchen & Bar Printers */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Kitchen & Bar Printers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Order to Kitchen
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Send food orders to kitchen printer
                                </p>
                            </div>
                            <Field type="checkbox" name="printOrderKitchen" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Order to Bar
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Send drink orders to bar printer
                                </p>
                            </div>
                            <Field type="checkbox" name="printOrderBar" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="Kitchen Printer Name"
                            name="kitchenPrinterName"
                            options={printerOptions}
                            disabled={isLoadingPrinters}
                        />

                        <FormSelectBox
                            label="Bar Printer Name"
                            name="barPrinterName"
                            options={printerOptions}
                            disabled={isLoadingPrinters}
                        />
                    </div>
                </div>

                {/* Cash Drawer */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Cash Drawer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Cash Drawer
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Connect and use cash drawer
                                </p>
                            </div>
                            <Field type="checkbox" name="enableCashDrawer" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="Cash Drawer Opens On"
                            name="cashDrawerOpenOn"
                            options={cashDrawerOpenOptions}
                        />

                        <FormInput
                            type="text"
                            name="cashDrawerOpenCode"
                            label="Cash Drawer Open Code"
                            placeholder="ESC p m t1 t2"
                            className="md:col-span-2"
                        />
                    </div>
                </div>

                {/* Barcode Scanner */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Barcode Scanner
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Barcode Scanner
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Use barcode scanner for products
                                </p>
                            </div>
                            <Field type="checkbox" name="enableBarcodeScanner" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="Barcode Scan Mode"
                            name="barcodeScanMode"
                            options={barcodeScanModeOptions}
                        />

                        <FormInput
                            type="text"
                            name="barcodeScannerPrefix"
                            label="Scanner Prefix"
                            placeholder="Optional prefix for barcodes"
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Scanner Beep Enabled
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Play sound on successful scan
                                </p>
                            </div>
                            <Field type="checkbox" name="scannerBeepEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Scanner Vibration
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Vibrate on successful scan
                                </p>
                            </div>
                            <Field type="checkbox" name="scannerVibrationEnabled" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Card Reader */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Card Reader
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Card Reader
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Accept card payments
                                </p>
                            </div>
                            <Field type="checkbox" name="enableCardReader" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="Card Reader Type"
                            name="cardReaderType"
                            options={cardReaderTypeOptions}
                        />
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default HardwareSettings;
